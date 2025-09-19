const express = require("express");
const router = express.Router();
const { 
  createIssue, 
  getAllIssues, 
  getIssueById, 
  updateIssueStatus,
  updateIssue,
  deleteIssue,
  getUserIssueStats,
  getUserRecentIssues,
  applyForIssue,
  getPendingApplications,
  acceptIssueApplication,
  rejectIssueApplication,
  getIssueApplications
} = require("../controllers/issueController");
const { authenticateToken, authorize } = require('../middleware/auth');

// User-specific routes (must come before parameterized routes)
router.get("/user/stats", authenticateToken, getUserIssueStats);     
router.get("/user/recent", authenticateToken, getUserRecentIssues);  

// General routes
router.post("/", authenticateToken, createIssue);       
router.get("/", getAllIssues);                          

// Application routes - specific must come before parameterized
router.get("/applications/pending", authenticateToken, getPendingApplications);

// Parameterized routes (must come after specific routes)
router.get("/:id", getIssueById);                       
router.put("/:id", authenticateToken, authorize('admin', 'citizen'), updateIssue);   
router.delete("/:id", authenticateToken, authorize('admin', 'citizen'), deleteIssue); 

// Status management
router.put("/:id/status", authenticateToken, authorize('admin'), updateIssueStatus); 

// Application routes for a specific issue
router.post("/:id/apply", authenticateToken, applyForIssue);
router.get("/:id/applications", authenticateToken, authorize('admin', 'citizen'), getIssueApplications); 
router.put("/:id/applications/:applicationId/accept", authenticateToken, acceptIssueApplication); 
router.put("/:id/applications/:applicationId/reject", authenticateToken, rejectIssueApplication); 

module.exports = router;