const oracledb = require("oracledb");

// ✅ Auto-convert CLOBs to string, BLOBs to Buffer
oracledb.fetchAsString = [oracledb.CLOB];
oracledb.fetchAsBuffer = [oracledb.BLOB];

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
    imageUrl,
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
      (CITIZEN_NAME, CITIZEN_EMAIL, CITIZEN_PHONE, CITIZEN_ADDRESS, TITLE, DESCRIPTION, CATEGORY, PRIORITY, LOCATION, IMAGE_URL, CREATED_AT) 
      VALUES 
      (:citizenName, :citizenEmail, :citizenPhone, :citizenAddress, :title, :description, :category, :priority, :location, :imageUrl, CURRENT_TIMESTAMP)`,
      {
        citizenName,
        citizenEmail,
        citizenPhone,
        citizenAddress,
        title,
        description,
        category,
        priority,
        location,
        imageUrl,
      },
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

    // ✅ Sanitize Oracle DATE → ISO string
    const issues = result.rows.map((issue) => ({
      ...issue,
      CREATED_AT: issue.CREATED_AT
        ? new Date(issue.CREATED_AT).toISOString()
        : null,
      UPDATED_AT: issue.UPDATED_AT
        ? new Date(issue.UPDATED_AT).toISOString()
        : null,
    }));

    res.json({ issues });
  } catch (err) {
    console.error("Error fetching issues arafat:", err);
    res.status(500).json({ message: "Error fetching issues arafat." });
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
      `UPDATE ISSUE 
       SET STATUS = :status, UPDATED_AT = CURRENT_TIMESTAMP 
       WHERE ID = :id`,
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
