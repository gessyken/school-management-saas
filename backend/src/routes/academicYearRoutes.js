import express from 'express';
import AcademicYearController from '../controllers/AcademicYearController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.use(getUserRolesForSchool);

// Academic Year Management
router.post('/create-for-students', AcademicYearController.createAcademicYearsForStudents);
router.post('/assign', AcademicYearController.assignStudentsToClass);
router.post('/assign-with-session', AcademicYearController.assignStudentsToClassWithSession);
router.get('/', AcademicYearController.StudentsAcademic);
router.get('/student/:studentId/year/:year', AcademicYearController.getAcademicYearByStudent);
router.get('/:id', AcademicYearController.getAcademicYearById);
router.put('/:id/sync-class', AcademicYearController.syncAcademicYearWithClass);
router.put('/:id/deactivate', AcademicYearController.deactivateAcademicYear);
router.put('/:id/reactivate', AcademicYearController.reactivateAcademicYear);
router.delete('/:id', AcademicYearController.deleteAcademicYear);

// Mark Management
router.put('/:id/marks', AcademicYearController.updateStudentMarks);
router.put('/bulk/marks', AcademicYearController.bulkUpdateMarks);
router.put('/:id/calculate-averages', AcademicYearController.calculateAverages);

// Performance & Analytics
router.get('/student/:studentId/year/:year/performance', AcademicYearController.getStudentPerformanceSummary);
router.get('/class/overview', AcademicYearController.getClassAcademicOverview);
router.get('/analytics/fees', AcademicYearController.getFeeAnalytics);

// Rank Management
router.put('/ranks/subject', AcademicYearController.calculateSubjectRank);
router.put('/ranks/sequence', AcademicYearController.calculateSequenceRank);
router.put('/ranks/term', AcademicYearController.calculateTermRank);
router.put('/ranks/academic', AcademicYearController.calculateRanksForClassYear);
router.put('/promote-students', AcademicYearController.promoteStudents);

// Fee Management
router.get('/:academicYearId/fees', AcademicYearController.getFees);
router.post('/:academicYearId/fees', AcademicYearController.addFee);
router.put('/:academicYearId/fees/:billID', AcademicYearController.updateFee);
router.delete('/:academicYearId/fees/:billID', AcademicYearController.deleteFee);

// Report Generation
router.get('/:id/report-card', AcademicYearController.generateReportCard);
router.get('/class/rankings', AcademicYearController.getClassRankings);
router.get('/students-at-risk', AcademicYearController.getStudentsAtRisk);
router.put('/:id/check-completion', AcademicYearController.checkYearCompletion);

export default router;