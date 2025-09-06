import express from 'express';
import FinancesController from '../controllers/FinancesController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.use(getUserRolesForSchool);

// Financial overview
router.get('/overview', FinancesController.getFinancialOverview);

// Payments management
router.get('/payments', FinancesController.getPayments);
router.post('/payments', FinancesController.createPayment);
router.put('/payments/:id', FinancesController.updatePayment);
router.delete('/payments/:id', FinancesController.deletePayment);

// Fees management
router.get('/fees', FinancesController.getFees);
router.post('/fees', FinancesController.createFee);
router.put('/fees/:id', FinancesController.updateFee);
router.delete('/fees/:id', FinancesController.deleteFee);

// Financial statistics
router.get('/stats', FinancesController.getFinancialStats);

// Reports and exports
router.get('/reports/revenue', FinancesController.getRevenueReport);
router.get('/reports/expenses', FinancesController.getExpensesReport);
router.get('/export/payments', FinancesController.exportPayments);
router.get('/export/fees', FinancesController.exportFees);

export default router;
