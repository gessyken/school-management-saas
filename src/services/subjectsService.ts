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
      const payload = {
        subjectName: subjectData.name,
        subjectCode: subjectData.code,
        description: subjectData.description || '',
        baseCoefficient: subjectData.baseCoefficient ?? subjectData.coefficient ?? 1,
        coefficientsByLevel: subjectData.coefficientsByLevel || {},
        weeklyHours: Number(subjectData.weeklyHours ?? 0),
        teacher: subjectData.teacher || undefined,
        teachers: Array.isArray(subjectData.teachers) ? subjectData.teachers : undefined,
        levels: Array.isArray(subjectData.level) ? subjectData.level : (Array.isArray(subjectData.levels) ? subjectData.levels : []),
        educationSystem: subjectData.educationSystem, // optional
        specialty: subjectData.specialty, // optional array
        required: subjectData.required,
        color: subjectData.color || '#3B82F6',
        isActive: subjectData.isActive !== undefined ? !!subjectData.isActive : true,
      };
      const res = await api.post('/subjects', payload);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async updateSubject(id: string, subjectData: any): Promise<any> {
    try {
      const payload = {
        subjectName: subjectData.name,
        subjectCode: subjectData.code,
        description: subjectData.description || '',
        baseCoefficient: subjectData.baseCoefficient ?? subjectData.coefficient ?? 1,
        coefficientsByLevel: subjectData.coefficientsByLevel || {},
        weeklyHours: Number(subjectData.weeklyHours ?? 0),
        teacher: subjectData.teacher || undefined,
        teachers: Array.isArray(subjectData.teachers) ? subjectData.teachers : undefined,
        levels: Array.isArray(subjectData.level) ? subjectData.level : (Array.isArray(subjectData.levels) ? subjectData.levels : []),
        educationSystem: subjectData.educationSystem,
        specialty: subjectData.specialty,
        required: subjectData.required,
        color: subjectData.color || '#3B82F6',
        isActive: subjectData.isActive !== undefined ? !!subjectData.isActive : true,
      };
      const res = await api.put(`/subjects/${id}`, payload);
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

  async purgeSubjects(): Promise<void> {
    try {
      await api.delete('/subjects/purge/all');
    } catch (error) {
      throw error;
    }
  },
};
