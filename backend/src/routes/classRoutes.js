import express from 'express';
import ClassController from '../controllers/ClassController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect, getUserRolesForSchool);

// Class management routes
router.post('/', ClassController.createClass);
router.post('/bulk', ClassController.createManyClasses);
router.get('/', ClassController.getAllClasses);
router.get('/stats', ClassController.getClassStatistics); // ADDED: Statistics
router.get('/level/:level', ClassController.getClassesByLevel); // ADDED: Classes by level
router.get('/teacher/:teacherId', ClassController.getClassesByTeacher); // ADDED: Classes by teacher
router.get('/:id', ClassController.getClassById);
router.put('/:id', ClassController.updateClass);
router.patch('/:id/toggle-status', ClassController.toggleClassStatus); // ADDED: Toggle status
router.delete('/:id', ClassController.deleteClass);
router.delete('/purge/all', ClassController.purgeClasses); // ADDED: Purge all classes

// Subject management routes
router.get('/:id/subjects', ClassController.getClassSubjects);
router.put('/:id/subjects', ClassController.setClassSubjects);
router.post('/:id/refresh-subjects', ClassController.refreshClassSubjects); // UPDATED: Now uses refreshClassSubjects
router.put('/:id/add-subjects', ClassController.addSubjectsToClass); // UPDATED: Fixed endpoint name
router.put('/:id/update-subject/:subjectId', ClassController.updateSubjectInClass); // UPDATED: Fixed endpoint name
router.delete('/:id/remove-subject/:subjectId', ClassController.removeSubjectFromClass); // UPDATED: Fixed endpoint name

// Student management routes
router.put('/:id/add-student', ClassController.addStudentToClass); // UPDATED: Body-based student addition
router.delete('/:id/remove-student/:studentId', ClassController.removeStudentFromClass);

// Performance analytics
router.get('/:id/performance', ClassController.getClassPerformanceAnalytics); // ADDED: Performance analytics

export default router;