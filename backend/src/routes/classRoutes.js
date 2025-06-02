import express from 'express';
import ClassController from '../controllers/ClassController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Class management routes
router.post('/', ClassController.createClass);
router.get('/', ClassController.getAllClasses);
router.get('/:id', ClassController.getClassById);
router.put('/:id', ClassController.updateClass);
router.delete('/:id', ClassController.deleteClass);

// Subject management within class 
router.put('/:id/add_subject', ClassController.addSubjectsToClass);
router.put('/:id/update_subject', ClassController.updateSubjectInClass);
router.delete('/:id/remove_subject/:subjectId', ClassController.removeSubjectFromClass);


// Student assignment routes
router.put('/:id/add-student/:studentId', ClassController.addStudentToClass);
router.put('/:id/remove-student/:studentId', ClassController.removeStudentFromClass);

export default router;