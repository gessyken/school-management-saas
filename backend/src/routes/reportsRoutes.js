import express from 'express';
import ReportsController from '../controllers/ReportsController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.use(getUserRolesForSchool);

// Report generation
router.post('/generate', ReportsController.generateReport);
router.get('/types', ReportsController.getReportTypes);

// Student reports
router.get('/students/:studentId', ReportsController.getStudentReport);
router.get('/students/:studentId/transcript', ReportsController.getStudentTranscript);

// Class reports
router.get('/classes/:classId', ReportsController.getClassReport);
router.get('/classes/:classId/performance', ReportsController.getClassPerformanceReport);

// Academic reports
router.get('/academic/summary', ReportsController.getAcademicSummary);
router.get('/academic/statistics', ReportsController.getAcademicStatistics);

// Financial reports
router.get('/financial/overview', ReportsController.getFinancialOverview);
router.get('/financial/payments', ReportsController.getPaymentsReport);

// Export reports
router.get('/export/:reportId', ReportsController.exportReport);
router.post('/export/custom', ReportsController.exportCustomReport);

// Report history
router.get('/history', ReportsController.getReportHistory);
router.delete('/history/:reportId', ReportsController.deleteReport);

export default router;
