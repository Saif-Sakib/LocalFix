// server/routes/workerRoutes.js
const express = require("express");
const router = express.Router();
const { getMyApplications, updateProofProgress } = require("../controllers/workerController");
const { authenticateToken, authorize } = require('../middleware/auth');

// GET all applications and assigned jobs for the logged-in worker
router.get("/applications", authenticateToken, authorize('worker'), getMyApplications);
router.put('/start-work', authenticateToken, authorize('worker'), updateProofProgress);

module.exports = router;