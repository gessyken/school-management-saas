import express from 'express';
import {
  registerSchool,
  getAllSchools,
  updateSchoolAccess,
  switchSchool
} from '../controllers/schoolController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new school (logged-in user becomes admin)
router.post('/register', protect, registerSchool);

// Get list of all schools (admin panel)
router.get('/', protect, getAllSchools);

// Block or unblock a school by ID
router.put('/:id/access', protect, updateSchoolAccess);

// Switch current active school for logged-in user
router.post('/switch', protect, switchSchool);

export default router;
