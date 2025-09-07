import api from '@/lib/api';

export const classesService = {
  async getClasses(): Promise<any[]> {
    // Expected shape: [{ id, name, level, section, specialty, educationSystem, capacity, currentStudents, teacher, room, subjects, averageGrade, attendanceRate, schedule }, ...]
    try {
      const res = await api.get('/classes');
      const raw = res.data?.classes || [];
      return Array.isArray(raw)
        ? raw.map((c: any) => ({ id: c.id || c._id, name: c.name || c.classesName || c.className, ...c }))
        : [];
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

  async bulkCreateClasses(items: any[]): Promise<{ savedClasses: any[]; errors: any[]; message?: string }> {
    try {
      const res = await api.post('/classes/bulk', { classes: items });
      return {
        savedClasses: res.data?.savedClasses || [],
        errors: res.data?.errors || [],
        message: res.data?.message,
      };
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

  async addSubjectsToClass(classId: string, subjects: Array<{ subjectInfo: string; coefficient?: number; teacherInfo?: string }>): Promise<any> {
    try {
      const res = await api.put(`/classes/${classId}/add_subject`, { subjects });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
 
  // Get subjects of a class
  async getClassSubjects(classId: string): Promise<any> {
    try {
      const res = await api.get(`/classes/${classId}/subjects`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Set/replace all subjects of a class
  async setClassSubjects(classId: string, subjects: Array<{ subjectInfo: string; coefficient?: number; isActive?: boolean; teacherInfo?: string }>): Promise<any> {
    try {
      const res = await api.put(`/classes/${classId}/subjects`, { subjects });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh subjects based on class level/educationSystem/specialty
  async refreshClassSubjects(classId: string): Promise<any> {
    try {
      const res = await api.post(`/classes/${classId}/refresh-subjects`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
