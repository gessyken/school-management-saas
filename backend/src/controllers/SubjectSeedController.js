import Subject from '../models/Subject.js';

class SubjectSeedController {
  // Endpoint pour initialiser quelques matières de base (optionnel)
  async seedCameroonianSubjects(req, res) {
    try {
      const schoolId = req.schoolId;
      
      // Vérifier si des matières existent déjà
      const existingSubjects = await Subject.find({ school: schoolId });
      
      if (existingSubjects.length > 0) {
        return res.json({ 
          message: 'Des matières existent déjà dans la base de données',
          existingCount: existingSubjects.length,
          note: 'Utilisez la section Matières pour ajouter de nouvelles matières'
        });
      }

      res.status(200).json({
        message: 'Aucune matière prédéfinie. Utilisez la section Matières pour créer vos propres matières.',
        created: 0,
        note: 'Créez vos matières personnalisées dans la section Matières avec les coefficients adaptés à votre établissement.'
      });

    } catch (error) {
      console.error('Erreur lors de la création des matières:', error);
      res.status(500).json({ 
        message: 'Erreur serveur lors de la création des matières', 
        error: error.message 
      });
    }
  }

  // Obtenir les matières suggérées pour un niveau et système donné
  async getSuggestedSubjects(req, res) {
    try {
      const { level, educationSystem, specialty } = req.query;
      const schoolId = req.schoolId;

      let query = { 
        school: schoolId,
        isActive: true,
        $or: [
          { educationSystem: educationSystem },
          { educationSystem: 'both' }
        ]
      };

      // Filtrer par niveau si spécifié
      if (level && level !== 'Général') {
        query.$and = [
          {
            $or: [
              { levels: level },
              { levels: 'Général' }
            ]
          }
        ];
      } else {
        query.$and = [{ levels: 'Général' }];
      }

      const subjects = await Subject.find(query).sort({ required: -1, subjectName: 1 });

      res.json({ 
        subjects: subjects.map(subject => {
          // Get coefficient for specific level or use base coefficient
          const coefficient = subject.coefficientsByLevel?.get(level) || subject.baseCoefficient || subject.coefficient || 1;
          return {
            id: subject._id,
            name: subject.subjectName,
            code: subject.subjectCode,
            coefficient: coefficient,
            weeklyHours: subject.weeklyHours,
            required: subject.required,
            color: subject.color,
            levels: subject.levels,
            educationSystem: subject.educationSystem
          };
        })
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des matières suggérées:', error);
      res.status(500).json({ 
        message: 'Erreur serveur', 
        error: error.message 
      });
    }
  }
}

export default new SubjectSeedController();
