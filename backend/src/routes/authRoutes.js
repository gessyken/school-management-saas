
import { protect } from '../middleware/auth.middleware.js';
import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

// Admin-only routes
router.get('/users', protect, authController.getAllUsers);
router.put('/users/:userId/roles', protect, authController.updateUserRoles);

export default router;
