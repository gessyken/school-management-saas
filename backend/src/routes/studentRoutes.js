import express from 'express';
import StudentController from '../controllers/StudentController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Student management routes
router.post('/register',  StudentController.createStudent);
router.post('/register_many_students',  StudentController.createManyStudents);
router.get('/', StudentController.getAllStudents);
router.get('/:id', StudentController.getStudentById);
router.put('/:id', StudentController.updateStudentById);
router.delete('/:id', StudentController.deleteStudentById);
router.patch('/:id/status', StudentController.changeStatus);

// Academic performance routes
router.get('/:id/performance', StudentController.getStudentAcademicPerformance);
router.get('/class/:classId', StudentController.getStudentsByClass);

// Proposed new routes
router.get('/at-risk',  StudentController.getStudentsAtRisk);
router.get('/:id/attendance', StudentController.getStudentAttendance);

export default router;