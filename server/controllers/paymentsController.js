const oracledb = require('oracledb');
const { executeQuery, getConnection } = require('../config/database');

const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);

// Get list of approved proofs that aren't paid yet, to pay workers
async function getPendingPayments(req, res) {
  try {
    const result = await executeQuery(
      `SELECT 
        i.issue_id,
        i.title as issue_title,
        i.citizen_id,
        i.assigned_worker_id as worker_id,
        u.name as worker_name,
        ip.proof_id,
        ip.verified_at as completion_date,
        -- Use estimated_cost from accepted application as payable amount
        (SELECT a.estimated_cost 
           FROM applications a 
          WHERE a.issue_id = i.issue_id AND a.status = 'accepted' 
          FETCH FIRST 1 ROWS ONLY) AS amount
      FROM issues i
      JOIN issue_proofs ip ON ip.issue_id = i.issue_id AND ip.verification_status = 'approved'
      JOIN users u ON u.user_id = i.assigned_worker_id
      WHERE i.status = 'resolved'
        AND NOT EXISTS (
          SELECT 1 FROM payments p WHERE p.issue_id = i.issue_id
        )
      ORDER BY ip.verified_at DESC`
    );

    if (!result.success) {
      return res.status(500).json({ message: 'Failed to fetch pending payments', error: getErrorMessage(result.error) });
    }

    const items = result.rows.map(r => ({
      issueId: r.ISSUE_ID,
      workDescription: r.ISSUE_TITLE,
      workerId: r.WORKER_ID,
      workerName: r.WORKER_NAME,
      completionDate: r.COMPLETION_DATE,
      cost: parseFloat(r.AMOUNT || 0),
      status: 'Pending Payment',
      proofId: r.PROOF_ID,
      citizenId: r.CITIZEN_ID
    })).filter(i => i.cost > 0);

    // Simple summary
    const remainingBalance = items.reduce((sum, it) => sum + it.cost, 0);

    res.json({
      remainingBalance,
      currency: 'BDT',
      workItems: items
    });
  } catch (err) {
    console.error('Error in getPendingPayments:', err);
    res.status(500).json({ message: 'Internal server error', error: getErrorMessage(err) });
  }
}

// Create payment records for a set of issue_ids (bulk pay)
async function createPayments(req, res) {
  const admin_id = req.user.user_id; // not used now, could be stored if needed
  const { payments } = req.body; // [{ issueId, proofId, workerId, citizenId, amount, method }]

  if (!Array.isArray(payments) || payments.length === 0) {
    return res.status(400).json({ message: 'No payments provided' });
  }

  let connection;
  try {
    connection = await getConnection();

    for (const p of payments) {
      if (!p.issueId || !p.workerId || !p.citizenId || !p.amount) {
        await connection.rollback();
        return res.status(400).json({ message: 'Missing fields in payment item' });
      }

      // Insert payment as completed (simulate instant success). Could be 2-step: pending -> completed after gateway.
      await connection.execute(
        `INSERT INTO payments (issue_id, citizen_id, worker_id, amount, payment_method, payment_status, transaction_id, payment_date)
         VALUES (:issue_id, :citizen_id, :worker_id, :amount, :method, 'completed', :tx, SYSTIMESTAMP)`,
        {
          issue_id: p.issueId,
          citizen_id: p.citizenId,
          worker_id: p.workerId,
          amount: parseFloat(p.amount),
          method: p.method || 'bkash',
          tx: 'TX-' + Date.now() + '-' + Math.floor(Math.random() * 1e6)
        },
        { autoCommit: false }
      );
      // DB trigger will set issues.status = 'closed' on completed
    }

    await connection.commit();

    res.status(201).json({ message: 'Payments processed successfully', count: payments.length });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (_) {}
    }
    console.error('Error in createPayments:', err);
    res.status(500).json({ message: 'Failed to process payments', error: getErrorMessage(err) });
  } finally {
    if (connection) { try { await connection.close(); } catch (_) {} }
  }
}

// Worker: get summary (current balance, total earnings, recent incomes)
async function getWorkerSummary(req, res) {
  const worker_id = req.user.user_id;
  try {
    // Total earnings = sum of completed payments to this worker
    const totals = await executeQuery(
      `SELECT 
         NVL(SUM(CASE WHEN payment_status = 'completed' THEN amount END), 0) AS total_earnings,
         NVL(SUM(CASE WHEN payment_status IN ('pending','processing') THEN amount END), 0) AS pending_amount
       FROM payments
       WHERE worker_id = :worker_id`,
      { worker_id }
    );

    if (!totals.success) {
      return res.status(500).json({ message: 'Failed to fetch totals', error: getErrorMessage(totals.error) });
    }
    const totalEarnings = parseFloat(totals.rows[0].TOTAL_EARNINGS || 0);
    const pendingAmount = parseFloat(totals.rows[0].PENDING_AMOUNT || 0);

    // Recent incomes (last 10 payments)
    const incomesRes = await executeQuery(
      `SELECT p.issue_id, p.amount, p.payment_date, i.title
         FROM payments p
         JOIN issues i ON i.issue_id = p.issue_id
        WHERE p.worker_id = :worker_id AND p.payment_status = 'completed'
        ORDER BY p.payment_date DESC FETCH FIRST 10 ROWS ONLY`,
      { worker_id }
    );

    const recentIncomes = (incomesRes.rows || []).map((r, idx) => ({
      id: idx + 1,
      description: r.TITLE,
      amount: parseFloat(r.AMOUNT || 0),
      date: r.PAYMENT_DATE,
      status: 'Completed',
      issueId: r.ISSUE_ID
    }));

    // Current balance = total completed payments - total successful withdrawals
    const wTotals = await executeQuery(
      `SELECT 
         NVL(SUM(CASE WHEN status IN ('successful','processing') THEN amount END), 0) AS withdrawn
       FROM withdrawals
       WHERE worker_id = :worker_id`,
      { worker_id }
    );
    const withdrawn = wTotals.success ? parseFloat(wTotals.rows[0].WITHDRAWN || 0) : 0;
    const currentBalance = Math.max(0, totalEarnings - withdrawn);

    res.json({
      currentBalance,
      totalEarnings,
      currency: 'BDT',
      recentIncomes
    });
  } catch (err) {
    console.error('Error in getWorkerSummary:', err);
    res.status(500).json({ message: 'Internal server error', error: getErrorMessage(err) });
  }
}

// Worker: create a withdrawal request
async function createWithdrawal(req, res) {
  const worker_id = req.user.user_id;
  const { method, accountNumber, amount } = req.body;
  const methods = ['bkash', 'nagad', 'rocket', 'sonali_bank'];
  try {
    if (!methods.includes(method)) {
      return res.status(400).json({ message: 'Invalid method' });
    }
    const amt = parseFloat(amount);
    if (!accountNumber || !amt || amt <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal request' });
    }

    // Compute available balance similar to getWorkerSummary
    const totals = await executeQuery(
      `SELECT NVL(SUM(CASE WHEN payment_status = 'completed' THEN amount END), 0) AS total_earnings
       FROM payments WHERE worker_id = :worker_id`,
      { worker_id }
    );
    const totalEarnings = totals.success ? parseFloat(totals.rows[0].TOTAL_EARNINGS || 0) : 0;
    const wTotals = await executeQuery(
      `SELECT NVL(SUM(CASE WHEN status IN ('successful','processing') THEN amount END), 0) AS withdrawn
       FROM withdrawals WHERE worker_id = :worker_id`,
      { worker_id }
    );
    const withdrawn = wTotals.success ? parseFloat(wTotals.rows[0].WITHDRAWN || 0) : 0;
    const available = Math.max(0, totalEarnings - withdrawn);
    if (amt > available) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const result = await executeQuery(
      `INSERT INTO withdrawals (worker_id, method, account_number, amount, status, requested_at)
       VALUES (:worker_id, :method, :account, :amount, 'processing', SYSTIMESTAMP)`,
      { worker_id, method, account: accountNumber, amount: amt }
    );
    if (!result.success) {
      return res.status(500).json({ message: 'Failed to create withdrawal', error: getErrorMessage(result.error) });
    }
    res.status(201).json({ message: 'Withdrawal request submitted', amount: amt });
  } catch (err) {
    console.error('Error in createWithdrawal:', err);
    res.status(500).json({ message: 'Internal server error', error: getErrorMessage(err) });
  }
}

// Worker: list recent withdrawals
async function getWorkerWithdrawals(req, res) {
  const worker_id = req.user.user_id;
  try {
    const result = await executeQuery(
      `SELECT withdrawal_id, method, account_number, amount, status, requested_at, processed_at, transaction_id
         FROM withdrawals
        WHERE worker_id = :worker_id
        ORDER BY requested_at DESC FETCH FIRST 10 ROWS ONLY`,
      { worker_id }
    );
    if (!result.success) {
      return res.status(500).json({ message: 'Failed to fetch withdrawals', error: getErrorMessage(result.error) });
    }
    const withdrawals = result.rows.map((r) => ({
      id: r.WITHDRAWAL_ID,
      method: r.METHOD,
      accountNumber: r.ACCOUNT_NUMBER,
      amount: parseFloat(r.AMOUNT || 0),
      date: r.REQUESTED_AT,
      status: (r.STATUS || '').charAt(0).toUpperCase() + (r.STATUS || '').slice(1),
      transactionId: r.TRANSACTION_ID
    }));
    res.json({ withdrawals });
  } catch (err) {
    console.error('Error in getWorkerWithdrawals:', err);
    res.status(500).json({ message: 'Internal server error', error: getErrorMessage(err) });
  }
}

module.exports = {
  getPendingPayments,
  createPayments,
  getWorkerSummary,
  createWithdrawal,
  getWorkerWithdrawals
};

