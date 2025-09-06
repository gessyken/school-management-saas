import Student from '../models/Student.js';
import AcademicYear from '../models/AcademicYear.js';

class FinancesController {
  // Get financial overview
  static async getFinancialOverview(req, res) {
    try {
      const schoolId = req.schoolId;

      // Mock financial data - replace with real calculations
      const overview = {
        totalRevenue: Math.floor(Math.random() * 500000) + 100000,
        pendingPayments: Math.floor(Math.random() * 50000) + 10000,
        totalStudents: await Student.countDocuments({ school: schoolId }),
        collectionRate: Math.floor(Math.random() * 20) + 75 // 75-95%
      };

      res.status(200).json(overview);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'aperçu financier', error: error.message });
    }
  }

  // Get payments
  static async getPayments(req, res) {
    try {
      const { page = 1, limit = 10, status, studentId } = req.query;
      
      // Mock payments data
      const payments = [
        {
          id: 1,
          studentName: 'Marie Dupont',
          amount: 50000,
          status: 'paid',
          dueDate: '2024-01-15',
          paidDate: '2024-01-10',
          type: 'Frais de scolarité'
        },
        {
          id: 2,
          studentName: 'Jean Martin',
          amount: 25000,
          status: 'pending',
          dueDate: '2024-01-20',
          paidDate: null,
          type: 'Frais d\'inscription'
        }
      ];

      res.status(200).json({
        payments,
        totalPages: Math.ceil(payments.length / limit),
        currentPage: parseInt(page),
        total: payments.length
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des paiements', error: error.message });
    }
  }

  // Create payment
  static async createPayment(req, res) {
    try {
      const paymentData = req.body;
      
      // Mock payment creation
      const payment = {
        id: Date.now(),
        ...paymentData,
        createdAt: new Date()
      };

      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création du paiement', error: error.message });
    }
  }

  // Update payment
  static async updatePayment(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Mock payment update
      res.status(200).json({ 
        message: 'Paiement mis à jour avec succès',
        payment: { id, ...updateData }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du paiement', error: error.message });
    }
  }

  // Delete payment
  static async deletePayment(req, res) {
    try {
      const { id } = req.params;

      // Mock payment deletion
      res.status(200).json({ message: 'Paiement supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression du paiement', error: error.message });
    }
  }

  // Get fees
  static async getFees(req, res) {
    try {
      const fees = [
        { name: 'Frais de scolarité', amount: 850000, percentage: 65 },
        { name: 'Frais d\'inscription', amount: 246000, percentage: 19 },
        { name: 'Frais de cantine', amount: 156000, percentage: 12 },
        { name: 'Activités extra-scolaires', amount: 54000, percentage: 4 }
      ];

      res.status(200).json(fees);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des frais', error: error.message });
    }
  }

  // Create fee
  static async createFee(req, res) {
    try {
      const feeData = req.body;
      
      const fee = {
        id: Date.now(),
        ...feeData,
        createdAt: new Date()
      };

      res.status(201).json(fee);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création des frais', error: error.message });
    }
  }

  // Update fee
  static async updateFee(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      res.status(200).json({ 
        message: 'Frais mis à jour avec succès',
        fee: { id, ...updateData }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour des frais', error: error.message });
    }
  }

  // Delete fee
  static async deleteFee(req, res) {
    try {
      const { id } = req.params;

      res.status(200).json({ message: 'Frais supprimés avec succès' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression des frais', error: error.message });
    }
  }

  // Get financial statistics
  static async getFinancialStats(req, res) {
    try {
      const stats = {
        monthlyRevenue: Math.floor(Math.random() * 100000) + 50000,
        yearlyRevenue: Math.floor(Math.random() * 1000000) + 500000,
        pendingAmount: Math.floor(Math.random() * 50000) + 10000,
        collectedAmount: Math.floor(Math.random() * 400000) + 200000,
        paymentDistribution: [
          { name: 'Payé', value: 75, color: '#28A745', amount: 956750 },
          { name: 'En attente', value: 20, color: '#FD7E14', amount: 255400 },
          { name: 'En retard', value: 5, color: '#DC3545', amount: 63850 }
        ]
      };

      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques financières', error: error.message });
    }
  }

  // Get revenue report
  static async getRevenueReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const report = [
        { name: 'Jan', revenus: 98500, objectif: 100000 },
        { name: 'Fev', revenus: 87200, objectif: 100000 },
        { name: 'Mar', revenus: 105300, objectif: 100000 },
        { name: 'Avr', revenus: 92800, objectif: 100000 },
        { name: 'Mai', revenus: 110200, objectif: 100000 },
        { name: 'Jun', revenus: 95600, objectif: 100000 }
      ];

      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du rapport de revenus', error: error.message });
    }
  }

  // Get expenses report
  static async getExpensesReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const report = {
        period: { startDate, endDate },
        totalExpenses: Math.floor(Math.random() * 100000) + 50000,
        breakdown: [
          { category: 'Salaires', amount: 80000 },
          { category: 'Fournitures', amount: 20000 }
        ]
      };

      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du rapport de dépenses', error: error.message });
    }
  }

  // Export payments
  static async exportPayments(req, res) {
    try {
      const { format = 'csv' } = req.query;
      
      // Mock CSV data
      const csvData = "Nom,Montant,Statut,Date d'échéance\nMarie Dupont,50000,Payé,2024-01-15\nJean Martin,25000,En attente,2024-01-20";
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
      res.status(200).send(csvData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'exportation des paiements', error: error.message });
    }
  }

  // Export fees
  static async exportFees(req, res) {
    try {
      const { format = 'csv' } = req.query;
      
      // Mock CSV data
      const csvData = "Nom,Montant,Type,Année académique\nFrais de scolarité,50000,Obligatoire,2023-2024\nFrais d'inscription,25000,Obligatoire,2023-2024";
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fees.csv');
      res.status(200).send(csvData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'exportation des frais', error: error.message });
    }
  }
}

export default FinancesController;
