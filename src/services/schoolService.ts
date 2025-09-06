import api from '@/lib/api';
import { School, PaginatedResponse } from '@/types';

export const schoolService = {
  /**
   * Récupérer la liste des écoles avec pagination
   */
  getSchools: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: 'active' | 'inactive';
  }): Promise<PaginatedResponse<School>> => {
    const response = await api.get<PaginatedResponse<School>>('/schools', { params });
    return response.data;
  },

  /**
   * Récupérer une école par son ID
   */
  getSchool: async (id: string): Promise<School> => {
    const response = await api.get<School>(`/schools/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle école
   */
  createSchool: async (schoolData: Partial<School>): Promise<School> => {
    const response = await api.post<School>('/schools', schoolData);
    return response.data;
  },

  /**
   * Mettre à jour une école existante
   */
  updateSchool: async (id: string, schoolData: Partial<School>): Promise<School> => {
    const response = await api.put<School>(`/schools/${id}`, schoolData);
    return response.data;
  },

  /**
   * Supprimer une école
   */
  deleteSchool: async (id: string): Promise<void> => {
    await api.delete(`/schools/${id}`);
  },

  /**
   * Activer ou désactiver une école
   */
  toggleSchoolStatus: async (id: string, active: boolean): Promise<School> => {
    const response = await api.patch<School>(`/schools/${id}/status`, { active });
    return response.data;
  },

  /**
   * Récupérer les utilisateurs d'une école
   */
  getSchoolUsers: async (id: string, params?: {
    page?: number;
    per_page?: number;
    role?: string;
  }): Promise<PaginatedResponse<any>> => {
    const response = await api.get<PaginatedResponse<any>>(`/schools/${id}/users`, { params });
    return response.data;
  }
};