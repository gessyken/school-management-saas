import api from '../lib/api';
import { Student, PaginatedResponse, Attendance, Grade } from '@/types';

const studentService = {
  /**
   * Récupérer la liste des élèves avec pagination
   */
  getStudents: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    class_id?: string;
    academic_year_id?: string;
    status?: string;
  }): Promise<PaginatedResponse<Student>> => {
    const response = await api.get<PaginatedResponse<Student>>('/students', { params });
    return response.data;
  },

  /**
   * Récupérer un élève par son ID
   */
  getStudent: async (id: string): Promise<Student> => {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  },

  /**
   * Créer un nouvel élève
   */
  createStudent: async (studentData: Partial<Student>): Promise<Student> => {
    const response = await api.post<Student>('/students', studentData);
    return response.data;
  },

  /**
   * Mettre à jour un élève existant
   */
  updateStudent: async (id: string, studentData: Partial<Student>): Promise<Student> => {
    const response = await api.put<Student>(`/students/${id}`, studentData);
    return response.data;
  },

  /**
   * Supprimer un élève
   */
  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  /**
   * Récupérer les élèves à risque (absences fréquentes, mauvaises notes)
   */
  getAtRiskStudents: async (params?: {
    academic_year_id?: string;
    class_id?: string;
  }): Promise<Student[]> => {
    const response = await api.get<Student[]>('/students/at-risk', { params });
    return response.data;
  },

  /**
   * Récupérer les présences d'un élève
   */
  getStudentAttendance: async (id: string, params?: {
    start_date?: string;
    end_date?: string;
    academic_year_id?: string;
  }): Promise<Attendance[]> => {
    const response = await api.get<Attendance[]>(`/students/${id}/attendance`, { params });
    return response.data;
  },

  /**
   * Récupérer les performances académiques d'un élève
   */
  getStudentPerformance: async (id: string, params?: {
    academic_year_id?: string;
    term?: 'first' | 'second' | 'third' | 'annual';
  }): Promise<{
    grades: Grade[];
    average: number;
    rank: number;
    class_average: number;
  }> => {
    const response = await api.get(`/students/${id}/performance`, { params });
    return response.data;
  },

  /**
   * Importer des élèves à partir d'un fichier CSV
   */
  importStudents: async (formData: FormData): Promise<{
    imported: number;
    errors: Array<{ row: number; message: string }>;
  }> => {
    const response = await api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Télécharger le modèle CSV pour l'importation d'élèves
   */
  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/students/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Générer un matricule pour un nouvel élève
   */
  generateRegistrationNumber: async (params: {
    school_id: string;
    academic_year_id: string;
    school_prefix?: string;
  }): Promise<{ registration_number: string }> => {
    const response = await api.get<{ registration_number: string }>('/students/generate-registration-number', {
      params,
    });
    return response.data;
  },

  /**
   * Vérifier si un matricule existe déjà
   */
  checkRegistrationNumberExists: async (registrationNumber: string): Promise<boolean> => {
    const response = await api.get<{ exists: boolean }>('/students/check-registration-number', {
      params: { registration_number: registrationNumber },
    });
    return response.data.exists;
  },
};

export default studentService;