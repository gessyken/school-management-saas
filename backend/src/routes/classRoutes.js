import express from 'express';
import ClassController from '../controllers/ClassController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect, getUserRolesForSchool);

// Class management routes
router.post('/', ClassController.createClass);
router.post('/bulk', ClassController.createManyClasses);
router.get('/', ClassController.getAllClasses);
router.get('/:id', ClassController.getClassById);
router.put('/:id', ClassController.updateClass);
router.delete('/:id', ClassController.deleteClass);
// Refresh subjects of a class based on educationSystem/level/specialty
router.post('/:id/refresh-subjects', ClassController.refreshSubjectsForClass);
// Centralized subjects management for a class
router.get('/:id/subjects', ClassController.getClassSubjects);
router.put('/:id/subjects', ClassController.setClassSubjects);

// Subject management within class 
router.put('/:id/add_subject', ClassController.addSubjectsToClass);
router.put('/:id/update_subject', ClassController.updateSubjectInClass);
router.delete('/:id/remove_subject/:subjectId', ClassController.removeSubjectFromClass);


// Student assignment routes
router.put('/:id/add-student/:studentId', ClassController.addStudentToClass);
router.put('/:id/remove-student/:studentId', ClassController.removeStudentFromClass);

export default router;