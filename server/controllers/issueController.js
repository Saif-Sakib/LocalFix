const oracledb = require('oracledb');
const { executeQuery, getConnection } = require('../config/database'); // Updated imports

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
      { autoCommit: false } // Do not auto-commit, part of a transaction
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
      { autoCommit: false } // Also part of the same transaction
    );

    // If both inserts are successful, commit the transaction
    await connection.commit();

    res.status(201).json({ 
      message: "Issue submitted successfully!",
      rowsAffected: issueResult.rowsAffected
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

// ... (The rest of the functions in issueController.js remain unchanged)
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
    const validStatuses = ['submitted', 'assigned', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be one of: " + validStatuses.join(', ')
      });
    }

    const result = await executeTransaction(
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
    const result = await executeTransaction(sql, binds);

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
    const result = await executeTransaction(`DELETE FROM issues WHERE issue_id = :id`, { id });

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
        UPAZILA: issue.UPAZILA, // Corrected from CITY to UPAZILA
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


module.exports = { 
  createIssue, 
  getAllIssues, 
  getIssueById,
  updateIssueStatus,
  updateIssue,
  deleteIssue,
  getIssuesByCategory,
  getIssuesByStatus
};