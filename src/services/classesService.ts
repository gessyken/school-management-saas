import api from '@/lib/api';

export const classesService = {
  async getClasses(): Promise<any[]> {
    // Expected shape: [{ id, name, level, section, specialty, educationSystem, capacity, currentStudents, teacher, room, subjects, averageGrade, attendanceRate, schedule }, ...]
    try {
      const res = await api.get('/classes');
      return res.data?.classes || [];
    } catch {
      return [];
    }
  },

  async createClass(classData: any): Promise<any> {
    try {
      const res = await api.post('/classes', classData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async updateClass(id: string, classData: any): Promise<any> {
    try {
      const res = await api.put(`/classes/${id}`, classData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteClass(id: string): Promise<void> {
    try {
      await api.delete(`/classes/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
