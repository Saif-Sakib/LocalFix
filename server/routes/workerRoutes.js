const express = require("express");
const router = express.Router();
const { 
  getMyApplications, 
  updateWorkProgress, 
  submitWorkProof,
  deleteApplication,
  getWorkerStats
} = require("../controllers/workerController");
const { authenticateToken, authorize } = require('../middleware/auth');

// Worker statistics
router.get("/stats", authenticateToken, authorize('worker'), getWorkerStats);

// Worker applications and jobs
router.get("/applications", authenticateToken, authorize('worker'), getMyApplications);

// Work progress management
router.put('/start', authenticateToken, authorize('worker'), updateWorkProgress);
router.post('/work/submit-proof', authenticateToken, authorize('worker'), submitWorkProof);

// Application management
router.delete('/applications/:issueId', authenticateToken, authorize('worker'), deleteApplication);

module.exports = router;