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
        { expiresIn: '24h' }
    );
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

        const { name, email, phone, address, password, user_type } = req.body;

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

        // Generate token
        const token = generateToken(newUser);

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
            },
            token
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

        const { email, password, user_type } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check user type
        if (user.user_type !== user_type) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user type selected'
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
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user);

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
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
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

module.exports = {
    register,
    login,
    getProfile
};