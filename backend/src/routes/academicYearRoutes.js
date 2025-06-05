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
// router.put('/:id/marks', authenticate, authorizeRoles(['admin']), AcademicYearController.updateStudentMarks);
router.put('/:id/calculate-averages', authenticate, AcademicYearController.calculateAverages);

export default router;