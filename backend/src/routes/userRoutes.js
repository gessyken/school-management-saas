import UserController from '../controllers/UserController.js'
import express from "express";
// import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js'
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.use(getUserRolesForSchool);

router.get('/', UserController.getAllUsersPerSchool);
// Dedicated teachers listing (filters by role via controller)
router.get('/teachers', (req, res, next) => {
  // Inject role=TEACHER into query for the controller
  req.query.role = req.query.role || 'TEACHER';
  return UserController.getAllUsersPerSchool(req, res, next);
});

// Authentication routes
// router.post('/register', UserController.register);
// router.post('/login', UserController.login);

// User profile routes (require authentication)
// router.get('/profile', authenticate, UserController.getProfile);
// router.put('/profile', authenticate, UserController.updateProfile);
// router.put('/change-password', authenticate, UserController.changePassword);

// Admin routes (require admin role)
// router.get('/:id', UserController.getUserById);
// router.put('/:id', UserController.updateUser);
// router.delete('/:id', UserController.deleteUser);

export default router;