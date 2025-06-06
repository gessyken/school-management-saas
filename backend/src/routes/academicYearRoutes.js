import express from 'express';
import AcademicYearController from '../controllers/AcademicYearController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Academic year routes
router.post('/assign', AcademicYearController.assignStudentsToClass);
router.get('/', AcademicYearController.StudentsAcademic);
router.get('/:id', authenticate, AcademicYearController.getAcademicYearById);
// router.put('/:id', authenticate, authorizeRoles(['admin']), AcademicYearController.updateAcademicYear);
router.delete('/:id', authenticate, authorizeRoles(['admin']), AcademicYearController.deleteAcademicYear);

// Mark management routes
router.put('/:id/marks', AcademicYearController.updateStudentMarks);
router.put('/:id/calculate-averages', authenticate, AcademicYearController.calculateAverages);

// Fee MAnagement
router.get('/:academicYearId/fees', AcademicYearController.getFees);
router.post('/:academicYearId/fees', AcademicYearController.addFee);
router.put('/:academicYearId/fees/:billID', AcademicYearController.updateFee);
router.delete('/:academicYearId/fees/:billID', AcademicYearController.deleteFee);


export default router;