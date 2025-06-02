import UserController from '../controllers/UserController.js'
import express from "express";
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js'

const router = express.Router();

// Authentication routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// User profile routes (require authentication)
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.put('/change-password', authenticate, UserController.changePassword);

// Admin routes (require admin role)
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;