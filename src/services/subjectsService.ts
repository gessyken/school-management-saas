import api from '@/lib/api';

export const subjectsService = {
  async getSubjects(): Promise<any[]> {
    // Expected shape: [{ id, name, code, description, coefficient, weeklyHours, teacher, level, isActive, color }, ...]
    try {
      const res = await api.get('/subjects');
      return res.data?.subjects || [];
    } catch {
      return [];
    }
  },

  async createSubject(subjectData: any): Promise<any> {
    try {
      const res = await api.post('/subjects', subjectData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async updateSubject(id: string, subjectData: any): Promise<any> {
    try {
      const res = await api.put(`/subjects/${id}`, subjectData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteSubject(id: string): Promise<void> {
    try {
      await api.delete(`/subjects/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
