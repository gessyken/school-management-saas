import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import School from '../models/School.js';

// Protect middleware: checks for valid token and sets req.user context
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    req.userId = decoded.userId;
    req.schoolId = decoded.schoolId;
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

// Middleware to extract user roles for the current school
export const getUserRolesForSchool = async (req, res, next) => {
  try {
    const schoolId = req.schoolId;
    const userId = req.userId;

    if (!schoolId || !userId) {
      req.roles = [];
      return next();
    }

    const user = await User.findById(userId);
    if (!user) {
      req.roles = [];
      return next();
    }

    const membership = user.memberships?.find(
      (m) => m.school.toString() === schoolId.toString()
    );

    req.roles = membership?.roles || [];
    return next();
  } catch (error) {
    console.error('Error fetching user roles:', error);
    req.roles = [];
    next();
  }
};
