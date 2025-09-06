import Student from '../models/Student.js';
import Classes from '../models/Classes.js';
import Subject from '../models/Subject.js';
import AcademicYear from '../models/AcademicYear.js';

class DashboardController {
  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const schoolId = req.schoolId;

      // Get total students
      const totalStudents = await Student.countDocuments({ school: schoolId });

      // Get total classes
      const totalClasses = await Classes.countDocuments({ school: schoolId });

      // Get students at risk (example: students with average < 10)
      const studentsAtRisk = await Student.countDocuments({ 
        school: schoolId,
        'academicInfo.currentAverage': { $lt: 10 }
      });

      // Calculate pending fees (mock data for now)
      const pendingFees = Math.floor(Math.random() * 50000) + 10000;

      res.status(200).json({
        totalStudents,
        totalClasses,
        studentsAtRisk,
        pendingFees
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
    }
  }

  // Get recent activities
  static async getRecentActivities(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      // Mock recent activities for now
      const activities = [
        {
          id: 1,
          message: 'Nouvel étudiant inscrit: Marie Dupont',
          time: '2 heures',
          type: 'student_added'
        },
        {
          id: 2,
          message: 'Notes saisies pour la classe 6ème A',
          time: '4 heures',
          type: 'grades_added'
        },
        {
          id: 3,
          message: 'Nouveau trimestre créé',
          time: '1 jour',
          type: 'term_created'
        }
      ].slice(0, limit);

      res.status(200).json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des activités', error: error.message });
    }
  }

  // Get chart data
  static async getChartData(req, res) {
    try {
      const { type } = req.params;
      const { period = 'current-month' } = req.query;

      let chartData = {};

      switch (type) {
        case 'class-performance':
          chartData = {
            labels: ['6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B'],
            datasets: [{
              label: 'Moyenne de classe',
              data: [14.2, 13.8, 15.1, 14.5, 13.9, 14.7],
              backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }]
          };
          break;

        case 'attendance':
          chartData = {
            labels: ['Présents', 'Absents', 'Retards'],
            datasets: [{
              data: [85, 10, 5],
              backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
            }]
          };
          break;

        case 'monthly-evolution':
          chartData = {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
            datasets: [{
              label: 'Moyenne générale',
              data: [13.2, 13.8, 14.1, 13.9, 14.3, 14.5],
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }]
          };
          break;

        default:
          return res.status(400).json({ message: 'Type de graphique non supporté' });
      }

      res.status(200).json(chartData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des données de graphique', error: error.message });
    }
  }

  // Get alerts
  static async getAlerts(req, res) {
    try {
      const alerts = [
        {
          id: 1,
          type: 'warning',
          message: '5 étudiants ont une moyenne inférieure à 10',
          isRead: false,
          createdAt: new Date()
        },
        {
          id: 2,
          type: 'info',
          message: 'Nouveau trimestre disponible',
          isRead: false,
          createdAt: new Date()
        }
      ];

      res.status(200).json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des alertes', error: error.message });
    }
  }

  // Mark alert as read
  static async markAlertAsRead(req, res) {
    try {
      const { alertId } = req.params;
      
      // Mock implementation - in real app, update alert in database
      res.status(200).json({ message: 'Alerte marquée comme lue' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'alerte', error: error.message });
    }
  }

  // Get quick actions
  static async getQuickActions(req, res) {
    try {
      const quickActions = [
        { id: 1, name: 'Ajouter un étudiant', icon: 'Users', action: '/students/new' },
        { id: 2, name: 'Créer une classe', icon: 'BookOpen', action: '/classes/new' },
        { id: 3, name: 'Saisir des notes', icon: 'Target', action: '/grades/new' },
        { id: 4, name: 'Générer un rapport', icon: 'FileText', action: '/reports/generate' }
      ];

      res.status(200).json(quickActions);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des actions rapides', error: error.message });
    }
  }

  // Get class performance data
  static async getClassPerformance(req, res) {
    try {
      const schoolId = req.schoolId;
      
      const classes = await Classes.find({ school: schoolId }).select('name level');
      
      const performanceData = classes.map(cls => ({
        className: cls.name,
        average: Math.floor(Math.random() * 5) + 12, // Mock average between 12-17
        studentCount: Math.floor(Math.random() * 20) + 15 // Mock student count
      }));

      res.status(200).json(performanceData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des performances', error: error.message });
    }
  }

  // Get attendance data
  static async getAttendanceData(req, res) {
    try {
      const attendanceData = {
        present: Math.floor(Math.random() * 50) + 200,
        absent: Math.floor(Math.random() * 20) + 5,
        late: Math.floor(Math.random() * 15) + 2
      };

      res.status(200).json(attendanceData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des données d\'assiduité', error: error.message });
    }
  }

  // Get monthly evolution data
  static async getMonthlyEvolution(req, res) {
    try {
      const evolutionData = {
        months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        averages: [13.2, 13.8, 14.1, 13.9, 14.3, 14.5],
        studentCounts: [180, 185, 190, 188, 192, 195]
      };

      res.status(200).json(evolutionData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'évolution mensuelle', error: error.message });
    }
  }
}

export default DashboardController;
