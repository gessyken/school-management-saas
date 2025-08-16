// 📁 backend/controllers/adminController.js
import School from '../models/School.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Invoice from '../models/Invoice.js';
import Subject from '../models/Subject.js';
import Classes from '../models/Classes.js';
import AcademicYear from '../models/AcademicYear.js';

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalSchools,
      totalUsers,
      totalStudents,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueSchools,
      blockedSchools,
      totalSubjects,
      totalClasses,
      currentAcademicYears,
    ] = await Promise.all([
      School.countDocuments(),
      User.countDocuments(),
      Student.countDocuments(),
      Invoice.countDocuments(),
      Invoice.countDocuments({ paymentStatus: 'paid' }),
      Invoice.countDocuments({ paymentStatus: { $ne: 'paid' } }),
      School.countDocuments({ 'billing.status': 'past_due' }),
      School.countDocuments({ accessStatus: 'blocked' }),
      Subject.countDocuments(),
      Classes.countDocuments(),
      AcademicYear.countDocuments({ isActive: true }),
    ]);
    // Add this to your getAdminDashboardStats function
    const monthlyInvoices = await Invoice.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$amount.total" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const monthlySchoolGrowth = await School.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          schools: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);


    res.json({
      totalSchools,
      totalUsers,
      totalStudents,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueSchools,
      blockedSchools,
      totalSubjects,
      totalClasses,
      currentAcademicYears,
      charts: {
        revenueByMonth: monthlyInvoices,
        schoolsByMonth: monthlySchoolGrowth,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la collecte des statistiques.' });
  }
};
