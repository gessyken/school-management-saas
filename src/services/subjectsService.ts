import api from '@/lib/api';

export const subjectsService = {
  async getSubjects(params = {}): Promise<any[]> {
    // params can include: search, status, system, level, teacher, year, page, limit
    try {
      const res = await api.get('/subjects', { params });
      return res.data?.subjects || [];
    } catch {
      return [];
    }
  },

  async getSubjectById(id: string): Promise<any> {
    try {
      const res = await api.get(`/subjects/${id}`);
      return res.data?.subject || null;
    } catch {
      return null;
    }
  },

  async getSubjectsByLevel(level: string, params = {}): Promise<any[]> {
    try {
      const res = await api.get(`/subjects/level/${level}`, { params });
      return res.data?.subjects || [];
    } catch {
      return [];
    }
  },

  async getSubjectsByTeacher(teacherId: string): Promise<any[]> {
    try {
      const res = await api.get(`/subjects/teacher/${teacherId}`);
      return res.data?.subjects || [];
    } catch {
      return [];
    }
  },

  async getSubjectsForSchool(schoolId: string, params = {}): Promise<any[]> {
    try {
      const res = await api.get(`/subjects/school/${schoolId}`, { params });
      return res.data?.subjects || [];
    } catch {
      return [];
    }
  },

  async getSubjectStatistics(): Promise<any> {
    try {
      const res = await api.get('/subjects/stats');
      return res.data?.statistics || {};
    } catch {
      return {};
    }
  },

  async createSubject(subjectData: any): Promise<any> {
    try {
      // Map frontend fields to backend schema
      const payload = {
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description || '',
        year: subjectData.year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        coefficients: subjectData.coefficients,
        weeklyHours: Number(subjectData.weeklyHours ?? 0),
        mainTeacher: subjectData.mainTeacher || subjectData.teacherId, // Use mainTeacher ID
        teachers: subjectData.teachers || [], // Array of teacher IDs
        levels: subjectData.levels || subjectData.level || [],
        educationSystem: subjectData.educationSystem || 'bilingue',
        specialties: subjectData.specialties || subjectData.specialty || [],
        isRequired: subjectData.isRequired || subjectData.required || false,
        isActive: subjectData.isActive !== undefined ? subjectData.isActive : true,
        color: subjectData.color || '#3B82F6',
        // school and createdBy will be added by backend middleware
      };
      const res = await api.post('/subjects', payload);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async updateSubject(id: string, subjectData: any): Promise<any> {
    console.log("here")
    try {
      const payload = {
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description || '',
        year: subjectData.year,
        coefficients: subjectData.coefficients,
        weeklyHours: Number(subjectData.weeklyHours ?? 0),
        mainTeacher: subjectData.mainTeacher || subjectData.teacherId,
        teachers: subjectData.teachers || [],
        levels: subjectData.levels || subjectData.level || [],
        educationSystem: subjectData.educationSystem,
        specialties: subjectData.specialties || subjectData.specialty || [],
        isRequired: subjectData.isRequired || subjectData.required || false,
        isActive: subjectData.isActive,
        color: subjectData.color,
      };
      const res = await api.put(`/subjects/${id}`, payload);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  // In your subjectsService.ts
  async createManySubjects(subjectsArray: any[]) {
    const response = await api.post('/subjects/bulk', subjectsArray);
    return response.data;
  },
  async bulkUpdateSubjects(subjectIds: string[], updates: any): Promise<any> {
    try {
      const res = await api.patch('/subjects/bulk/update', {
        subjectIds,
        updates
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async toggleActiveStatus(id: string): Promise<any> {
    try {
      const res = await api.patch(`/subjects/${id}/toggle`);
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
      await api.delete('/subjects/purge/all', {
        data: { confirmation: 'CONFIRM_DELETE_ALL' }
      });
    } catch (error) {
      throw error;
    }
  },

  // Helper method to get coefficient for a specific level/specialty
  getCoefficientForLevel(subject: any, level: string, specialty?: string): number {
    if (!subject?.coefficients) return subject?.coefficient || 1;

    // First try exact match with specialty
    if (specialty) {
      const exactMatch = subject.coefficients.find(
        (c: any) => c.level === level && c.specialty === specialty
      );
      if (exactMatch) return exactMatch.value;
    }

    // Then try level-only coefficient
    const levelMatch = subject.coefficients.find(
      (c: any) => c.level === level && !c.specialty
    );

    return levelMatch ? levelMatch.value : (subject.coefficient || 1);
  }
};