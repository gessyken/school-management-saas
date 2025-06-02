import express from 'express';
import SubjectController from '../controllers/SubjectController.js';

const router = express.Router();

router.post('/', SubjectController.createSubject);
router.post('/bulk', SubjectController.createManySubjects);
router.get('/', SubjectController.getAllSubjects);
router.get('/:id', SubjectController.getSubjectById);
router.put('/:id', SubjectController.updateSubjectById);
router.delete('/:id', SubjectController.deleteSubjectById);
router.patch('/:id/toggle', SubjectController.toggleActiveStatus);

export default router;
