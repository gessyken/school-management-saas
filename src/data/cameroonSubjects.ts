// cameroonSubjects.ts
// Matières du système scolaire camerounais
// Organisées par système (francophone/anglophone) et par niveau

export interface SubjectData {
  subjectCode: string;
  subjectName: string;
  description: string;
  levels: string[]; // e.g., ['6e', '1ère A', 'Upper Sixth Arts']
  coefficient?: number;
}

// Helper to get unique levels from a subject list
const getUniqueLevels = (subjects: SubjectData[]) => {
  const allLevels = new Set<string>();
  subjects.forEach(subject => {
    subject.levels.forEach(level => allLevels.add(level));
  });
  return Array.from(allLevels).sort(); // Sort for consistent order
};

// Système Francophone
export const francophonieSubjects: SubjectData[] = [
  // Matières communes à tous les niveaux du secondaire
  {
    subjectCode: 'FR',
    subjectName: 'Français',
    description: 'Langue française et littérature',
    levels: ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 4
  },
  {
    subjectCode: 'MATH',
    subjectName: 'Mathématiques',
    description: 'Mathématiques générales',
    levels: ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 4
  },
  {
    subjectCode: 'ANG',
    subjectName: 'Anglais',
    description: 'Langue anglaise',
    levels: ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 3
  },
  {
    subjectCode: 'HG',
    subjectName: 'Histoire-Géographie',
    description: 'Histoire et géographie',
    levels: ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 3
  },
  {
    subjectCode: 'SVT',
    subjectName: 'Sciences de la Vie et de la Terre',
    description: 'Biologie et sciences naturelles',
    levels: ['6e', '5e', '4e', '3e', '2nde', '1ère C', '1ère D', 'Terminale C', 'Terminale D'],
    coefficient: 3
  },
  {
    subjectCode: 'PC',
    subjectName: 'Physique-Chimie',
    description: 'Sciences physiques et chimie',
    levels: ['4e', '3e', '2nde', '1ère C', '1ère D', '1ère TI', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 3
  },
  {
    subjectCode: 'EPS',
    subjectName: 'Éducation Physique et Sportive',
    description: 'Sport et éducation physique',
    levels: ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 2
  },
  {
    subjectCode: 'AP',
    subjectName: 'Arts Plastiques',
    description: 'Arts visuels et plastiques',
    levels: ['6e', '5e', '4e', '3e', '2nde', '1ère A'],
    coefficient: 2
  },
  {
    subjectCode: 'MUS',
    subjectName: 'Musique',
    description: 'Éducation musicale',
    levels: ['6e', '5e', '4e', '3e'],
    coefficient: 2
  },
  {
    subjectCode: 'TECH',
    subjectName: 'Technologie',
    description: 'Éducation technologique',
    levels: ['6e', '5e', '4e', '3e'],
    coefficient: 2
  },
  {
    subjectCode: 'ECM',
    subjectName: 'Éducation à la Citoyenneté et à la Morale',
    description: 'Éducation civique et morale',
    levels: ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 1
  },
  {
    subjectCode: 'ALL',
    subjectName: 'Allemand',
    description: 'Langue allemande (LV2)',
    levels: ['4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 2
  },
  {
    subjectCode: 'ESP',
    subjectName: 'Espagnol',
    description: 'Langue espagnole (LV2)',
    levels: ['4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 2
  },
  {
    subjectCode: 'LAT',
    subjectName: 'Latin',
    description: 'Langue latine',
    levels: ['5e', '4e', '3e', '2nde', '1ère A'],
    coefficient: 2
  },
  // Matières spécialisées pour le lycée
  {
    subjectCode: 'PHILO',
    subjectName: 'Philosophie',
    description: 'Philosophie',
    levels: ['Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'],
    coefficient: 4
  },
  {
    subjectCode: 'SES',
    subjectName: 'Sciences Économiques et Sociales',
    description: 'Économie et sciences sociales',
    levels: ['2nde', '1ère A', 'Terminale A'],
    coefficient: 3
  },
  {
    subjectCode: 'INFO',
    subjectName: 'Informatique',
    description: 'Sciences informatiques',
    levels: ['2nde', '1ère TI', 'Terminale TI'],
    coefficient: 2
  },
  // Matières spécifiques aux séries
  {
    subjectCode: 'SI',
    subjectName: 'Sciences de l\'Ingénieur',
    description: 'Sciences et techniques industrielles',
    levels: ['1ère TI', 'Terminale TI'],
    coefficient: 4
  },
  {
    subjectCode: 'LITT',
    subjectName: 'Littérature',
    description: 'Littérature française et comparée',
    levels: ['1ère A', 'Terminale A'],
    coefficient: 4
  },
  {
    subjectCode: 'ECON',
    subjectName: 'Économie',
    description: 'Sciences économiques',
    levels: ['1ère A', 'Terminale A'],
    coefficient: 3
  }
];

// Système Anglophone
export const anglophonieSubjects: SubjectData[] = [
  // Core subjects for all levels
  {
    subjectCode: 'ENG',
    subjectName: 'English Language',
    description: 'English language and literature',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Lower Sixth Science', 'Lower Sixth Commercial', 'Lower Sixth Technical', 'Upper Sixth Arts', 'Upper Sixth Science', 'Upper Sixth Commercial', 'Upper Sixth Technical'],
    coefficient: 4
  },
  {
    subjectCode: 'MATHS',
    subjectName: 'Mathematics',
    description: 'General mathematics',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Lower Sixth Science', 'Lower Sixth Commercial', 'Lower Sixth Technical', 'Upper Sixth Arts', 'Upper Sixth Science', 'Upper Sixth Commercial', 'Upper Sixth Technical'],
    coefficient: 4
  },
  {
    subjectCode: 'FRENCH',
    subjectName: 'French',
    description: 'French language',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Lower Sixth Science', 'Lower Sixth Commercial', 'Lower Sixth Technical', 'Upper Sixth Arts', 'Upper Sixth Science', 'Upper Sixth Commercial', 'Upper Sixth Technical'],
    coefficient: 3
  },
  {
    subjectCode: 'HIST',
    subjectName: 'History',
    description: 'World and African history',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Upper Sixth Arts'],
    coefficient: 3
  },
  {
    subjectCode: 'GEOG',
    subjectName: 'Geography',
    description: 'Physical and human geography',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Lower Sixth Science', 'Upper Sixth Arts', 'Upper Sixth Science'],
    coefficient: 3
  },
  {
    subjectCode: 'BIO',
    subjectName: 'Biology',
    description: 'Biological sciences',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Science', 'Upper Sixth Science'],
    coefficient: 3
  },
  {
    subjectCode: 'CHEM',
    subjectName: 'Chemistry',
    description: 'Chemical sciences',
    levels: ['Form 3', 'Form 4', 'Form 5', 'Lower Sixth Science', 'Upper Sixth Science'],
    coefficient: 3
  },
  {
    subjectCode: 'PHYS',
    subjectName: 'Physics',
    description: 'Physical sciences',
    levels: ['Form 3', 'Form 4', 'Form 5', 'Lower Sixth Science', 'Upper Sixth Science', 'Lower Sixth Technical', 'Upper Sixth Technical'],
    coefficient: 3
  },
  {
    subjectCode: 'PE',
    subjectName: 'Physical Education',
    description: 'Sports and physical education',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Lower Sixth Science', 'Lower Sixth Commercial', 'Lower Sixth Technical', 'Upper Sixth Arts', 'Upper Sixth Science', 'Upper Sixth Commercial', 'Upper Sixth Technical'],
    coefficient: 2
  },
  {
    subjectCode: 'ART',
    subjectName: 'Art',
    description: 'Visual arts and crafts',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Upper Sixth Arts'],
    coefficient: 2
  },
  {
    subjectCode: 'MUS',
    subjectName: 'Music',
    description: 'Music education',
    levels: ['Form 1', 'Form 2', 'Form 3'],
    coefficient: 2
  },
  {
    subjectCode: 'ICT',
    subjectName: 'Information and Communication Technology',
    description: 'Computer studies and ICT',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Lower Sixth Science', 'Lower Sixth Commercial', 'Lower Sixth Technical', 'Upper Sixth Arts', 'Upper Sixth Science', 'Upper Sixth Commercial', 'Upper Sixth Technical'],
    coefficient: 2
  },
  {
    subjectCode: 'RE',
    subjectName: 'Religious Education',
    description: 'Religious and moral education',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'],
    coefficient: 1
  },
  {
    subjectCode: 'CRK',
    subjectName: 'Christian Religious Knowledge',
    description: 'Christian religious studies',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Upper Sixth Arts'],
    coefficient: 1
  },
  {
    subjectCode: 'IRK',
    subjectName: 'Islamic Religious Knowledge',
    description: 'Islamic religious studies',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Upper Sixth Arts'],
    coefficient: 1
  },
  {
    subjectCode: 'ECON',
    subjectName: 'Economics',
    description: 'Economic principles and applications',
    levels: ['Form 4', 'Form 5', 'Lower Sixth Commercial', 'Upper Sixth Commercial'],
    coefficient: 3
  },
  {
    subjectCode: 'ACC',
    subjectName: 'Accounting',
    description: 'Financial accounting principles',
    levels: ['Form 4', 'Form 5', 'Lower Sixth Commercial', 'Upper Sixth Commercial'],
    coefficient: 3
  },
  {
    subjectCode: 'COMM',
    subjectName: 'Commerce',
    description: 'Business and commercial studies',
    levels: ['Form 4', 'Form 5', 'Lower Sixth Commercial', 'Upper Sixth Commercial'],
    coefficient: 3
  },
  {
    subjectCode: 'LIT',
    subjectName: 'Literature in English',
    description: 'English literature studies',
    levels: ['Form 4', 'Form 5', 'Lower Sixth Arts', 'Upper Sixth Arts'],
    coefficient: 3
  },
  {
    subjectCode: 'FLIT',
    subjectName: 'French Literature',
    description: 'French literature studies',
    levels: ['Form 4', 'Form 5', 'Lower Sixth Arts', 'Upper Sixth Arts'],
    coefficient: 3
  },
  {
    subjectCode: 'AGRIC',
    subjectName: 'Agricultural Science',
    description: 'Agricultural sciences',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Science', 'Upper Sixth Science'],
    coefficient: 2
  },
  {
    subjectCode: 'HE',
    subjectName: 'Home Economics',
    description: 'Home management and nutrition',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Arts', 'Upper Sixth Arts'], // Can also be Science or Tech depending on specific curriculum
    coefficient: 2
  },
  {
    subjectCode: 'TD',
    subjectName: 'Technical Drawing',
    description: 'Engineering and technical drawing',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Technical', 'Upper Sixth Technical'],
    coefficient: 2
  },
  {
    subjectCode: 'WW',
    subjectName: 'Wood Work',
    description: 'Woodworking and carpentry',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Technical', 'Upper Sixth Technical'],
    coefficient: 2
  },
  {
    subjectCode: 'MW',
    subjectName: 'Metal Work',
    description: 'Metalworking and fabrication',
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth Technical', 'Upper Sixth Technical'],
    coefficient: 2
  },
  {
    subjectCode: 'PHIL',
    subjectName: 'Philosophy',
    description: 'Philosophical studies',
    levels: ['Upper Sixth Arts'],
    coefficient: 4
  },
  {
    subjectCode: 'FMATH',
    subjectName: 'Further Mathematics',
    description: 'Advanced mathematics',
    levels: ['Lower Sixth Science', 'Lower Sixth Technical', 'Upper Sixth Science', 'Upper Sixth Technical'],
    coefficient: 4
  },
  {
    subjectCode: 'COMP',
    subjectName: 'Computer Science',
    description: 'Advanced computer science',
    levels: ['Lower Sixth Science', 'Lower Sixth Technical', 'Upper Sixth Science', 'Upper Sixth Technical'],
    coefficient: 3
  }
];

// Fonction pour obtenir toutes les matières
export const getAllCameroonSubjects = () => {
  return {
    francophone: francophonieSubjects,
    anglophone: anglophonieSubjects
  };
};

// Fonction pour obtenir les matières par niveau
export const getSubjectsByLevel = (level: string, system: 'francophone' | 'anglophone') => {
  const subjects = system === 'francophone' ? francophonieSubjects : anglophonieSubjects;
  return subjects.filter(subject => subject.levels.includes(level));
};

// Fonction pour obtenir tous les niveaux disponibles, structurés par système
export const getAllLevelsStructured = (): { francophone: string[], anglophone: string[] } => {
  const francophoneLevels = getUniqueLevels(francophonieSubjects);
  const anglophoneLevels = getUniqueLevels(anglophonieSubjects);

  return {
    francophone: francophoneLevels,
    anglophone: anglophoneLevels
  };
};

// Fonction pour obtenir les niveaux par cycle (simplified for example, may need refinement)
export const getLevelsByCycle = () => {
  const allStructured = getAllLevelsStructured();
  return {
    college: {
      francophone: allStructured.francophone.filter(level => ['6e', '5e', '4e', '3e'].includes(level)),
      anglophone: allStructured.anglophone.filter(level => ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'].includes(level))
    },
    lycee: {
      francophone: allStructured.francophone.filter(level => !['6e', '5e', '4e', '3e'].includes(level)),
      anglophone: allStructured.anglophone.filter(level => !['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'].includes(level))
    }
  };
};

// Fonction pour obtenir les séries disponibles
export const getSeries = () => {
  return {
    francophone: ['A', 'C', 'D', 'TI'],
    anglophone: ['Arts', 'Science', 'Commercial', 'Technical'] // More descriptive
  };
};

// Fonction pour obtenir les niveaux avec séries
export const getLevelsWithSeries = (system: 'francophone' | 'anglophone') => {
  const series = getSeries();
  if (system === 'francophone') {
    return {
      premiere: series.francophone.map(s => `1ère ${s}`),
      terminale: series.francophone.map(s => `Terminale ${s}`)
    };
  } else {
    return {
      lowerSixth: series.anglophone.map(s => `Lower Sixth ${s}`),
      upperSixth: series.anglophone.map(s => `Upper Sixth ${s}`)
    };
  }
};

// Keep the old getAllLevels for backward compatibility if needed, but advise using getAllLevelsStructured
export const getAllLevels = (): string[] => {
  const structured = getAllLevelsStructured();
  return [...structured.francophone, ...structured.anglophone].sort();
};