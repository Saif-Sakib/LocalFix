// server/controllers/workerController.js
const { executeQuery } = require('../config/database');

const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

async function getMyApplications(req, res) {
  // Add safety check for req.user
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: "Authentication required. User not found." });
  }

  const worker_id = req.user.user_id;

  const query = `
    SELECT
        i.issue_id,
        i.title,
        TO_CHAR(i.description) as description,
        i.category,
        i.priority,
        i.status,
        i.image_url,
        l.full_address,
        l.upazila,
        l.district,
        c.name as citizen_name,
        c.phone as citizen_phone,
        a.applied_at,
        a.status as application_status,
        a.estimated_cost,
        a.estimated_time,
        TO_CHAR(a.proposal_description) as my_proposal,
        TO_CHAR(a.feedback) as admin_feedback,
        i.updated_at as assigned_date
    FROM applications a
    JOIN issues i ON a.issue_id = i.issue_id
    JOIN users c ON i.citizen_id = c.user_id
    JOIN locations l ON i.location_id = l.location_id
    WHERE a.worker_id = :worker_id
    
    UNION
    
    SELECT
        i.issue_id,
        i.title,
        TO_CHAR(i.description) as description,
        i.category,
        i.priority,
        i.status,
        i.image_url,
        l.full_address,
        l.upazila,
        l.district,
        c.name as citizen_name,
        c.phone as citizen_phone,
        CAST(NULL AS TIMESTAMP) as applied_at,
        CAST(NULL AS VARCHAR2(20)) as application_status,
        CAST(NULL AS NUMBER) as estimated_cost,
        CAST(NULL AS VARCHAR2(50)) as estimated_time,
        CAST(NULL AS VARCHAR2(4000)) as my_proposal,
        CAST(NULL AS VARCHAR2(4000)) as admin_feedback,
        i.updated_at as assigned_date
    FROM issues i
    JOIN users c ON i.citizen_id = c.user_id
    JOIN locations l ON i.location_id = l.location_id
    WHERE i.assigned_worker_id = :worker_id 
      AND i.status IN ('assigned', 'in_progress', 'under_review', 'resolved')
      AND NOT EXISTS (
        SELECT 1 FROM applications a2 
        WHERE a2.issue_id = i.issue_id AND a2.worker_id = :worker_id
      )
    ORDER BY assigned_date DESC
  `;

  try {
    const result = await executeQuery(query, { worker_id });

    if (result.success) {
      const applications = result.rows.map(app => ({
        id: app.ISSUE_ID,
        title: app.TITLE,
        location: app.FULL_ADDRESS,
        upazila: app.UPAZILA,
        district: app.DISTRICT,
        category: app.CATEGORY,
        priority: app.PRIORITY,
        status: app.STATUS,
        applicationStatus: app.APPLICATION_STATUS,
        estimatedCost: app.ESTIMATED_COST ? parseFloat(app.ESTIMATED_COST) : null,
        estimatedTime: app.ESTIMATED_TIME,
        appliedDate: app.APPLIED_AT ? new Date(app.APPLIED_AT).toISOString().split('T')[0] : null,
        assignedDate: app.ASSIGNED_DATE ? new Date(app.ASSIGNED_DATE).toISOString().split('T')[0] : null,
        myProposal: app.MY_PROPOSAL,
        adminFeedback: app.ADMIN_FEEDBACK,
        description: app.DESCRIPTION,
        citizenName: app.CITIZEN_NAME,
        citizenContact: app.CITIZEN_PHONE,
        imageUrl: app.IMAGE_URL
      }));
      res.json({ applications });
    } else {
      res.status(500).json({ message: "Error fetching applications", error: getErrorMessage(result.error) });
    }
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ message: "Internal server error", error: getErrorMessage(err) });
  }
}

async function updateProofProgress(req, res) {
  // Add safety check for req.user
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: "Authentication required. User not found." });
  }

  const worker_id = req.user.user_id;
  const { issueId } = req.body;

  // Validate input
  if (!issueId) {
    return res.status(400).json({ message: "Issue ID is required" });
  }

  try {
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

// Additional function to submit proof based on your database schema
async function submitProof(req, res) {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: "Authentication required. User not found." });
  }

  const worker_id = req.user.user_id;
  const { issueId, proofDescription, proofPhoto } = req.body;

  // Validate input
  if (!issueId || !proofDescription) {
    return res.status(400).json({ message: "Issue ID and proof description are required" });
  }

  try {
    // Insert proof into issue_proofs table
    const insertResult = await executeQuery(
      `INSERT INTO issue_proofs (issue_id, worker_id, proof_description, proof_photo)
       VALUES (:issueId, :worker_id, :proofDescription, :proofPhoto)`,
      { 
        issueId, 
        worker_id, 
        proofDescription,
        proofPhoto: proofPhoto || null
      }
    );

    if (!insertResult.success) {
      return res.status(500).json({ 
        message: "Failed to submit proof", 
        error: getErrorMessage(insertResult.error) 
      });
    }

    res.json({ message: 'Proof submitted successfully! Issue is now under review.' });

  } catch (err) {
    console.error("Error in submitProof:", err);
    res.status(500).json({ message: "Internal server error", error: getErrorMessage(err) });
  }
}

// Function to apply for an issue
async function applyForIssue(req, res) {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: "Authentication required. User not found." });
  }

  const worker_id = req.user.user_id;
  const { issueId, estimatedCost, estimatedTime, proposalDescription } = req.body;

  // Validate input
  if (!issueId || !estimatedCost || !estimatedTime) {
    return res.status(400).json({ 
      message: "Issue ID, estimated cost, and estimated time are required" 
    });
  }

  try {
    // Insert application
    const insertResult = await executeQuery(
      `INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description)
       VALUES (:issueId, :worker_id, :estimatedCost, :estimatedTime, :proposalDescription)`,
      { 
        issueId, 
        worker_id, 
        estimatedCost,
        estimatedTime,
        proposalDescription: proposalDescription || null
      }
    );

    if (!insertResult.success) {
      return res.status(500).json({ 
        message: "Failed to submit application", 
        error: getErrorMessage(insertResult.error) 
      });
    }

    // Update issue status to 'applied' if it's currently 'submitted'
    await executeQuery(
      `UPDATE issues 
       SET status = 'applied', updated_at = CURRENT_TIMESTAMP 
       WHERE issue_id = :issueId AND status = 'submitted'`,
      { issueId }
    );

    res.json({ message: 'Application submitted successfully!' });

  } catch (err) {
    console.error("Error in applyForIssue:", err);
    res.status(500).json({ message: "Internal server error", error: getErrorMessage(err) });
  }
}

module.exports = {
  getMyApplications,
  updateProofProgress,
  submitProof,
  applyForIssue
};