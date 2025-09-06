import api from '@/lib/api';

export const subjectSeedService = {
  // Créer les matières pré-définies du système camerounais
  async seedCameroonianSubjects(): Promise<any> {
    try {
      const res = await api.post('/subjects/seed-cameroon');
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtenir les matières suggérées pour un niveau et système donné
  async getSuggestedSubjects(params: {
    level?: string;
    educationSystem?: string;
    specialty?: string;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.level) queryParams.append('level', params.level);
      if (params.educationSystem) queryParams.append('educationSystem', params.educationSystem);
      if (params.specialty) queryParams.append('specialty', params.specialty);

      const res = await api.get(`/subjects/suggested?${queryParams.toString()}`);
      return res.data?.subjects || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des matières suggérées:', error);
      return [];
    }
  }
};
