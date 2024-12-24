const { validationResult, body } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const { msg } = errors.array()[0];
        console.log("validation error", msg);

        return res.status(400).json({
            success: false,
            message: `Validation error: ${msg}`
        });

    }
    next();
};

// Auth validation rules
const authValidation = {
    register: [
        body('email')
            .isEmail()
            .withMessage('Invalid email address')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required'),
        body('age')
            .isInt({ min: 1, max: 120 })
            .withMessage('Age must be a valid number between 1 and 120'),
        body('phone')
            .matches(/^\+?[\d\s-]+$/)
            .withMessage('Please enter a valid phone number')
    ],
    login: [
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ]
};

// Doctor validation rules
const doctorValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required'),
        body('email')
            .isEmail()
            .withMessage('Invalid email address')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('phone')
            .matches(/^\+?[\d\s-]+$/)
            .withMessage('Please enter a valid phone number'),
        body('specialization')
            .isIn(['Ayurveda', 'Panchakarma', 'Yoga', 'General'])
            .withMessage('Invalid specialization'),
        body('qualification')
            .notEmpty()
            .withMessage('Qualification is required'),
        body('experience')
            .isInt({ min: 0 })
            .withMessage('Experience must be a valid number'),
        body('registrationNumber')
            .notEmpty()
            .withMessage('Registration number is required')
    ]
};

module.exports = {
    validate,
    authValidation,
    doctorValidation
}; 