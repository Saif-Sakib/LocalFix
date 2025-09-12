const express = require("express");
const router = express.Router();
const { createIssue, getAllIssues, getIssueById, updateIssueStatus } = require("../controllers/issueController");
const { authenticateToken, authorize } = require('../middleware/auth');

router.post("/", authenticateToken, createIssue);          // Citizen submits issue
router.get("/", getAllIssues);           // Admin fetch all issues
router.get("/:id", getIssueById);        // Get single issue by ID
router.put("/:id/status", updateIssueStatus); // Admin accepts/rejects issue

module.exports = router;
