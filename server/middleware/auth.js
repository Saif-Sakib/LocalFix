// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    try {
        // Primary method: Get token from HTTP-only cookie
        let token = req.cookies?.authToken;
        
        // Fallback: Check Authorization header for backward compatibility
        // This allows API clients or mobile apps to still use Bearer tokens
        if (!token) {
            const authHeader = req.headers['authorization'];
            token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        }

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access token required' 
            });
        }

        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user information to request object for use in subsequent middleware/routes
        req.user = {
            user_id: decoded.user_id,
            email: decoded.email,
            user_type: decoded.user_type
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token has expired' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
        
        console.error('Authentication error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error during authentication' 
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        if (!roles.includes(req.user.user_type)) {
            return res.status(403).json({ 
                success: false,
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