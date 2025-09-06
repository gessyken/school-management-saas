import Subject from '../models/Subject.js';

class SubjectSeedController {
  // Créer les matières pré-définies pour le système camerounais
  async seedCameroonianSubjects(req, res) {
    try {
      const schoolId = req.schoolId;
      
      // Matières communes (francophone et anglophone)
      const commonSubjects = [
        { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 4, weeklyHours: 6, educationSystem: 'francophone', level: 'Général', required: true, color: '#EF4444' },
        { subjectCode: 'MATHS', subjectName: 'Mathematics', coefficient: 4, weeklyHours: 6, educationSystem: 'anglophone', level: 'Général', required: true, color: '#EF4444' },
        { subjectCode: 'FR', subjectName: 'Français', coefficient: 4, weeklyHours: 5, educationSystem: 'francophone', level: 'Général', required: true, color: '#3B82F6' },
        { subjectCode: 'ENG', subjectName: 'English Language', coefficient: 4, weeklyHours: 5, educationSystem: 'anglophone', level: 'Général', required: true, color: '#3B82F6' },
        { subjectCode: 'PHY', subjectName: 'Physique', coefficient: 3, weeklyHours: 4, educationSystem: 'francophone', level: 'Général', required: false, color: '#10B981' },
        { subjectCode: 'PHYS', subjectName: 'Physics', coefficient: 3, weeklyHours: 4, educationSystem: 'anglophone', level: 'Général', required: false, color: '#10B981' },
        { subjectCode: 'CHIM', subjectName: 'Chimie', coefficient: 2, weeklyHours: 3, educationSystem: 'francophone', level: 'Général', required: false, color: '#F59E0B' },
        { subjectCode: 'CHEM', subjectName: 'Chemistry', coefficient: 2, weeklyHours: 3, educationSystem: 'anglophone', level: 'Général', required: false, color: '#F59E0B' },
        { subjectCode: 'BIO', subjectName: 'Biologie', coefficient: 2, weeklyHours: 3, educationSystem: 'francophone', level: 'Général', required: false, color: '#22C55E' },
        { subjectCode: 'BIOL', subjectName: 'Biology', coefficient: 2, weeklyHours: 3, educationSystem: 'anglophone', level: 'Général', required: false, color: '#22C55E' },
      ];

      // Matières spécifiques au système francophone
      const francophonieSubjects = [
        { subjectCode: 'HIST-GEO', subjectName: 'Histoire-Géographie', coefficient: 3, weeklyHours: 4, educationSystem: 'francophone', level: 'Général', required: true, color: '#8B5CF6' },
        { subjectCode: 'PHIL', subjectName: 'Philosophie', coefficient: 3, weeklyHours: 3, educationSystem: 'francophone', level: 'Terminale', required: true, color: '#EC4899' },
        { subjectCode: 'ECM', subjectName: 'Éducation Civique et Morale', coefficient: 1, weeklyHours: 1, educationSystem: 'francophone', level: 'Général', required: true, color: '#6366F1' },
        { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 2, weeklyHours: 3, educationSystem: 'francophone', level: 'Général', required: true, color: '#14B8A6' },
        { subjectCode: 'ALL', subjectName: 'Allemand', coefficient: 2, weeklyHours: 3, educationSystem: 'francophone', level: 'Général', required: false, color: '#F97316' },
        { subjectCode: 'ESP', subjectName: 'Espagnol', coefficient: 2, weeklyHours: 3, educationSystem: 'francophone', level: 'Général', required: false, color: '#EF4444' },
        { subjectCode: 'SVT', subjectName: 'Sciences de la Vie et de la Terre', coefficient: 2, weeklyHours: 3, educationSystem: 'francophone', level: 'Général', required: false, color: '#84CC16' },
        { subjectCode: 'SES', subjectName: 'Sciences Économiques et Sociales', coefficient: 3, weeklyHours: 4, educationSystem: 'francophone', level: 'Général', required: false, color: '#06B6D4' },
        { subjectCode: 'INFO', subjectName: 'Informatique', coefficient: 2, weeklyHours: 2, educationSystem: 'francophone', level: 'Général', required: false, color: '#8B5CF6' },
        { subjectCode: 'EPS', subjectName: 'Éducation Physique et Sportive', coefficient: 1, weeklyHours: 2, educationSystem: 'francophone', level: 'Général', required: true, color: '#F59E0B' },
      ];

      // Matières spécifiques au système anglophone
      const anglophonieSubjects = [
        { subjectCode: 'HIST', subjectName: 'History', coefficient: 3, weeklyHours: 4, educationSystem: 'anglophone', level: 'Général', required: true, color: '#8B5CF6' },
        { subjectCode: 'GEO', subjectName: 'Geography', coefficient: 3, weeklyHours: 4, educationSystem: 'anglophone', level: 'Général', required: false, color: '#84CC16' },
        { subjectCode: 'LIT', subjectName: 'Literature', coefficient: 3, weeklyHours: 3, educationSystem: 'anglophone', level: 'Général', required: false, color: '#EC4899' },
        { subjectCode: 'ECON', subjectName: 'Economics', coefficient: 3, weeklyHours: 4, educationSystem: 'anglophone', level: 'Général', required: false, color: '#06B6D4' },
        { subjectCode: 'GOVT', subjectName: 'Government', coefficient: 2, weeklyHours: 3, educationSystem: 'anglophone', level: 'Général', required: false, color: '#6366F1' },
        { subjectCode: 'FR-L2', subjectName: 'French (Second Language)', coefficient: 2, weeklyHours: 3, educationSystem: 'anglophone', level: 'Général', required: true, color: '#14B8A6' },
        { subjectCode: 'ICT', subjectName: 'Information and Communication Technology', coefficient: 2, weeklyHours: 2, educationSystem: 'anglophone', level: 'Général', required: false, color: '#8B5CF6' },
        { subjectCode: 'PE', subjectName: 'Physical Education', coefficient: 1, weeklyHours: 2, educationSystem: 'anglophone', level: 'Général', required: true, color: '#F59E0B' },
        { subjectCode: 'REL', subjectName: 'Religious Studies', coefficient: 1, weeklyHours: 2, educationSystem: 'anglophone', level: 'Général', required: false, color: '#A855F7' },
      ];

      // Matières techniques et professionnelles
      const technicalSubjects = [
        { subjectCode: 'TECH-IND', subjectName: 'Technologie Industrielle', coefficient: 3, weeklyHours: 4, educationSystem: 'francophone', level: 'Général', required: false, color: '#DC2626' },
        { subjectCode: 'TECH-COM', subjectName: 'Technologie Commerciale', coefficient: 3, weeklyHours: 4, educationSystem: 'francophone', level: 'Général', required: false, color: '#059669' },
        { subjectCode: 'COMP', subjectName: 'Computer Studies', coefficient: 3, weeklyHours: 4, educationSystem: 'anglophone', level: 'Général', required: false, color: '#7C3AED' },
        { subjectCode: 'ACC', subjectName: 'Accounting', coefficient: 3, weeklyHours: 4, educationSystem: 'anglophone', level: 'Général', required: false, color: '#059669' },
      ];

      const allSubjects = [...commonSubjects, ...francophonieSubjects, ...anglophonieSubjects, ...technicalSubjects];
      
      // Vérifier si les matières existent déjà
      const existingSubjects = await Subject.find({ school: schoolId });
      const existingCodes = existingSubjects.map(s => s.subjectCode);
      
      // Filtrer les matières qui n'existent pas encore
      const newSubjects = allSubjects.filter(subject => !existingCodes.includes(subject.subjectCode));
      
      if (newSubjects.length === 0) {
        return res.json({ 
          message: 'Toutes les matières sont déjà présentes dans la base de données',
          existingCount: existingSubjects.length 
        });
      }

      // Ajouter l'ID de l'école à chaque matière
      const subjectsWithSchool = newSubjects.map(subject => ({
        ...subject,
        school: schoolId
      }));

      // Insérer les nouvelles matières
      const createdSubjects = await Subject.insertMany(subjectsWithSchool);

      res.status(201).json({
        message: `${createdSubjects.length} matières créées avec succès`,
        created: createdSubjects.length,
        existing: existingSubjects.length,
        total: existingSubjects.length + createdSubjects.length,
        subjects: createdSubjects
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
        query.$or.push(
          { level: level },
          { level: 'Général' }
        );
      } else {
        query.$or.push({ level: 'Général' });
      }

      const subjects = await Subject.find(query).sort({ required: -1, subjectName: 1 });

      res.json({ 
        subjects: subjects.map(subject => ({
          id: subject._id,
          name: subject.subjectName,
          code: subject.subjectCode,
          coefficient: subject.coefficient,
          weeklyHours: subject.weeklyHours,
          required: subject.required,
          color: subject.color,
          level: subject.level,
          educationSystem: subject.educationSystem
        }))
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
