import express from 'express';
import ReportCardController from '../controllers/ReportCardController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Report card generation routes
router.get('/student/:studentId/:year/:termIndex?', authenticate, ReportCardController.generateIndividualReportCard);
router.get('/class/:classId/:year/:termIndex?', authenticate, ReportCardController.generateClassReportCards);
router.get('/school/:year', authenticate, authorizeRoles(['admin']), ReportCardController.generateSchoolPerformanceReport);
router.get('/progress/:studentId', authenticate, ReportCardController.generateStudentProgressReport);

// Proposed new routes
router.post('/class-comparison', authenticate, authorizeRoles(['admin']), ReportCardController.generateClassComparison);
router.get('/fee-payment', authenticate, authorizeRoles(['admin']), ReportCardController.generateFeePaymentReport);

export default router;