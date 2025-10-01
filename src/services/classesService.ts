import api from '@/lib/api';

export const classesService = {
  async getClasses(params = {}): Promise<any[]> {
    // params can include: year, status, level, educationSystem, search
    try {
      const res = await api.get('/classes', { params });
      const raw = res.data?.classes || [];
      return Array.isArray(raw)
        ? raw.map((c: any) => ({ 
            id: c.id || c._id, 
            name: c.name || c.classesName || c.className, 
            level: c.level,
            section: c.section,
            specialty: c.specialty,
            educationSystem: c.educationSystem,
            capacity: c.capacity,
            currentStudents: c.currentStudents,
            teacher: c.teacher,
            room: c.room,
            subjects: c.subjects || [],
            averageGrade: c.averageGrade,
            attendanceRate: c.attendanceRate,
            schedule: c.schedule,
            isActive: c.isActive,
            status: c.status,
            year: c.year,
            ...c 
          }))
        : [];
    } catch {
      return [];
    }
  },

  async getClassStatistics(): Promise<any> {
    try {
      const res = await api.get('/classes/stats');
      return res.data?.statistics || {};
    } catch (error) {
      throw error;
    }
  },

  async getClassesByLevel(level: string, params = {}): Promise<any[]> {
    try {
      const res = await api.get(`/classes/level/${level}`, { params });
      return res.data?.classes || [];
    } catch (error) {
      throw error;
    }
  },

  async getClassesByTeacher(teacherId: string): Promise<any[]> {
    try {
      const res = await api.get(`/classes/teacher/${teacherId}`);
      return res.data?.classes || [];
    } catch (error) {
      throw error;
    }
  },

  async createClass(classData: any): Promise<any> {
    try {
      // Map frontend data to backend format
      const payload = {
        name: classData.name,
        level: classData.level,
        section: classData.section,
        specialty: classData.specialty,
        educationSystem: classData.educationSystem,
        capacity: classData.capacity,
        currentStudents: classData.currentStudents || 0,
        teacher: classData.teacher,
        mainTeacher: classData.mainTeacher,
        room: classData.room,
        description: classData.description,
        subjects: classData.subjects || [],
        subjectDetails: classData.subjectDetails || [],
        year: classData.year,
        isActive: classData.isActive !== undefined ? classData.isActive : true,
        amountFee: classData.amountFee || 0,
        status: classData.status || 'Open'
      };
      
      const res = await api.post('/classes', payload);
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

  async toggleClassStatus(id: string): Promise<any> {
    try {
      const res = await api.patch(`/classes/${id}/toggle-status`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async purgeClasses(): Promise<void> {
    try {
      await api.delete('/classes/purge/all', {
        data: { confirmation: 'CONFIRM_DELETE_ALL' }
      });
    } catch (error) {
      throw error;
    }
  },

  // Subject management
  async getClassSubjects(classId: string): Promise<any> {
    try {
      const res = await api.get(`/classes/${classId}/subjects`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async setClassSubjects(classId: string, subjects: Array<{ 
    subjectInfo: string; 
    coefficient?: number; 
    isActive?: boolean; 
    teacherInfo?: string 
  }>): Promise<any> {
    try {
      const res = await api.put(`/classes/${classId}/subjects`, { subjects });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async addSubjectsToClass(classId: string, subjects: Array<{ 
    subjectInfo: string; 
    coefficient?: number; 
    teacherInfo?: string 
  }>): Promise<any> {
    try {
      const res = await api.put(`/classes/${classId}/add-subjects`, { subjects });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async updateSubjectInClass(classId: string, subjectId: string, updates: { 
    coefficient?: number; 
    teacherInfo?: string 
  }): Promise<any> {
    try {
      const res = await api.put(`/classes/${classId}/update-subject/${subjectId}`, updates);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async removeSubjectFromClass(classId: string, subjectId: string): Promise<any> {
    try {
      const res = await api.delete(`/classes/${classId}/remove-subject/${subjectId}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async refreshClassSubjects(classId: string): Promise<any> {
    try {
      const res = await api.post(`/classes/${classId}/refresh-subjects`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Student management
  async addStudentToClass(classId: string, studentId: string): Promise<any> {
    try {
      const res = await api.put(`/classes/${classId}/add-student`, { studentId });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async removeStudentFromClass(classId: string, studentId: string): Promise<any> {
    try {
      const res = await api.delete(`/classes/${classId}/remove-student/${studentId}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Performance analytics
  async getClassPerformanceAnalytics(classId: string, year?: string): Promise<any> {
    try {
      const params = year ? { year } : {};
      const res = await api.get(`/classes/${classId}/performance`, { params });
      return res.data?.classPerformance || {};
    } catch (error) {
      throw error;
    }
  },

  // Helper method to normalize class data for frontend
  normalizeClassForFrontend(classData: any) {
    return {
      id: classData.id || classData._id,
      name: classData.name || classData.classesName,
      level: classData.level,
      section: classData.section,
      specialty: classData.specialty,
      educationSystem: classData.educationSystem,
      capacity: classData.capacity,
      currentStudents: classData.currentStudents,
      teacher: classData.teacher,
      room: classData.room,
      subjects: classData.subjects || [],
      averageGrade: classData.averageGrade,
      attendanceRate: classData.attendanceRate,
      schedule: classData.schedule,
      isActive: classData.isActive,
      status: classData.status,
      year: classData.year,
      description: classData.description,
      mainTeacher: classData.mainTeacher,
      // Include all original data
      ...classData
    };
  }
};