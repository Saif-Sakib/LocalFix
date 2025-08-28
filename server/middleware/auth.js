// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!roles.includes(req.user.user_type)) {
            return res.status(403).json({ 
                message: 'Access denied. Insufficient permissions.' 
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorize
};