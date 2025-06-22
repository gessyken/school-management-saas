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

export default router;
