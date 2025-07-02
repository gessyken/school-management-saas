import express from 'express';
import logController from '../controllers/LogController.js'; // Adjust path as needed
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.use(getUserRolesForSchool);

// GET all logs (admin or system use)
router.get('/all',  logController.getAllLogs);

// GET logs filtered by school (based on req.schoolId)
router.get('/school', logController.getLogsBySchool);

export default router;
