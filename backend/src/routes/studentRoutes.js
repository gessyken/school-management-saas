import express from 'express';
import StudentController from '../controllers/StudentController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication and school context middleware to all routes
router.use(protect);
router.use(getUserRolesForSchool);

// Student management routes
router.post('/', StudentController.createStudent); // alias to support frontend service
router.post('/register', StudentController.createStudent);
router.post('/register_many_students', StudentController.createManyStudents);
router.get('/', StudentController.getAllStudents);
router.get('/at-risk', StudentController.getStudentsAtRisk);
router.get('/class/:classId', StudentController.getStudentsByClass);
router.get('/:id', StudentController.getStudentById);
router.get('/:id/attendance', StudentController.getStudentAttendance);
router.get('/:id/performance', StudentController.getStudentAcademicPerformance);
router.put('/:id', StudentController.updateStudentById);
router.delete('/:id', StudentController.deleteStudentById);
router.patch('/:id/status', StudentController.changeStatus);

// CSV import (stub). To be implemented with multer and parsing
router.post('/import', async (req, res) => {
  return res.status(501).json({ message: 'Import CSV non implémenté côté serveur' });
});

export default router;
