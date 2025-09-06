import api from '@/lib/api';

export const studentsService = {
  async getStudents(): Promise<any[]> {
    // Expected shape: [{ id, name, email, phone, class, average, status, enrollmentDate, ... }, ...]
    try {
      const res = await api.get('/students');
      const raw = res.data?.students || res.data || [];
      return Array.isArray(raw)
        ? raw.map((s: any) => ({
            id: s.id || s._id,
            name: s.name || `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim(),
            email: s.email || s.user?.email,
            phone: s.phone || s.phoneNumber || s.user?.phoneNumber,
            class: s.class || s.className || s.classInfo?.classesName,
            average: typeof s.average === 'number' ? s.average : (s.overallAverage ?? 0),
            status: s.status || 'active',
            enrollmentDate: s.enrollmentDate || s.createdAt || new Date().toISOString(),
            address: s.address,
            parentName: s.parentName,
            parentPhone: s.parentPhone,
            parentEmail: s.parentEmail,
            birthDate: s.birthDate || s.dateOfBirth,
            avatar: s.avatar,
          }))
        : [];
    } catch {
      return [];
    }
  },

  async createStudent(studentData: any): Promise<any> {
    try {
      // Transform UI payload -> backend expected fields
      const name: string = studentData.name || '';
      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.join(' ');
      const derivedLevel = studentData.level || (typeof studentData.class === 'string' ? (studentData.class.split(' ')[0] || '').replace(/[^0-9A-Za-zÀ-ÿ]/g, '') : undefined);
      const payload = {
        matricule: studentData.matricule || `MAT-${Date.now().toString().slice(-6)}`,
        firstName: studentData.firstName || firstName || 'Inconnu',
        lastName: studentData.lastName || lastName || 'Inconnu',
        email: studentData.email,
        level: derivedLevel || 'N/A',
        dateOfBirth: studentData.birthDate || studentData.dateOfBirth,
        phoneNumber: studentData.phone,
        address: studentData.address,
        parentName: studentData.parentName,
        parentPhone: studentData.parentPhone,
        parentEmail: studentData.parentEmail,
        status: studentData.status,
      };

      const res = await api.post('/students', payload);
      const s = res.data?.student || res.data;
      // Normalize back to UI shape
      return {
        id: s.id || s._id,
        name: `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim(),
        email: s.email,
        phone: s.phoneNumber,
        class: s.classInfo?.classesName,
        average: s.overallAverage ?? 0,
        status: s.status || 'active',
        enrollmentDate: s.enrollmentDate || s.createdAt || new Date().toISOString(),
        address: s.address,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        parentEmail: s.parentEmail,
        birthDate: s.dateOfBirth,
        avatar: s.avatar,
      };
    } catch (error) {
      throw error;
    }
  },

  async updateStudent(id: string, studentData: any): Promise<any> {
    try {
      const res = await api.put(`/students/${id}`, studentData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      await api.delete(`/students/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
