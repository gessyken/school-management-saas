import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import School from '../models/School.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.schoolId = decoded.schoolId;
    req.user = await User.findById(decoded.userId);

    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

export const getUserRolesForSchool = async (req, res, next) => {
  try {
    const schoolId = req.schoolId
    const userId = req.userId
    const school = await School.findById(schoolId);
    if (!school) return [];

    const user = await User.findById(userId);
    if (!user) return [];

    const membership = user.memberships?.find(
      (m) => m.school.toString() === schoolId.toString()
    );

    req.roles = membership?.roles || [];
  } catch (error) {
    console.error("Failed to get user roles:", error);
    req.roles =[];
  }
  next();
};
