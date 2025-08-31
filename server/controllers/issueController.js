const oracledb = require("oracledb");

async function createIssue(req, res) {
  const {
    citizenName,
    citizenEmail,
    citizenPhone,
    citizenAddress,
    title,
    description,
    category,
    priority,
    location,
    imageUrl
  } = req.body;

  let connection;

  try {
    // Open a connection to the Oracle DB
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });

    // Insert new issue into the DB
    await connection.execute(
      `INSERT INTO ISSUE 
      (CITIZEN_NAME, CITIZEN_EMAIL, CITIZEN_PHONE, CITIZEN_ADDRESS, TITLE, DESCRIPTION, CATEGORY, PRIORITY, LOCATION, IMAGE_URL) 
      VALUES 
      (:citizenName, :citizenEmail, :citizenPhone, :citizenAddress, :title, :description, :category, :priority, :location, :imageUrl)`,
      { citizenName, citizenEmail, citizenPhone, citizenAddress, title, description, category, priority, location, imageUrl },
      { autoCommit: true }
    );

    res.json({ message: "Issue submitted successfully!" });
  } catch (err) {
    console.error("Error in creating issue:", err);
    res.status(500).json({ message: "Database error occurred" });
  } finally {
    if (connection) await connection.close();
  }
}

async function getAllIssues(req, res) {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });

    const result = await connection.execute(
      `SELECT * FROM ISSUE ORDER BY CREATED_AT DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching issues:", err);
    res.status(500).json({ message: "Error fetching issues." });
  } finally {
    if (connection) await connection.close();
  }
}

async function updateIssueStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });

    await connection.execute(
      `UPDATE ISSUE SET STATUS = :status, UPDATED_AT = CURRENT_TIMESTAMP WHERE ID = :id`,
      { status, id },
      { autoCommit: true }
    );

    res.json({ message: "Issue status updated!" });
  } catch (err) {
    console.error("Error updating issue:", err);
    res.status(500).json({ message: "Error updating issue." });
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { createIssue, getAllIssues, updateIssueStatus };
