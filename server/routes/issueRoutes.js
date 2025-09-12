const express = require("express");
const router = express.Router();
const { 
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
  rejectIssueApplication,
  getIssueApplications
} = require("../controllers/issueController");
const { authenticateToken, authorize } = require('../middleware/auth');

// User-specific routes (must come before parameterized routes)
router.get("/user/stats", authenticateToken, getUserIssueStats);     // Get user's issue statistics
router.get("/user/recent", authenticateToken, getUserRecentIssues);  // Get user's recent issues

// Category and status routes (must come before :id routes)
router.get("/category/:category", getIssuesByCategory); // Get issues by category
router.get("/status/:status", getIssuesByStatus);       // Get issues by status

// General routes
router.post("/", authenticateToken, createIssue);       // Citizen submits issue
router.get("/", getAllIssues);                          // Get all issues

// Parameterized routes (must come after specific routes)
router.get("/:id", getIssueById);                       // Get single issue by ID
router.put("/:id", authenticateToken, authorize(['admin', 'citizen']), updateIssue);   // Update issue
router.delete("/:id", authenticateToken, authorize(['admin', 'citizen']), deleteIssue); // Delete issue

// Status management
router.put("/:id/status", authenticateToken, authorize(['admin']), updateIssueStatus); // Admin updates status

// Application routes
router.post("/:id/apply", authenticateToken, authorize(['worker']), applyForIssue);     // Worker applies for job
router.get("/:id/applications", authenticateToken, authorize(['admin', 'worker']), getIssueApplications); // Get applications for an issue
router.put("/:id/applications/:applicationId/reject", authenticateToken, authorize(['admin']), rejectIssueApplication); // Admin rejects application

module.exports = router;