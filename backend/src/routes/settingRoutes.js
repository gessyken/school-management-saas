import express from 'express';
import settingController from '../controllers/SettingController.js';

const router = express.Router();

// Academic Year
router.post('/academic-year', settingController.createAcademicYear);
router.get('/academic-year', settingController.getAcademicYears);
router.put('/academic-year/:id', settingController.updateAcademicYear);
router.delete('/academic-year/:id', settingController.deleteAcademicYear);

// Term
router.post('/term', settingController.createTerm);
router.get('/term', settingController.getTerms);
router.put('/term/:id', settingController.updateTerm);
router.delete('/term/:id', settingController.deleteTerm);

// Sequence
router.post('/sequence', settingController.createSequence);
router.get('/sequence', settingController.getSequences);
router.put('/sequence/:id', settingController.updateSequence);
router.delete('/sequence/:id', settingController.deleteSequence);

export default router;
