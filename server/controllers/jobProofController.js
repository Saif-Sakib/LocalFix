// server/controllers/jobProofController.js
const { executeQuery } = require('../config/database');

const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

async function submitProof(req, res) {
  const worker_id = req.user.user_id;
  const { issueId, comment } = req.body;

  if (!issueId || !req.file) {
    return res.status(400).json({ message: "Missing issueId or proof image." });
  }

  const proof_photo_url = `/uploads/proofs/${req.file.filename}`;

  try {
    // Verify worker is assigned to this issue
    const issueResult = await executeQuery(
      `SELECT assigned_worker_id, status FROM issues WHERE issue_id = :issueId`,
      { issueId }
    );
    
    if (!issueResult.success || issueResult.rows.length === 0) {
        return res.status(404).json({ message: 'Issue not found.' });
    }

    const issue = issueResult.rows[0];
    if (issue.ASSIGNED_WORKER_ID !== worker_id) {
        return res.status(403).json({ message: 'You are not assigned to this issue.' });
    }

    if (!['assigned', 'in_progress'].includes(issue.STATUS)) {
        return res.status(400).json({ message: `Cannot submit proof for an issue with status '${issue.STATUS}'.` });
    }

    // Check if proof already exists for this issue
    const existingProofResult = await executeQuery(
      `SELECT proof_id FROM issue_proofs WHERE issue_id = :issueId`,
      { issueId }
    );

    if (existingProofResult.success && existingProofResult.rows.length > 0) {
        return res.status(400).json({ message: 'Proof has already been submitted for this issue.' });
    }

    // Insert into issue_proofs table (trigger will handle status update automatically)
    const insertResult = await executeQuery(
      `INSERT INTO issue_proofs (issue_id, worker_id, proof_photo, proof_description)
       VALUES (:issue_id, :worker_id, :proof_photo, :proof_description)`,
      {
        issue_id: issueId,
        worker_id: worker_id,
        proof_photo: proof_photo_url,
        proof_description: comment || 'No comment provided.'
      }
    );

    if (!insertResult.success) {
        return res.status(500).json({ 
            message: "Failed to submit proof", 
            error: getErrorMessage(insertResult.error) 
        });
    }

    res.status(201).json({ 
        message: 'Proof submitted successfully! The issue is now under review.',
        proofId: insertResult.outBinds?.proof_id || 'Generated'
    });

  } catch (err) {
    console.error("Error in submitProof:", err);
    res.status(500).json({ message: "Internal server error", error: getErrorMessage(err) });
  }
}

async function getProofStatus(req, res) {
  const worker_id = req.user.user_id;
  const { issueId } = req.params;

  try {
    const query = `
      SELECT 
        ip.proof_id,
        ip.proof_photo,
        TO_CHAR(ip.proof_description) as proof_description,
        ip.submitted_at,
        ip.verified_at,
        ip.verification_status,
        TO_CHAR(ip.admin_feedback) as admin_feedback,
        u.name as admin_name,
        i.title as issue_title,
        i.status as issue_status
      FROM issue_proofs ip
      JOIN issues i ON ip.issue_id = i.issue_id
      LEFT JOIN users u ON ip.verified_by = u.user_id
      WHERE ip.issue_id = :issueId AND ip.worker_id = :worker_id
    `;

    const result = await executeQuery(query, { issueId, worker_id });

    if (!result.success) {
        return res.status(500).json({ 
            message: "Error fetching proof status", 
            error: getErrorMessage(result.error) 
        });
    }

    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No proof found for this issue.' });
    }

    const proof = result.rows[0];
    res.json({
        proofId: proof.PROOF_ID,
        proofPhoto: proof.PROOF_PHOTO,
        description: proof.PROOF_DESCRIPTION,
        submittedAt: proof.SUBMITTED_AT,
        verifiedAt: proof.VERIFIED_AT,
        verificationStatus: proof.VERIFICATION_STATUS,
        adminFeedback: proof.ADMIN_FEEDBACK,
        adminName: proof.ADMIN_NAME,
        issueTitle: proof.ISSUE_TITLE,
        issueStatus: proof.ISSUE_STATUS
    });

  } catch (err) {
    console.error("Error in getProofStatus:", err);
    res.status(500).json({ message: "Internal server error", error: getErrorMessage(err) });
  }
}

async function updateProofProgress(req, res) {
  const worker_id = req.user.user_id;
  const { issueId } = req.body;

  try {
    // Update issue status to 'in_progress'
    const updateResult = await executeQuery(
      `UPDATE issues 
       SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP 
       WHERE issue_id = :issueId AND assigned_worker_id = :worker_id AND status = 'assigned'`,
      { issueId, worker_id }
    );

    if (!updateResult.success) {
        return res.status(500).json({ 
            message: "Failed to update progress", 
            error: getErrorMessage(updateResult.error) 
        });
    }

    if (updateResult.rowsAffected === 0) {
        return res.status(400).json({ 
            message: 'Cannot update progress. Issue may not be assigned to you or already in progress.' 
        });
    }

    res.json({ message: 'Issue marked as in progress successfully!' });

  } catch (err) {
    console.error("Error in updateProofProgress:", err);
    res.status(500).json({ message: "Internal server error", error: getErrorMessage(err) });
  }
}

module.exports = { 
  submitProof,
  getProofStatus,
  updateProofProgress
};