const express = require("express");
const router = express.Router();
const { createIssue, getAllIssues, updateIssueStatus } = require("../controllers/issueController");

router.post("/", createIssue);           // Citizen submits issue
router.get("/", getAllIssues);           // Admin fetch all issues
router.put("/:id/status", updateIssueStatus); // Admin accepts/rejects issue

module.exports = router;
