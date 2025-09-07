import express from 'express';
import SubjectController from '../controllers/SubjectController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply middleware to all subject routes
router.use(protect, getUserRolesForSchool);

// Routes
router.post('/', SubjectController.createSubject);
router.post('/bulk', SubjectController.createManySubjects);
// Seed routes removed per user request to avoid pre-filled subjects
router.get('/', SubjectController.getAllSubjects);
// Suggested subjects route removed per user request
router.get('/:id', SubjectController.getSubjectById);
router.put('/:id', SubjectController.updateSubjectById);
router.delete('/:id', SubjectController.deleteSubjectById);
router.patch('/:id/toggle', SubjectController.toggleActiveStatus);
router.delete('/purge/all', SubjectController.purgeSubjects);

export default router;
