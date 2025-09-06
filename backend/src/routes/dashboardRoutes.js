import express from 'express';
import DashboardController from '../controllers/DashboardController.js';
import { protect, getUserRolesForSchool } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.use(getUserRolesForSchool);

// Dashboard statistics
router.get('/stats', DashboardController.getDashboardStats);

// Recent activities
router.get('/activities', DashboardController.getRecentActivities);

// Chart data
router.get('/charts/:type', DashboardController.getChartData);

// Alerts and notifications
router.get('/alerts', DashboardController.getAlerts);
router.patch('/alerts/:alertId/read', DashboardController.markAlertAsRead);

// Quick actions
router.get('/quick-actions', DashboardController.getQuickActions);

// Performance data
router.get('/class-performance', DashboardController.getClassPerformance);
router.get('/attendance', DashboardController.getAttendanceData);
router.get('/monthly-evolution', DashboardController.getMonthlyEvolution);

export default router;
