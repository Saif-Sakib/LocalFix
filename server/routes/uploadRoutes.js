// server/routes/uploadRoutes.js
const express = require('express');
const uploadService = require('../services/uploadService');
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Upload Routes - API-only file operations
 * All file uploads and access go through these API routes for better security and control
 */

// File upload routes - All require authentication
router.post('/issue', 
    authenticateToken,
    uploadService.issueUpload.single('image'), 
    fileController.uploadIssueImage
);

router.post('/profile', 
    authenticateToken,
    uploadService.profileUpload.single('image'), 
    fileController.uploadProfileImage
);

router.post('/proof', 
    authenticateToken,
    uploadService.proofUpload.single('image'), 
    fileController.uploadProofImage
);

// File serving routes - Public access for images (but controlled through API)
router.get('/image/:folder/:filename', fileController.getImage);
router.get('/info/:folder/:filename', fileController.getImageInfo);

// File management routes - Require authentication
router.delete('/image/:folder/:filename', 
    authenticateToken, 
    fileController.deleteImage
);

router.get('/list/:folder', 
    authenticateToken, 
    fileController.listImages
);

// Error handling middleware for multer
router.use(fileController.handleUploadError);

module.exports = router;