import express from 'express';
import SubjectController from '../controllers/SubjectController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply middleware to all subject routes
router.use(protect, getUserRolesForSchool);

// Routes
router.post('/', SubjectController.createSubject);
router.post('/bulk', SubjectController.createManySubjects);
router.get('/', SubjectController.getAllSubjects);
router.get('/stats', SubjectController.getSubjectStatistics); // ADDED: Statistics route
router.get('/level/:level', SubjectController.getSubjectsByLevel); // ADDED: Subjects by level
router.get('/teacher/:teacherId', SubjectController.getSubjectsByTeacher); // ADDED: Subjects by teacher
router.get('/school/:schoolId', SubjectController.getSubjectsForSchool); // ADDED: Subjects for specific school (admin)
router.get('/:id', SubjectController.getSubjectById);
router.put('/:id', SubjectController.updateSubjectById);
router.patch('/:id/toggle', SubjectController.toggleActiveStatus);
router.patch('/bulk/update', SubjectController.bulkUpdateSubjects); // ADDED: Bulk update
router.delete('/:id', SubjectController.deleteSubjectById);
router.delete('/purge/all', SubjectController.purgeSubjects);

export default router;