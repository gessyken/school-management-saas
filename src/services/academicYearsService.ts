import api from '@/lib/api';

export const academicYearsService = {
  async getAcademicYears(): Promise<any[]> {
    // Expected shape: [{ id, name, startDate, endDate, status, studentCount, classCount, averageGrade, terms }, ...]
    try {
      const res = await api.get('/academic-years');
      return res.data || [];
    } catch {
      return [];
    }
  },

  async createAcademicYear(yearData: any): Promise<any> {
    try {
      const res = await api.post('/academic-years', yearData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async updateAcademicYear(id: string, yearData: any): Promise<any> {
    try {
      const res = await api.put(`/academic-years/${id}`, yearData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteAcademicYear(id: string): Promise<void> {
    try {
      await api.delete(`/academic-years/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
