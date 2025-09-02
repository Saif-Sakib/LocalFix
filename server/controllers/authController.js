// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
    return jwt.sign(
        { 
            user_id: user.user_id, 
            email: user.email, 
            user_type: user.user_type 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Keep token expiration shorter for security
    );
};

// Helper function to set secure authentication cookies
const setAuthCookie = (res, token, rememberMe = false) => {
    const cookieOptions = {
        httpOnly: true,  // Prevents XSS attacks - JavaScript cannot access this cookie
        secure: process.env.NODE_ENV === 'production', // Only HTTPS in production, HTTP OK for localhost
        sameSite: 'lax', // Changed from 'strict' to 'lax' for better localhost compatibility
        path: '/', // Cookie available for entire site
    };
    
    // If rememberMe is true, set cookie to expire in 30 days
    // If rememberMe is false, this becomes a session cookie (expires when browser closes)
    if (rememberMe) {
        cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    }
    // Note: When maxAge is not set, the cookie becomes a session cookie
    
    res.cookie('authToken', token, cookieOptions);
};

// Helper function to clear authentication cookie
const clearAuthCookie = (res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
};

const register = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, phone, address, password, user_type, rememberMe = false } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const newUser = await User.create({
            name,
            email,
            phone,
            address,
            password,
            user_type
        });

        // Generate token and set secure cookie
        const token = generateToken(newUser);
        setAuthCookie(res, token, rememberMe);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                user_id: newUser.user_id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                user_type: newUser.user_type
            }
            // Note: No token in response body - it's now in secure cookie
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

const login = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, user_type, rememberMe = false } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credential'
            });
        }

        // Check user type
        if (user.user_type !== user_type) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credential'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive. Please contact admin.'
            });
        }

        // Verify password
        const isPasswordValid = await User.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credential'
            });
        }

        // Generate token and set secure cookie
        const token = generateToken(user);
        setAuthCookie(res, token, rememberMe);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                user_type: user.user_type
            }
            // Note: No token in response body - it's now in secure cookie
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

// New logout endpoint to clear cookies
const logout = async (req, res) => {
    try {
        // Clear the authentication cookie
        clearAuthCookie(res);
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                user_type: user.user_type,
                status: user.status,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { name, phone, address, password } = req.body;
        
        // Validate input
        if (!name && !phone && !address && !password) {
            return res.status(400).json({
                success: false,
                message: 'At least one field is required for update'
            });
        }
        
        // Prepare update data (only include fields that are provided)
        const updateData = {};
        
        if (name && name.trim()) {
            if (name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Name must be at least 2 characters long'
                });
            }
            updateData.name = name.trim();
        }
        
        if (phone && phone.trim()) {
            // Basic phone validation (adjust regex as needed for your format)
            const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
            if (!phoneRegex.test(phone.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid phone number'
                });
            }
            updateData.phone = phone.trim();
        }
        
        if (address && address.trim()) {
            updateData.address = address.trim();
        }
        
        if (password && password.trim()) {
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters long'
                });
            }
            updateData.password = password;
        }
        
        // Update user in database
        const updated = await User.update(userId, updateData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found or no changes made'
            });
        }
        
        // Fetch updated user data to return
        const updatedUser = await User.findById(userId);
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                user_id: updatedUser.user_id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                user_type: updatedUser.user_type,
                status: updatedUser.status,
                created_at: updatedUser.created_at
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile
};