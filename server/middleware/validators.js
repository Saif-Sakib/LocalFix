// server/middleware/validators.js
const { body } = require('express-validator');

const registerValidator = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('phone')
        .matches(/^01[0-9]{9}$/)
        .withMessage('Phone number must be 11 digits starting with 01'),
    
    body('address')
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage('Address must be between 5 and 255 characters'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    
    body('user_type')
        .isIn(['citizen', 'worker'])
        .withMessage('User type must be either citizen or worker')
];

const loginValidator = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    body('user_type')
        .isIn(['citizen', 'worker', 'admin'])
        .withMessage('Invalid user type')
];

module.exports = {
    registerValidator,
    loginValidator
};