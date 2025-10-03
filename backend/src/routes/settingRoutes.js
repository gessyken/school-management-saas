import express from 'express';
import settingController from '../controllers/SettingController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.use(getUserRolesForSchool);

// Academic Year Routes
router.post('/academic-years', settingController.createAcademicYear);
router.get('/academic-years', settingController.getAcademicYears);
router.get('/academic-years/current', settingController.getCurrentAcademicYear);
router.get('/academic-years/:id', settingController.getAcademicYearById);
router.put('/academic-years/:id', settingController.updateAcademicYear);
router.delete('/academic-years/:id', settingController.deleteAcademicYear);
router.get('/academic-years/:id/progress', settingController.getAcademicYearProgress);
router.post('/academic-years/validate-dates', settingController.validateAcademicYearDates);

// Term Routes
router.post('/terms', settingController.createTerm);
router.get('/terms', settingController.getTerms);
router.get('/terms/current', settingController.getCurrentTerm);
router.get('/terms/:id', settingController.getTermById);
router.get('/terms/academic-year/:academicYearId', settingController.getTermsByAcademicYear);
router.put('/terms/:id', settingController.updateTerm);
router.delete('/terms/:id', settingController.deleteTerm);
router.patch('/terms/bulk-status', settingController.bulkUpdateTermStatus);

// Sequence Routes
router.post('/sequences', settingController.createSequence);
router.get('/sequences', settingController.getSequences);
router.get('/sequences/current', settingController.getCurrentSequence);
router.get('/sequences/:id', settingController.getSequenceById);
router.get('/sequences/term/:termId', settingController.getSequencesByTerm);
router.put('/sequences/:id', settingController.updateSequence);
router.delete('/sequences/:id', settingController.deleteSequence);

export default router;