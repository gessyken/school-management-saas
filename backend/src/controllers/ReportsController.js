import Student from '../models/Student.js';
import Classes from '../models/Classes.js';
import Subject from '../models/Subject.js';
import AcademicYear from '../models/AcademicYear.js';

class ReportsController {
  // Generate report
  static async generateReport(req, res) {
    try {
      const { type, parameters } = req.body;
      const schoolId = req.schoolId;

      let reportData = {};

      switch (type) {
        case 'student-performance':
          reportData = await ReportsController.generateStudentPerformanceReport(schoolId, parameters);
          break;
        case 'class-summary':
          reportData = await ReportsController.generateClassSummaryReport(schoolId, parameters);
          break;
        case 'academic-overview':
          reportData = await ReportsController.generateAcademicOverviewReport(schoolId, parameters);
          break;
        case 'financial-summary':
          reportData = await ReportsController.generateFinancialSummaryReport(schoolId, parameters);
          break;
        default:
          return res.status(400).json({ message: 'Type de rapport non supporté' });
      }

      const report = {
        id: Date.now(),
        type,
        data: reportData,
        generatedAt: new Date(),
        parameters
      };

      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du rapport', error: error.message });
    }
  }

  // Get available report types
  static async getReportTypes(req, res) {
    try {
      const reportTypes = [
        {
          id: '1',
          name: 'Bulletin individuel',
          description: 'Bulletin de notes personnalisé pour chaque élève',
          type: 'bulletin',
          color: '#A8D8EA',
          generated: 847,
          lastGenerated: '2024-02-15',
        },
        {
          id: '2',
          name: 'Rapport de classe',
          description: 'Synthèse des performances par classe',
          type: 'class',
          color: '#D4AC0D',
          generated: 42,
          lastGenerated: '2024-02-10',
        },
        {
          id: '3',
          name: 'Statistiques école',
          description: 'Vue d\'ensemble des performances de l\'établissement',
          type: 'school',
          color: '#28A745',
          generated: 12,
          lastGenerated: '2024-02-01',
        },
        {
          id: '4',
          name: 'Analyse comparative',
          description: 'Comparaison des résultats par matière et niveau',
          type: 'statistics',
          color: '#FD7E14',
          generated: 8,
          lastGenerated: '2024-01-28',
        },
        {
          id: 'student-performance',
          name: 'Rapport de performance étudiant',
          description: 'Analyse détaillée des performances d\'un étudiant',
          parameters: ['studentId', 'period']
        },
        {
          id: 'class-summary',
          name: 'Résumé de classe',
          description: 'Vue d\'ensemble des performances d\'une classe',
          parameters: ['classId', 'subject', 'period']
        },
        {
          id: 'academic-overview',
          name: 'Vue d\'ensemble académique',
          description: 'Statistiques générales de l\'établissement',
          parameters: ['academicYear', 'level']
        },
        {
          id: 'financial-summary',
          name: 'Résumé financier',
          description: 'Rapport financier de l\'établissement',
          parameters: ['period', 'category']
        }
      ];
      
      res.status(200).json(reportTypes);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des types de rapports', error: error.message });
    }
  }

  // Get student report
  static async getStudentReport(req, res) {
    try {
      const { studentId } = req.params;
      const schoolId = req.schoolId;

      const student = await Student.findOne({ _id: studentId, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Étudiant non trouvé' });
      }

      const report = {
        student: {
          name: `${student.firstName} ${student.lastName}`,
          registrationNumber: student.registrationNumber,
          class: student.currentClass
        },
        academicPerformance: {
          currentAverage: student.academicInfo?.currentAverage || 0,
          rank: student.academicInfo?.classRank || 'N/A',
          subjects: [
            { name: 'Mathématiques', average: 14.5, rank: 3 },
            { name: 'Français', average: 13.2, rank: 5 },
            { name: 'Sciences', average: 15.8, rank: 2 }
          ]
        },
        attendance: {
          present: 85,
          absent: 5,
          late: 3,
          rate: '94.4%'
        },
        behavior: {
          conduct: 'Excellent',
          disciplinaryActions: 0,
          commendations: 2
        }
      };

      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du rapport étudiant', error: error.message });
    }
  }

  // Get student transcript
  static async getStudentTranscript(req, res) {
    try {
      const { studentId } = req.params;
      const schoolId = req.schoolId;

      const student = await Student.findOne({ _id: studentId, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Étudiant non trouvé' });
      }

      const transcript = {
        student: {
          name: `${student.firstName} ${student.lastName}`,
          registrationNumber: student.registrationNumber,
          dateOfBirth: student.dateOfBirth
        },
        academicHistory: [
          {
            year: '2023-2024',
            class: '6ème A',
            subjects: [
              { name: 'Mathématiques', term1: 14, term2: 15, term3: 14.5, average: 14.5 },
              { name: 'Français', term1: 13, term2: 13.5, term3: 13, average: 13.2 }
            ],
            overallAverage: 13.85,
            rank: 5,
            totalStudents: 35
          }
        ]
      };

      res.status(200).json(transcript);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du relevé de notes', error: error.message });
    }
  }

  // Get class report
  static async getClassReport(req, res) {
    try {
      const { classId } = req.params;
      const schoolId = req.schoolId;

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Classe non trouvée' });
      }

      const report = {
        class: {
          name: classData.name,
          level: classData.level,
          studentCount: classData.students?.length || 0
        },
        performance: {
          classAverage: 14.2,
          highestAverage: 17.5,
          lowestAverage: 8.3,
          passRate: 78.5
        },
        subjects: [
          { name: 'Mathématiques', average: 13.8, passRate: 75 },
          { name: 'Français', average: 14.5, passRate: 82 },
          { name: 'Sciences', average: 14.9, passRate: 85 }
        ],
        attendance: {
          averageRate: 92.3,
          totalAbsences: 45,
          chronicAbsentees: 3
        }
      };

      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du rapport de classe', error: error.message });
    }
  }

  // Get class performance report
  static async getClassPerformanceReport(req, res) {
    try {
      const { classId } = req.params;
      const { period } = req.query;

      const performanceData = {
        period,
        trends: {
          improving: 12,
          stable: 18,
          declining: 5
        },
        topPerformers: [
          { name: 'Marie Dupont', average: 17.5 },
          { name: 'Jean Martin', average: 16.8 },
          { name: 'Sophie Bernard', average: 16.2 }
        ],
        needsAttention: [
          { name: 'Paul Durand', average: 8.3, issues: ['Absences fréquentes'] },
          { name: 'Lisa Moreau', average: 9.1, issues: ['Difficultés en mathématiques'] }
        ]
      };

      res.status(200).json(performanceData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du rapport de performance', error: error.message });
    }
  }

  // Get academic summary
  static async getAcademicSummary(req, res) {
    try {
      const schoolId = req.schoolId;
      const { academicYear } = req.query;

      const summary = {
        academicYear,
        enrollment: {
          totalStudents: await Student.countDocuments({ school: schoolId }),
          newEnrollments: Math.floor(Math.random() * 50) + 20,
          transfers: Math.floor(Math.random() * 10) + 2
        },
        performance: {
          schoolAverage: 14.1,
          passRate: 82.3,
          excellenceRate: 15.7
        },
        byLevel: [
          { level: '6ème', students: 120, average: 13.8, passRate: 78 },
          { level: '5ème', students: 115, average: 14.2, passRate: 83 },
          { level: '4ème', students: 110, average: 14.5, passRate: 85 }
        ]
      };

      res.status(200).json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du résumé académique', error: error.message });
    }
  }

  // Get academic statistics
  static async getAcademicStatistics(req, res) {
    try {
      const statistics = {
        enrollment: {
          total: 345,
          byGender: { male: 180, female: 165 },
          byLevel: { '6ème': 120, '5ème': 115, '4ème': 110 }
        },
        performance: {
          averageBySubject: [
            { subject: 'Mathématiques', average: 13.5 },
            { subject: 'Français', average: 14.2 },
            { subject: 'Sciences', average: 14.8 }
          ],
          distribution: {
            excellent: 54,    // >= 16
            good: 138,        // 14-16
            average: 103,     // 12-14
            belowAverage: 50  // < 12
          }
        },
        attendance: {
          overall: 93.2,
          byLevel: { '6ème': 91.5, '5ème': 94.1, '4ème': 94.8 }
        }
      };

      res.status(200).json(statistics);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques académiques', error: error.message });
    }
  }

  // Get financial overview
  static async getFinancialOverview(req, res) {
    try {
      const overview = {
        revenue: {
          total: 15750000,
          collected: 13500000,
          pending: 2250000,
          collectionRate: 85.7
        },
        expenses: {
          salaries: 8500000,
          infrastructure: 2100000,
          supplies: 850000,
          other: 1200000
        },
        profitability: {
          grossProfit: 3100000,
          netProfit: 2650000,
          margin: 16.8
        }
      };

      res.status(200).json(overview);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération de l\'aperçu financier', error: error.message });
    }
  }

  // Get payments report
  static async getPaymentsReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const report = {
        period: { startDate, endDate },
        summary: {
          totalPayments: 156,
          totalAmount: 7800000,
          averagePayment: 50000,
          onTimePayments: 142,
          latePayments: 14
        },
        byPaymentType: [
          { type: 'Frais de scolarité', count: 120, amount: 6000000 },
          { type: 'Frais d\'inscription', count: 36, amount: 1800000 }
        ],
        trends: {
          monthlyCollection: [
            { month: 'Janvier', amount: 2600000 },
            { month: 'Février', amount: 2800000 },
            { month: 'Mars', amount: 2400000 }
          ]
        }
      };

      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du rapport de paiements', error: error.message });
    }
  }

  // Export report
  static async exportReport(req, res) {
    try {
      const { reportId } = req.params;
      const { format = 'pdf' } = req.query;

      // Mock export - in real implementation, generate actual file
      const exportData = {
        reportId,
        format,
        downloadUrl: `/api/reports/download/${reportId}.${format}`,
        generatedAt: new Date()
      };

      res.status(200).json(exportData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'exportation du rapport', error: error.message });
    }
  }

  // Export custom report
  static async exportCustomReport(req, res) {
    try {
      const { reportConfig } = req.body;
      
      // Mock custom export
      const exportId = Date.now();
      const exportData = {
        exportId,
        status: 'processing',
        estimatedTime: '2-3 minutes',
        downloadUrl: `/api/reports/download/custom-${exportId}.pdf`
      };

      res.status(202).json(exportData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'exportation personnalisée', error: error.message });
    }
  }

  // Get report history
  static async getReportHistory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const history = [
        {
          id: '1',
          name: 'Bulletins 6ème A - 2e Trimestre',
          type: 'bulletin',
          generated: '2024-02-15 14:30',
          size: '2.4 MB',
          studentCount: 28,
        },
        {
          id: '2',
          name: 'Rapport classe 5ème B',
          type: 'class',
          generated: '2024-02-14 09:15',
          size: '856 KB',
          studentCount: 27,
        },
        {
          id: '3',
          name: 'Statistiques établissement - Février',
          type: 'school',
          generated: '2024-02-10 16:45',
          size: '1.2 MB',
          studentCount: 1247,
        },
      ];

      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique', error: error.message });
    }
  }

  // Delete report
  static async deleteReport(req, res) {
    try {
      const { reportId } = req.params;

      // Mock deletion
      res.status(200).json({ message: 'Rapport supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression du rapport', error: error.message });
    }
  }

  // Helper methods for report generation
  static async generateStudentPerformanceReport(schoolId, parameters) {
    // Implementation for student performance report
    return {
      studentId: parameters.studentId,
      period: parameters.period,
      performance: { average: 14.5, rank: 3 },
      subjects: []
    };
  }

  static async generateClassSummaryReport(schoolId, parameters) {
    // Implementation for class summary report
    return {
      classId: parameters.classId,
      summary: { average: 14.2, studentCount: 35 },
      performance: []
    };
  }

  static async generateAcademicOverviewReport(schoolId, parameters) {
    // Implementation for academic overview report
    return {
      academicYear: parameters.academicYear,
      overview: { totalStudents: 345, average: 14.1 },
      statistics: []
    };
  }

  static async generateFinancialSummaryReport(schoolId, parameters) {
    // Implementation for financial summary report
    return {
      period: parameters.period,
      revenue: 15750000,
      expenses: 12650000,
      profit: 3100000
    };
  }
}

export default ReportsController;
