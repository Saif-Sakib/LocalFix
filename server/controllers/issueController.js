const oracledb = require('oracledb');
const { executeQuery, getConnection } = require('../config/database');

// Helper to create a serializable error message
const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

async function createIssue(req, res) {
  // Assumes an authentication middleware has added the user to the request object.
  // This is more secure than accepting citizen_id from the request body.
  const citizen_id = req.user.user_id; 

  const {
    title,
    description,
    category,
    priority = 'medium',
    full_address,
    upazila,
    district,
    image_url,
  } = req.body;

  if (!citizen_id || !title || !description || !category || !full_address || !upazila || !district) {
    return res.status(400).json({ 
      message: "Missing required fields: title, description, category, full_address, upazila, district" 
    });
  }

  let connection;
  try {
    connection = await getConnection();

    // 1. Create the location and get its new ID
    const locationResult = await connection.execute(
      `INSERT INTO locations (upazila, district, full_address)
       VALUES (:upazila, :district, :full_address)
       RETURNING location_id INTO :new_location_id`,
      { 
        upazila, 
        district, 
        full_address,
        new_location_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: false }
    );

    const location_id = locationResult.outBinds.new_location_id[0];
    if (!location_id) {
        throw new Error('Failed to create location entry.');
    }

    // 2. Create the issue using the new location_id
    const issueResult = await connection.execute(
      `INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url) 
       VALUES (:citizen_id, :title, :description, :category, :priority, :location_id, :image_url)`,
      { citizen_id, title, description, category, priority, location_id, image_url: image_url || null },
      { autoCommit: false }
    );

    // If both inserts are successful, commit the transaction
    await connection.commit();

    res.status(201).json({ 
      message: "Issue submitted successfully!",
      rowsAffected: issueResult.rowsAffected,
      fileUrl: image_url || null
    });

  } catch (err) {
    // If any error occurs, rollback the entire transaction
    if (connection) {
      await connection.rollback();
    }
    console.error("Error in createIssue:", err);
    res.status(500).json({ message: "Internal server error occurred", error: getErrorMessage(err) });
  } finally {
    // Always close the connection
    if (connection) {
      await connection.close();
    }
  }
}

async function getAllIssues(req, res) {
  try {
    const result = await executeQuery(
      `SELECT 
        i.issue_id, i.title, i.description, i.category, i.priority, i.image_url, i.status,
        i.created_at, i.updated_at, u.name as citizen_name, u.email as citizen_email,
        u.phone as citizen_phone, l.full_address as location_address, l.upazila,
        l.district, l.latitude, l.longitude
      FROM issues i
      LEFT JOIN users u ON i.citizen_id = u.user_id
      LEFT JOIN locations l ON i.location_id = l.location_id
      ORDER BY i.created_at DESC`
    );

    if (result.success) {
      const issues = result.rows.map((issue) => ({
        ID: issue.ISSUE_ID,
        TITLE: issue.TITLE,
        DESCRIPTION: issue.DESCRIPTION,
        CATEGORY: issue.CATEGORY,
        PRIORITY: issue.PRIORITY,
        IMAGE_URL: issue.IMAGE_URL,
        STATUS: issue.STATUS,
        CREATED_AT: issue.CREATED_AT ? new Date(issue.CREATED_AT).toISOString() : null,
        UPDATED_AT: issue.UPDATED_AT ? new Date(issue.UPDATED_AT).toISOString() : null,
        CITIZEN_NAME: issue.CITIZEN_NAME,
        CITIZEN_EMAIL: issue.CITIZEN_EMAIL,
        CITIZEN_PHONE: issue.CITIZEN_PHONE,
        LOCATION: issue.LOCATION_ADDRESS,
        UPAZILA: issue.UPAZILA,
        DISTRICT: issue.DISTRICT,
        LATITUDE: issue.LATITUDE,
        LONGITUDE: issue.LONGITUDE
      }));
      res.json({ issues });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error fetching issues",
        error: errorMessage 
      });
    }
  } catch (err) {
    console.error("Error in getAllIssues:", err);
    res.status(500).json({ message: "Internal server error occurred" });
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    const result = await executeQuery(
      `SELECT 
        i.issue_id, i.title, i.description, i.category, i.priority, i.image_url, i.status,
        i.created_at, i.updated_at, u.name as citizen_name, u.email as citizen_email,
        u.phone as citizen_phone, l.full_address as location_address, l.upazila,
        l.district, l.latitude, l.longitude
      FROM issues i
      LEFT JOIN users u ON i.citizen_id = u.user_id
      LEFT JOIN locations l ON i.location_id = l.location_id
      WHERE i.issue_id = :id`, { id }
    );

    if (result.success) {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Issue not found" });
      }
      const issue = result.rows[0];
      const formattedIssue = {
        ID: issue.ISSUE_ID,
        TITLE: issue.TITLE,
        DESCRIPTION: issue.DESCRIPTION,
        CATEGORY: issue.CATEGORY,
        PRIORITY: issue.PRIORITY,
        IMAGE_URL: issue.IMAGE_URL,
        STATUS: issue.STATUS,
        CREATED_AT: issue.CREATED_AT ? new Date(issue.CREATED_AT).toISOString() : null,
        UPDATED_AT: issue.UPDATED_AT ? new Date(issue.UPDATED_AT).toISOString() : null,
        CITIZEN_NAME: issue.CITIZEN_NAME,
        CITIZEN_EMAIL: issue.CITIZEN_EMAIL,
        CITIZEN_PHONE: issue.CITIZEN_PHONE,
        LOCATION: issue.LOCATION_ADDRESS,
        UPAZILA: issue.UPAZILA,
        DISTRICT: issue.DISTRICT,
        LATITUDE: issue.LATITUDE,
        LONGITUDE: issue.LONGITUDE
      };
      res.json({ issue: formattedIssue });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error fetching issue",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in getIssueById:", err);
    res.status(500).json({ message: "Internal server error occurred" });
  }
}

async function updateIssueStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const validStatuses = ['submitted', 'applied', 'assigned', 'in_progress', 'under_review', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be one of: " + validStatuses.join(', ')
      });
    }

    const result = await executeQuery(
      `UPDATE issues SET status = :status WHERE issue_id = :id`, { status, id }
    );

    if (result.success) {
      if (result.rowsAffected === 0) {
        return res.status(404).json({ message: "Issue not found" });
      }
      res.json({ 
        message: "Issue status updated successfully!",
        rowsAffected: result.rowsAffected
      });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error updating issue status",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in updateIssueStatus:", err);
    res.status(500).json({ message: "Internal server error occurred" });
  }
}

async function updateIssue(req, res) {
  const { id } = req.params;
  const { title, description, category, priority, location_id, image_url, status } = req.body;
  try {
    const updateFields = [];
    const binds = { id };
    if (title !== undefined) { updateFields.push('title = :title'); binds.title = title; }
    if (description !== undefined) { updateFields.push('description = :description'); binds.description = description; }
    if (category !== undefined) { updateFields.push('category = :category'); binds.category = category; }
    if (priority !== undefined) { updateFields.push('priority = :priority'); binds.priority = priority; }
    if (location_id !== undefined) { updateFields.push('location_id = :location_id'); binds.location_id = location_id; }
    if (image_url !== undefined) { updateFields.push('image_url = :image_url'); binds.image_url = image_url; }
    if (status !== undefined) { updateFields.push('status = :status'); binds.status = status; }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const sql = `UPDATE issues SET ${updateFields.join(', ')} WHERE issue_id = :id`;
    const result = await executeQuery(sql, binds);

    if (result.success) {
      if (result.rowsAffected === 0) {
        return res.status(404).json({ message: "Issue not found" });
      }
      res.json({ message: "Issue updated successfully!", rowsAffected: result.rowsAffected });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error updating issue",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in updateIssue:", err);
    res.status(500).json({ message: "Internal server error occurred" });
  }
}

async function deleteIssue(req, res) {
  const { id } = req.params;
  try {
    const result = await executeQuery(`DELETE FROM issues WHERE issue_id = :id`, { id });

    if (result.success) {
      if (result.rowsAffected === 0) {
        return res.status(404).json({ message: "Issue not found" });
      }
      res.json({ message: "Issue deleted successfully!", rowsAffected: result.rowsAffected });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error deleting issue",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in deleteIssue:", err);
    res.status(500).json({ message: "Internal server error occurred" });
  }
}

async function getIssuesByCategory(req, res) {
  const { category } = req.params;
  try {
    const result = await executeQuery(
      `SELECT 
        i.issue_id, i.title, i.description, i.category, i.priority, i.image_url, i.status,
        i.created_at, i.updated_at, u.name as citizen_name, l.full_address as location_address,
        l.upazila, l.district
      FROM issues i
      LEFT JOIN users u ON i.citizen_id = u.user_id
      LEFT JOIN locations l ON i.location_id = l.location_id
      WHERE LOWER(i.category) = LOWER(:category)
      ORDER BY i.created_at DESC`, { category }
    );

    if (result.success) {
      const issues = result.rows.map((issue) => ({
        ID: issue.ISSUE_ID,
        TITLE: issue.TITLE,
        DESCRIPTION: issue.DESCRIPTION,
        CATEGORY: issue.CATEGORY,
        PRIORITY: issue.PRIORITY,
        IMAGE_URL: issue.IMAGE_URL,
        STATUS: issue.STATUS,
        CREATED_AT: issue.CREATED_AT ? new Date(issue.CREATED_AT).toISOString() : null,
        UPDATED_AT: issue.UPDATED_AT ? new Date(issue.UPDATED_AT).toISOString() : null,
        CITIZEN_NAME: issue.CITIZEN_NAME,
        LOCATION: issue.LOCATION_ADDRESS,
        UPAZILA: issue.UPAZILA,
        DISTRICT: issue.DISTRICT
      }));
      res.json({ issues });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error fetching issues by category",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in getIssuesByCategory:", err);
    res.status(500).json({ message: "Internal server error occurred" });
  }
}

async function getIssuesByStatus(req, res) {
  const { status } = req.params;
  try {
    const result = await executeQuery(
      `SELECT 
        i.issue_id, i.title, i.description, i.category, i.priority, i.image_url, i.status,
        i.created_at, i.updated_at, u.name as citizen_name, l.full_address as location_address,
        l.upazila, l.district
      FROM issues i
      LEFT JOIN users u ON i.citizen_id = u.user_id
      LEFT JOIN locations l ON i.location_id = l.location_id
      WHERE LOWER(i.status) = LOWER(:status)
      ORDER BY i.created_at DESC`, { status }
    );

    if (result.success) {
      const issues = result.rows.map((issue) => ({
        ID: issue.ISSUE_ID,
        TITLE: issue.TITLE,
        DESCRIPTION: issue.DESCRIPTION,
        CATEGORY: issue.CATEGORY,
        PRIORITY: issue.PRIORITY,
        IMAGE_URL: issue.IMAGE_URL,
        STATUS: issue.STATUS,
        CREATED_AT: issue.CREATED_AT ? new Date(issue.CREATED_AT).toISOString() : null,
        UPDATED_AT: issue.UPDATED_AT ? new Date(issue.UPDATED_AT).toISOString() : null,
        CITIZEN_NAME: issue.CITIZEN_NAME,
        LOCATION: issue.LOCATION_ADDRESS,
        UPAZILA: issue.UPAZILA,
        DISTRICT: issue.DISTRICT
      }));
      res.json({ issues });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error fetching issues by status",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in getIssuesByStatus:", err);
    res.status(500).json({ message: "Internal server error occurred" });
  }
}

// NEW: Get user's issue statistics
async function getUserIssueStats(req, res) {
  const citizen_id = req.user.user_id;
  
  try {
    const result = await executeQuery(
      `SELECT 
        COUNT(*) as total_issues,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues,
        COUNT(CASE WHEN status IN ('submitted', 'applied', 'under_review') THEN 1 END) as pending_issues,
        COUNT(CASE WHEN status IN ('assigned', 'in_progress') THEN 1 END) as in_progress_issues
      FROM issues 
      WHERE citizen_id = :citizen_id`, 
      { citizen_id }
    );

    if (result.success && result.rows.length > 0) {
      const stats = result.rows[0];
      res.json({ 
        success: true,
        stats: {
          totalIssues: Number(stats.TOTAL_ISSUES) || 0,
          resolvedIssues: Number(stats.RESOLVED_ISSUES) || 0,
          pendingIssues: Number(stats.PENDING_ISSUES) || 0,
          inProgressIssues: Number(stats.IN_PROGRESS_ISSUES) || 0
        }
      });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        success: false,
        message: "Error fetching user statistics",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in getUserIssueStats:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error occurred",
      error: getErrorMessage(err)
    });
  }
}

// NEW: Get user's recent issues
async function getUserRecentIssues(req, res) {
  const citizen_id = req.user.user_id;
  const limit = parseInt(req.query.limit) || 5;
  
  try {
    const result = await executeQuery(
      `SELECT 
        i.issue_id, i.title, i.description, i.category, i.priority, i.image_url, i.status,
        i.created_at, i.updated_at, l.full_address as location_address, l.upazila, l.district
      FROM issues i
      LEFT JOIN locations l ON i.location_id = l.location_id
      WHERE i.citizen_id = :citizen_id
      ORDER BY i.created_at DESC
      FETCH FIRST :limit ROWS ONLY`, 
      { citizen_id, limit }
    );

    if (result.success) {
      const issues = result.rows.map((issue) => ({
        issue_id: issue.ISSUE_ID,
        title: issue.TITLE,
        description: issue.DESCRIPTION,
        category: issue.CATEGORY,
        priority: issue.PRIORITY,
        image_url: issue.IMAGE_URL,
        status: issue.STATUS,
        created_at: issue.CREATED_AT ? new Date(issue.CREATED_AT).toISOString() : null,
        updated_at: issue.UPDATED_AT ? new Date(issue.UPDATED_AT).toISOString() : null,
        location: issue.LOCATION_ADDRESS,
        upazila: issue.UPAZILA,
        district: issue.DISTRICT
      }));
      
      res.json({ 
        success: true,
        issues
      });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        success: false,
        message: "Error fetching recent issues",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in getUserRecentIssues:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error occurred",
      error: getErrorMessage(err)
    });
  }
}

// NEW: Worker applies for an issue
async function applyForIssue(req, res) {
  const { id: issue_id } = req.params;
  const worker_id = req.user.user_id;
  const { estimated_cost, estimated_time, proposal_description } = req.body;

  if (!estimated_cost || !estimated_time || !proposal_description) {
    return res.status(400).json({ 
      message: "Missing required fields: estimated_cost, estimated_time, proposal_description" 
    });
  }

  try {
    const result = await executeQuery(
      `INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description)
       VALUES (:issue_id, :worker_id, :estimated_cost, :estimated_time, :proposal_description)`,
      { issue_id, worker_id, estimated_cost, estimated_time, proposal_description }
    );

    if (result.success) {
      // Update issue status to 'applied' if it was 'submitted'
      await executeQuery(
        `UPDATE issues 
         SET status = CASE WHEN status = 'submitted' THEN 'applied' ELSE status END 
         WHERE issue_id = :issue_id`,
        { issue_id }
      );

      res.status(201).json({ 
        message: "Application submitted successfully!",
        rowsAffected: result.rowsAffected
      });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error submitting application",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in applyForIssue:", err);
    res.status(500).json({ 
      message: "Internal server error occurred",
      error: getErrorMessage(err)
    });
  }
}

// NEW: Get applications for an issue
async function getIssueApplications(req, res) {
  const { id: issue_id } = req.params;
  
  try {
    const result = await executeQuery(
      `SELECT 
        a.application_id, a.issue_id, a.worker_id, a.estimated_cost, a.estimated_time,
        a.proposal_description, a.status, a.feedback, a.applied_at, a.reviewed_at,
        u.name as worker_name, u.email as worker_email, u.phone as worker_phone
      FROM applications a
      LEFT JOIN users u ON a.worker_id = u.user_id
      WHERE a.issue_id = :issue_id
      ORDER BY a.applied_at DESC`,
      { issue_id }
    );

    if (result.success) {
      const applications = result.rows.map((app) => ({
        application_id: app.APPLICATION_ID,
        issue_id: app.ISSUE_ID,
        worker_id: app.WORKER_ID,
        estimated_cost: app.ESTIMATED_COST,
        estimated_time: app.ESTIMATED_TIME,
        proposal_description: app.PROPOSAL_DESCRIPTION,
        status: app.STATUS,
        feedback: app.FEEDBACK,
        applied_at: app.APPLIED_AT ? new Date(app.APPLIED_AT).toISOString() : null,
        reviewed_at: app.REVIEWED_AT ? new Date(app.REVIEWED_AT).toISOString() : null,
        worker_name: app.WORKER_NAME,
        worker_email: app.WORKER_EMAIL,
        worker_phone: app.WORKER_PHONE
      }));
      
      res.json({ applications });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error fetching applications",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in getIssueApplications:", err);
    res.status(500).json({ message: "Internal server error occurred" });
  }
}

// NEW: Reject an application
async function rejectIssueApplication(req, res) {
  const { id: issue_id, applicationId: application_id } = req.params;
  const admin_id = req.user.user_id;
  const { feedback } = req.body;

  try {
    const result = await executeQuery(
      `UPDATE applications 
       SET status = 'rejected', feedback = :feedback, reviewed_by = :admin_id
       WHERE application_id = :application_id AND issue_id = :issue_id`,
      { feedback, admin_id, application_id, issue_id }
    );

    if (result.success) {
      if (result.rowsAffected === 0) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json({ 
        message: "Application rejected successfully!",
        rowsAffected: result.rowsAffected
      });
    } else {
      const errorMessage = getErrorMessage(result.error);
      console.error("Database error:", errorMessage);
      res.status(500).json({ 
        message: "Error rejecting application",
        error: errorMessage
      });
    }
  } catch (err) {
    console.error("Error in rejectIssueApplication:", err);
    res.status(500).json({ message: "Internal server error occurred" });
  }
}

module.exports = { 
  createIssue, 
  getAllIssues, 
  getIssueById,
  updateIssueStatus,
  updateIssue,
  deleteIssue,
  getIssuesByCategory,
  getIssuesByStatus,
  getUserIssueStats,
  getUserRecentIssues,
  applyForIssue,
  getIssueApplications,
  rejectIssueApplication
};