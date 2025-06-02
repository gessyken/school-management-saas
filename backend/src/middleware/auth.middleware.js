import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer Token
        if (!token) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('+roles');

        if (!user) {
            return res.status(401).json({ message: 'Failed to authenticate.' });
        }

        req.user = user; // Attach user to request for further use
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token.' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired.' });
        } else {
            return res.status(500).json({ message: 'Failed to authenticate.' });
        }
    }
};

export const authorizeRoles = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (roles.length && !roles.some(role => req.user.roles.includes(role))) {
            return res.status(403).json({ message: 'Insufficient permissions.' });
        }

        next();
    };
};