const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
    // console.log(req);
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Common validation rules
const authValidation = {
    register: [
        body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('age')
            .isInt({ min: 1, max: 120 })
            .withMessage('Age must be a valid number between 1 and 120'),
        body('phone')
            .matches(/^\+?[\d\s-]+$/)
            .withMessage('Please enter a valid phone number')
    ],
    login: [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ]
};

module.exports = { validate, authValidation }; 