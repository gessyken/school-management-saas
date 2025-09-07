import api from '@/lib/api';
import { School, SchoolInput } from '@/types';

interface CreateSchoolResponse {
  school: School;
  message: string;
}

export const schoolService = {
  // Créer une nouvelle école
  async createSchool(schoolData: SchoolInput): Promise<School> {
    try {
      const response = await api.post<CreateSchoolResponse>('/schools', schoolData);
      return response.data.school;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  },

  // Récupérer toutes les écoles de l'utilisateur
  async getUserSchools(): Promise<School[]> {
    try {
      const response = await api.get<{ schools: School[] }>('/schools/user');
      return response.data.schools;
    } catch (error) {
      console.error('Error fetching user schools:', error);
      throw error;
    }
  },

  // Mettre à jour une école
  async updateSchool(id: string, schoolData: Partial<SchoolInput>): Promise<School> {
    try {
      const response = await api.put<{ school: School }>(`/schools/${id}`, schoolData);
      return response.data.school;
    } catch (error) {
      console.error('Error updating school:', error);
      throw error;
    }
  },

  // Supprimer une école
  async deleteSchool(id: string): Promise<void> {
    try {
      await api.delete(`/schools/${id}`);
    } catch (error) {
      console.error('Error deleting school:', error);
      throw error;
    }
  },

  // Obtenir les détails d'une école
  async getSchoolById(id: string): Promise<School> {
    try {
      const response = await api.get<{ school: School }>(`/schools/${id}`);
      return response.data.school;
    } catch (error) {
      console.error('Error fetching school:', error);
      throw error;
    }
  }
};

export default schoolService;
