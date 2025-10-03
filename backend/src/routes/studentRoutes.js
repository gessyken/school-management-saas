import express from 'express';
import StudentController from '../controllers/StudentController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication and school context middleware to all routes
router.use(protect);
router.use(getUserRolesForSchool);

// Student management routes
router.post('/', StudentController.createStudent);
router.post('/bulk', StudentController.createManyStudents);
router.get('/', StudentController.getAllStudents);
router.get('/stats', StudentController.getStudentStatistics);
router.get('/class/:classId', StudentController.getStudentsByClass);
router.get('/:id', StudentController.getStudentById);
// router.get('/:id/performance', StudentController.getStudentAcademicPerformance);
// router.get('/:id/attendance', StudentController.getStudentAttendance);

// Class management routes for students
router.post('/:id/add-to-class', StudentController.addStudentToClass);
router.put('/:id/change-class', StudentController.changeStudentClass);
router.delete('/:id/remove-from-class', StudentController.removeStudentFromClass);

// Student status and updates
router.put('/:id', StudentController.updateStudent);
router.patch('/:id/status', StudentController.changeStatus);
router.patch('/:id/toggle-status', StudentController.toggleStudentStatus);
router.delete('/:id', StudentController.deleteStudent);

// CSV import (stub) - Enhanced with better response
router.post('/import', async (req, res) => {
  return res.status(501).json({ 
    message: 'Import CSV non implémenté côté serveur',
    suggestion: 'Utilisez /students/bulk pour créer plusieurs étudiants'
  });
});

// Legacy routes for backward compatibility
router.post('/register', StudentController.createStudent); // Legacy alias
router.post('/register_many_students', StudentController.createManyStudents); // Legacy alias

export default router;