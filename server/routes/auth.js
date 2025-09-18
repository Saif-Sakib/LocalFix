// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, logout, getProfile, updateProfile, updateProfileImage, removeProfileImage, deleteAccount, refreshToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../middleware/validators');
const uploadService = require('../services/uploadService');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.delete('/delete', authenticateToken, deleteAccount);

// Profile image routes
router.post('/profile/image', 
    authenticateToken, 
    uploadService.profileUpload.single('image'), 
    updateProfileImage
);

router.delete('/profile/image', authenticateToken, removeProfileImage);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    return uploadService.handleUploadError(error, res);
});

module.exports = router;