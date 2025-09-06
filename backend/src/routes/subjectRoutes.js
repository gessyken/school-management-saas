import express from 'express';
import SubjectController from '../controllers/SubjectController.js';
import SubjectSeedController from '../controllers/SubjectSeedController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply middleware to all subject routes
router.use(protect, getUserRolesForSchool);

// Routes
router.post('/', SubjectController.createSubject);
router.post('/bulk', SubjectController.createManySubjects);
router.post('/seed-cameroon', SubjectSeedController.seedCameroonianSubjects);
router.get('/', SubjectController.getAllSubjects);
router.get('/suggested', SubjectSeedController.getSuggestedSubjects);
router.get('/:id', SubjectController.getSubjectById);
router.put('/:id', SubjectController.updateSubjectById);
router.delete('/:id', SubjectController.deleteSubjectById);
router.patch('/:id/toggle', SubjectController.toggleActiveStatus);

export default router;
