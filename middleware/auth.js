const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
    try {
        // Check for token in both cookies and Authorization header
        let token = req.cookies.token;
        
        if (!token && req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Please log in to access this resource' 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    message: 'User no longer exists' 
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token, please log in again' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Authentication error' 
        });
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo }; 