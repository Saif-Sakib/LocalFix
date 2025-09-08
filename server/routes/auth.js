// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, logout, getProfile, updateProfile, deleteAccount } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../middleware/validators');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
// PUT /api/auth/profile - Update current user profile
router.put('/profile', authenticateToken, updateProfile);

// DELETE /api/auth/delete - Delete current user account
router.delete('/delete', authenticateToken, deleteAccount);
router.post('/logout', logout); // New logout route - doesn't need authentication

module.exports = router;