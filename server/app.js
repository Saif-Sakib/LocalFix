const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser'); // Essential for cookie-based auth
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// CRITICAL: Cookie parser must come before routes that use cookies
app.use(cookieParser());

// CORS configuration - credentials: true is ESSENTIAL for cookies to work
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true // This allows cookies to be sent cross-origin
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'LocalFix API Server Running!',
        version: '1.0.0',
        status: 'OK'
    });
});

// API Routes
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/issues', require('./routes/issueRoutes'));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

module.exports = app;