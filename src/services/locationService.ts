// Import removed as it's not being used in this file

// Types pour les régions et départements du Cameroun
type Region = {
  id: number;
  name: string;
  name_en?: string;
};

type Department = {
  id: number;
  name: string;
  name_en?: string;
  region_id: number;
};

// Données des régions du Cameroun
export const cameroonRegions: Region[] = [
  { id: 1, name: 'Adamaoua', name_en: 'Adamawa' },
  { id: 2, name: 'Centre' },
  { id: 3, name: 'Est', name_en: 'East' },
  { id: 4, name: 'Extrême-Nord', name_en: 'Far North' },
  { id: 5, name: 'Littoral' },
  { id: 6, name: 'Nord', name_en: 'North' },
  { id: 7, name: 'Nord-Ouest', name_en: 'North-West' },
  { id: 8, name: 'Ouest', name_en: 'West' },
  { id: 9, name: 'Sud', name_en: 'South' },
  { id: 10, name: 'Sud-Ouest', name_en: 'South-West' }
];

// Données des départements du Cameroun
export const cameroonDepartments: Department[] = [
  // Adamaoua
  { id: 1, name: 'Djérem', region_id: 1 },
  { id: 2, name: 'Faro-et-Déo', region_id: 1 },
  { id: 3, name: 'Mayo-Banyo', region_id: 1 },
  { id: 4, name: 'Mbéré', region_id: 1 },
  { id: 5, name: 'Vina', region_id: 1 },
  
  // Centre
  { id: 6, name: 'Haute-Sanaga', region_id: 2 },
  { id: 7, name: 'Lekié', region_id: 2 },
  { id: 8, name: 'Mbam-et-Inoubou', region_id: 2 },
  { id: 9, name: 'Mbam-et-Kim', region_id: 2 },
  { id: 10, name: 'Méfou-et-Afamba', region_id: 2 },
  { id: 11, name: 'Méfou-et-Akono', region_id: 2 },
  { id: 12, name: 'Mfoundi', region_id: 2 },
  { id: 13, name: 'Nyong-et-Kellé', region_id: 2 },
  { id: 14, name: 'Nyong-et-Mfoumou', region_id: 2 },
  { id: 15, name: 'Nyong-et-So\'o', region_id: 2 },
  
  // Est
  { id: 16, name: 'Boumba-et-Ngoko', region_id: 3 },
  { id: 17, name: 'Haut-Nyong', region_id: 3 },
  { id: 18, name: 'Kadey', region_id: 3 },
  { id: 19, name: 'Lom-et-Djérem', region_id: 3 },
  
  // Extrême-Nord
  { id: 20, name: 'Diamaré', region_id: 4 },
  { id: 21, name: 'Logone-et-Chari', region_id: 4 },
  { id: 22, name: 'Mayo-Danay', region_id: 4 },
  { id: 23, name: 'Mayo-Kani', region_id: 4 },
  { id: 24, name: 'Mayo-Sava', region_id: 4 },
  { id: 25, name: 'Mayo-Tsanaga', region_id: 4 },
  
  // Littoral
  { id: 26, name: 'Moungo', region_id: 5 },
  { id: 27, name: 'Nkam', region_id: 5 },
  { id: 28, name: 'Sanaga-Maritime', region_id: 5 },
  { id: 29, name: 'Wouri', region_id: 5 },
  
  // Nord
  { id: 30, name: 'Bénoué', region_id: 6 },
  { id: 31, name: 'Faro', region_id: 6 },
  { id: 32, name: 'Mayo-Louti', region_id: 6 },
  { id: 33, name: 'Mayo-Rey', region_id: 6 },
  
  // Nord-Ouest
  { id: 34, name: 'Boyo', region_id: 7 },
  { id: 35, name: 'Bui', region_id: 7 },
  { id: 36, name: 'Donga-Mantung', region_id: 7 },
  { id: 37, name: 'Menchum', region_id: 7 },
  { id: 38, name: 'Mezam', region_id: 7 },
  { id: 39, name: 'Momo', region_id: 7 },
  { id: 40, name: 'Ngo-Ketunjia', region_id: 7 },
  
  // Ouest
  { id: 41, name: 'Bamboutos', region_id: 8 },
  { id: 42, name: 'Haut-Nkam', region_id: 8 },
  { id: 43, name: 'Hauts-Plateaux', region_id: 8 },
  { id: 44, name: 'Koung-Khi', region_id: 8 },
  { id: 45, name: 'Menoua', region_id: 8 },
  { id: 46, name: 'Mifi', region_id: 8 },
  { id: 47, name: 'Ndé', region_id: 8 },
  { id: 48, name: 'Noun', region_id: 8 },
  
  // Sud
  { id: 49, name: 'Dja-et-Lobo', region_id: 9 },
  { id: 50, name: 'Mvila', region_id: 9 },
  { id: 51, name: 'Océan', region_id: 9 },
  { id: 52, name: 'Vallée-du-Ntem', region_id: 9 },
  
  // Sud-Ouest
  { id: 53, name: 'Fako', region_id: 10 },
  { id: 54, name: 'Koupé-Manengouba', region_id: 10 },
  { id: 55, name: 'Lebialem', region_id: 10 },
  { id: 56, name: 'Manyu', region_id: 10 },
  { id: 57, name: 'Meme', region_id: 10 },
  { id: 58, name: 'Ndian', region_id: 10 }
];

// Service pour les opérations liées aux localisations
const locationService = {
  /**
   * Récupérer la liste des régions
   */
  getRegions: async () => {
    return cameroonRegions;
  },

  /**
   * Récupérer la liste des départements
   */
  getDepartments: async (regionId?: number) => {
    if (regionId) {
      return cameroonDepartments.filter(dept => dept.region_id === regionId);
    }
    return cameroonDepartments;
  }
};

export default locationService;