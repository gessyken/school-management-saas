import express from 'express';
import {
  registerUser,
  loginUser,
  getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Register a new user (without school)
router.post('/register', registerUser);

// Login user with schoolId
router.post('/login', loginUser);

// Get current logged-in user info
router.get('/me', protect, getMe);

// Check if user is authenticated (for session verification)
router.get('/check', protect, (req, res) => {
  console.log(req.userId)
  res.status(200).json({ authenticated: true, userId: req.userId });
});

export default router;
