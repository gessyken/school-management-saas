// Système éducatif camerounais - Francophone et Anglophone

export const EDUCATION_SYSTEMS = {
  FRANCOPHONE: 'francophone',
  ANGLOPHONE: 'anglophone'
} as const;

export const FRANCOPHONE_LEVELS = [
  { id: '6eme', name: '6ème', cycle: 'Collège' },
  { id: '5eme', name: '5ème', cycle: 'Collège' },
  { id: '4eme', name: '4ème', cycle: 'Collège' },
  { id: '3eme', name: '3ème', cycle: 'Collège' },
  { id: '2nde', name: '2nde', cycle: 'Lycée' },
  { id: '1ere', name: '1ère', cycle: 'Lycée' },
  { id: 'terminale', name: 'Terminale', cycle: 'Lycée' }
];

export const ANGLOPHONE_LEVELS = [
  { id: 'form1', name: 'Form 1', cycle: 'Secondary' },
  { id: 'form2', name: 'Form 2', cycle: 'Secondary' },
  { id: 'form3', name: 'Form 3', cycle: 'Secondary' },
  { id: 'form4', name: 'Form 4', cycle: 'Secondary' },
  { id: 'form5', name: 'Form 5', cycle: 'Secondary' },
  { id: 'lower6', name: 'Lower Sixth', cycle: 'High School' },
  { id: 'upper6', name: 'Upper Sixth', cycle: 'High School' }
];

export const FRANCOPHONE_SPECIALTIES = {
  '2nde': [
    { id: 'generale', name: 'Seconde Générale' }
  ],
  '1ere': [
    { id: 'A', name: '1ère A (Littéraire)' },
    { id: 'C', name: '1ère C (Mathématiques-Sciences Physiques)' },
    { id: 'D', name: '1ère D (Mathématiques-Sciences Naturelles)' },
    { id: 'E', name: '1ère E (Mathématiques-Techniques)' },
    { id: 'F', name: '1ère F (Électrotechnique)' },
    { id: 'G', name: '1ère G (Secrétariat-Bureautique)' },
    { id: 'TI', name: '1ère TI (Techniques Industrielles)' }
  ],
  'terminale': [
    { id: 'A4', name: 'Terminale A4 (Littéraire Allemand)' },
    { id: 'A5', name: 'Terminale A5 (Littéraire Espagnol)' },
    { id: 'C', name: 'Terminale C (Mathématiques-Sciences Physiques)' },
    { id: 'D', name: 'Terminale D (Mathématiques-Sciences Naturelles)' },
    { id: 'E', name: 'Terminale E (Mathématiques-Techniques)' },
    { id: 'F1', name: 'Terminale F1 (Électrotechnique)' },
    { id: 'F2', name: 'Terminale F2 (Mécanique)' },
    { id: 'F3', name: 'Terminale F3 (Électronique)' },
    { id: 'G1', name: 'Terminale G1 (Secrétariat)' },
    { id: 'G2', name: 'Terminale G2 (Comptabilité)' },
    { id: 'G3', name: 'Terminale G3 (Commerce)' },
    { id: 'TI', name: 'Terminale TI (Techniques Industrielles)' }
  ]
};

export const ANGLOPHONE_SPECIALTIES = {
  'lower6': [
    { id: 'arts', name: 'Arts' },
    { id: 'science', name: 'Science' },
    { id: 'commercial', name: 'Commercial' }
  ],
  'upper6': [
    { id: 'arts', name: 'Arts' },
    { id: 'science', name: 'Science' },
    { id: 'commercial', name: 'Commercial' }
  ]
};

export const FRANCOPHONE_SUBJECTS_BY_LEVEL = {
  '6eme': [
    { id: 'francais', name: 'Français', coefficient: 4, required: true },
    { id: 'mathematiques', name: 'Mathématiques', coefficient: 4, required: true },
    { id: 'anglais', name: 'Anglais', coefficient: 3, required: true },
    { id: 'histoire_geo', name: 'Histoire-Géographie', coefficient: 3, required: true },
    { id: 'svt', name: 'Sciences de la Vie et de la Terre', coefficient: 2, required: true },
    { id: 'pct', name: 'Physique-Chimie-Technologie', coefficient: 2, required: true },
    { id: 'eps', name: 'Éducation Physique et Sportive', coefficient: 1, required: true },
    { id: 'edhc', name: 'Éducation à la Citoyenneté', coefficient: 1, required: true },
    { id: 'informatique', name: 'Informatique', coefficient: 1, required: false },
    { id: 'allemand', name: 'Allemand', coefficient: 2, required: false },
    { id: 'espagnol', name: 'Espagnol', coefficient: 2, required: false }
  ],
  '5eme': [
    { id: 'francais', name: 'Français', coefficient: 4, required: true },
    { id: 'mathematiques', name: 'Mathématiques', coefficient: 4, required: true },
    { id: 'anglais', name: 'Anglais', coefficient: 3, required: true },
    { id: 'histoire_geo', name: 'Histoire-Géographie', coefficient: 3, required: true },
    { id: 'svt', name: 'Sciences de la Vie et de la Terre', coefficient: 2, required: true },
    { id: 'pct', name: 'Physique-Chimie-Technologie', coefficient: 2, required: true },
    { id: 'eps', name: 'Éducation Physique et Sportive', coefficient: 1, required: true },
    { id: 'edhc', name: 'Éducation à la Citoyenneté', coefficient: 1, required: true },
    { id: 'informatique', name: 'Informatique', coefficient: 1, required: false },
    { id: 'allemand', name: 'Allemand', coefficient: 2, required: false },
    { id: 'espagnol', name: 'Espagnol', coefficient: 2, required: false }
  ],
  '4eme': [
    { id: 'francais', name: 'Français', coefficient: 4, required: true },
    { id: 'mathematiques', name: 'Mathématiques', coefficient: 4, required: true },
    { id: 'anglais', name: 'Anglais', coefficient: 3, required: true },
    { id: 'histoire_geo', name: 'Histoire-Géographie', coefficient: 3, required: true },
    { id: 'svt', name: 'Sciences de la Vie et de la Terre', coefficient: 3, required: true },
    { id: 'sciences_physiques', name: 'Sciences Physiques', coefficient: 3, required: true },
    { id: 'eps', name: 'Éducation Physique et Sportive', coefficient: 1, required: true },
    { id: 'edhc', name: 'Éducation à la Citoyenneté', coefficient: 1, required: true },
    { id: 'informatique', name: 'Informatique', coefficient: 2, required: false },
    { id: 'allemand', name: 'Allemand', coefficient: 2, required: false },
    { id: 'espagnol', name: 'Espagnol', coefficient: 2, required: false }
  ],
  '3eme': [
    { id: 'francais', name: 'Français', coefficient: 4, required: true },
    { id: 'mathematiques', name: 'Mathématiques', coefficient: 4, required: true },
    { id: 'anglais', name: 'Anglais', coefficient: 3, required: true },
    { id: 'histoire_geo', name: 'Histoire-Géographie', coefficient: 3, required: true },
    { id: 'svt', name: 'Sciences de la Vie et de la Terre', coefficient: 3, required: true },
    { id: 'sciences_physiques', name: 'Sciences Physiques', coefficient: 3, required: true },
    { id: 'eps', name: 'Éducation Physique et Sportive', coefficient: 1, required: true },
    { id: 'edhc', name: 'Éducation à la Citoyenneté', coefficient: 1, required: true },
    { id: 'informatique', name: 'Informatique', coefficient: 2, required: false },
    { id: 'allemand', name: 'Allemand', coefficient: 2, required: false },
    { id: 'espagnol', name: 'Espagnol', coefficient: 2, required: false }
  ]
};

export const FRANCOPHONE_SUBJECTS_BY_SPECIALTY = {
  // Terminale C - Mathématiques-Sciences Physiques
  'C': [
    { id: 'mathematiques', name: 'Mathématiques', coefficient: 7, required: true },
    { id: 'sciences_physiques', name: 'Sciences Physiques', coefficient: 6, required: true },
    { id: 'svt', name: 'Sciences de la Vie et de la Terre', coefficient: 3, required: true },
    { id: 'francais', name: 'Français', coefficient: 3, required: true },
    { id: 'anglais', name: 'Anglais', coefficient: 2, required: true },
    { id: 'histoire_geo', name: 'Histoire-Géographie', coefficient: 2, required: true },
    { id: 'philosophie', name: 'Philosophie', coefficient: 2, required: true },
    { id: 'eps', name: 'Éducation Physique et Sportive', coefficient: 1, required: true },
    { id: 'edhc', name: 'Éducation à la Citoyenneté', coefficient: 1, required: true }
  ],
  // Terminale D - Mathématiques-Sciences Naturelles
  'D': [
    { id: 'mathematiques', name: 'Mathématiques', coefficient: 6, required: true },
    { id: 'svt', name: 'Sciences de la Vie et de la Terre', coefficient: 6, required: true },
    { id: 'sciences_physiques', name: 'Sciences Physiques', coefficient: 4, required: true },
    { id: 'francais', name: 'Français', coefficient: 3, required: true },
    { id: 'anglais', name: 'Anglais', coefficient: 2, required: true },
    { id: 'histoire_geo', name: 'Histoire-Géographie', coefficient: 2, required: true },
    { id: 'philosophie', name: 'Philosophie', coefficient: 2, required: true },
    { id: 'eps', name: 'Éducation Physique et Sportive', coefficient: 1, required: true },
    { id: 'edhc', name: 'Éducation à la Citoyenneté', coefficient: 1, required: true }
  ],
  // Terminale A4 - Littéraire Allemand
  'A4': [
    { id: 'francais', name: 'Français', coefficient: 5, required: true },
    { id: 'allemand', name: 'Allemand', coefficient: 4, required: true },
    { id: 'anglais', name: 'Anglais', coefficient: 3, required: true },
    { id: 'histoire_geo', name: 'Histoire-Géographie', coefficient: 4, required: true },
    { id: 'philosophie', name: 'Philosophie', coefficient: 3, required: true },
    { id: 'mathematiques', name: 'Mathématiques', coefficient: 3, required: true },
    { id: 'svt', name: 'Sciences de la Vie et de la Terre', coefficient: 2, required: true },
    { id: 'eps', name: 'Éducation Physique et Sportive', coefficient: 1, required: true },
    { id: 'edhc', name: 'Éducation à la Citoyenneté', coefficient: 1, required: true }
  ]
};

export const ANGLOPHONE_SUBJECTS_BY_LEVEL = {
  'form1': [
    { id: 'english', name: 'English Language', coefficient: 4, required: true },
    { id: 'mathematics', name: 'Mathematics', coefficient: 4, required: true },
    { id: 'french', name: 'French', coefficient: 3, required: true },
    { id: 'history', name: 'History', coefficient: 2, required: true },
    { id: 'geography', name: 'Geography', coefficient: 2, required: true },
    { id: 'biology', name: 'Biology', coefficient: 2, required: true },
    { id: 'physics', name: 'Physics', coefficient: 2, required: true },
    { id: 'chemistry', name: 'Chemistry', coefficient: 2, required: true },
    { id: 'computer_science', name: 'Computer Science', coefficient: 1, required: false },
    { id: 'moral_education', name: 'Moral Education', coefficient: 1, required: true }
  ],
  'upper6_science': [
    { id: 'mathematics', name: 'Mathematics', coefficient: 6, required: true },
    { id: 'physics', name: 'Physics', coefficient: 5, required: true },
    { id: 'chemistry', name: 'Chemistry', coefficient: 4, required: true },
    { id: 'biology', name: 'Biology', coefficient: 4, required: true },
    { id: 'english', name: 'English Language', coefficient: 3, required: true },
    { id: 'french', name: 'French', coefficient: 2, required: true },
    { id: 'computer_science', name: 'Computer Science', coefficient: 2, required: false }
  ]
};

// Fonction utilitaire pour obtenir les matières suggérées
export const getSuggestedSubjects = (
  educationSystem: string,
  level: string,
  specialty?: string
): any[] => {
  console.warn('getSuggestedSubjects is deprecated. Use backend API /subjects/suggested instead.');
  if (educationSystem === EDUCATION_SYSTEMS.FRANCOPHONE) {
    if (specialty && FRANCOPHONE_SUBJECTS_BY_SPECIALTY[specialty]) {
      return FRANCOPHONE_SUBJECTS_BY_SPECIALTY[specialty];
    }
    return FRANCOPHONE_SUBJECTS_BY_LEVEL[level] || [];
  } else if (educationSystem === EDUCATION_SYSTEMS.ANGLOPHONE) {
    const key = specialty ? `${level}_${specialty}` : level;
    return ANGLOPHONE_SUBJECTS_BY_LEVEL[key] || ANGLOPHONE_SUBJECTS_BY_LEVEL[level] || [];
  }
  return [];
}

// Fonction pour obtenir les spécialités disponibles
export function getAvailableSpecialties(system: string, level: string) {
  if (system === EDUCATION_SYSTEMS.FRANCOPHONE) {
    return FRANCOPHONE_SPECIALTIES[level] || [];
  } else if (system === EDUCATION_SYSTEMS.ANGLOPHONE) {
    return ANGLOPHONE_SPECIALTIES[level] || [];
  }
  return [];
}
