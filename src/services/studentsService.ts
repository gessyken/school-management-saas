import api from '@/lib/api';

// Helper method to handle class assignments for multiple students
async function handleClassAssignments(createdStudents: any[], originalStudentsData: any[]): Promise<void> {
  const assignmentPromises = createdStudents.map(async (createdStudent, index) => {
    const originalData = originalStudentsData[index];
    const studentId = createdStudent._id || createdStudent.id;

    if (studentId && originalData.classesId) {
      try {
        await this.addStudentToClass(studentId, originalData.classesId);
        console.log(`Successfully assigned student ${studentId} to class ${originalData.classesId}`);
      } catch (error) {
        console.warn(`Student ${studentId} created but class assignment failed:`, error);
        // Don't throw - continue with other assignments
      }
    }
  });

  // Wait for all class assignments to complete (but don't fail the whole operation if some fail)
  await Promise.allSettled(assignmentPromises);
}

// Helper method to refetch students after class assignments
async function refetchStudents(students: any[]): Promise<any[]> {
  const refetchPromises = students.map(async (student) => {
    try {
      const studentId = student._id || student.id;
      if (studentId) {
        const res = await api.get(`/students/${studentId}`);
        return res.data?.student || res.data;
      }
      return student; // Return original if no ID
    } catch (error) {
      console.warn(`Failed to refetch student ${student._id}:`, error);
      return student; // Return original on error
    }
  });

  return Promise.all(refetchPromises);
};

export const studentsService = {
  // Get all students with filtering
  async getStudents(filters = {
    search: '',
    class: '',
    status: '',
    level: '',
    page: 1,
    limit: 10
  }): Promise<any[]> {
    try {
      const { search, class: classFilter, status, level, page, limit } = filters;

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (classFilter && classFilter !== 'all') params.append('class', classFilter);
      if (status) params.append('status', status);
      if (level) params.append('level', level);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const queryString = params.toString();
      const url = `/students${queryString ? `?${queryString}` : ''}`;

      const res = await api.get(url);
      const responseData = res.data;

      // Handle both response formats (array or object with students property)
      const raw = responseData?.students || responseData || [];

      return Array.isArray(raw)
        ? raw.map((s: any) => this.normalizeStudent(s))
        : [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  // Get single student by ID
  async getStudentById(id: string): Promise<any> {
    try {
      const res = await api.get(`/students/${id}`);
      const studentData = res.data?.student || res.data;
      return this.normalizeStudent(studentData);
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  },

  // Create new student
  async createStudent(studentData: any): Promise<any> {
    try {
      // Transform frontend data to backend format
      const payload = this.transformToBackendFormat(studentData);

      const res = await api.post('/students', payload);
      let student = res.data?.student || res.data;

      // If class is specified, assign student to class
      if (student && studentData.classesId) {
        try {
          await this.addStudentToClass(student._id || student.id, studentData.classesId);
          // Refetch student to get updated class information
          const updatedRes = await api.get(`/students/${student._id || student.id}`);
          student = updatedRes.data?.student || updatedRes.data;
        } catch (error) {
          console.warn('Student created but class assignment failed:', error);
          // Continue with original student data
        }
      }

      return this.normalizeStudent(student);
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  // Update student
  async updateStudent(id: string, studentData: any): Promise<any> {
    try {
      const payload = this.transformToBackendFormat(studentData, true);

      const res = await api.put(`/students/${id}`, payload);
      const student = res.data?.student || res.data;

      return this.normalizeStudent(student);
    } catch (error) {
      console.error(`Error updating student ${id}:`, error);
      throw error;
    }
  },

  // Delete student
  async deleteStudent(id: string): Promise<void> {
    try {
      await api.delete(`/students/${id}`);
    } catch (error) {
      console.error(`Error deleting student ${id}:`, error);
      throw error;
    }
  },

  // Add student to class
  async addStudentToClass(studentId: string, classId: string): Promise<any> {
    try {
      const res = await api.post(`/students/${studentId}/add-to-class`, {
        studentId,
        classId
      });
      return res.data;
    } catch (error) {
      console.error(`Error adding student ${studentId} to class ${classId}:`, error);
      throw error;
    }
  },

  // Change student's class
  async changeStudentClass(studentId: string, classId: string): Promise<any> {
    try {
      const res = await api.put(`/students/${studentId}/change-class`, {
        classId
      });
      const student = res.data?.student || res.data;
      return this.normalizeStudent(student);
    } catch (error) {
      console.error(`Error changing class for student ${studentId}:`, error);
      throw error;
    }
  },

  // Remove student from class
  async removeStudentFromClass(studentId: string): Promise<any> {
    try {
      const res = await api.delete(`/students/${studentId}/remove-from-class`);
      const student = res.data?.student || res.data;
      return this.normalizeStudent(student);
    } catch (error) {
      console.error(`Error removing student ${studentId} from class:`, error);
      throw error;
    }
  },

  // Get student statistics
  async getStudentStatistics(): Promise<any> {
    try {
      const res = await api.get('/students/stats');
      return res.data?.statistics || res.data;
    } catch (error) {
      console.error('Error fetching student statistics:', error);
      throw error;
    }
  },

  // Get students by class
  async getStudentsByClass(classId: string): Promise<any[]> {
    try {
      const res = await api.get(`/students/class/${classId}`);
      const students = res.data?.students || [];
      return Array.isArray(students)
        ? students.map((s: any) => this.normalizeStudent(s))
        : [];
    } catch (error) {
      console.error(`Error fetching students for class ${classId}:`, error);
      return [];
    }
  },

  // Change student status
  async changeStudentStatus(studentId: string, status: string): Promise<any> {
    try {
      const res = await api.patch(`/students/${studentId}/status`, { status });
      const student = res.data?.student || res.data;
      return this.normalizeStudent(student);
    } catch (error) {
      console.error(`Error changing status for student ${studentId}:`, error);
      throw error;
    }
  },

  // Toggle student active status
  async toggleStudentStatus(studentId: string): Promise<any> {
    try {
      const res = await api.patch(`/students/${studentId}/toggle-status`);
      const student = res.data?.student || res.data;
      return this.normalizeStudent(student);
    } catch (error) {
      console.error(`Error toggling status for student ${studentId}:`, error);
      throw error;
    }
  },

  // Bulk create students
  async createManyStudents(studentsData: any[]): Promise<any> {
    try {
      // Transform all students to backend format
      const transformedStudents = studentsData.map(student =>
        this.transformToBackendFormat(student)
      );

      // Send bulk creation request
      const res = await api.post('/students/bulk', {
        students: transformedStudents
      });

      const responseData = res.data;

      // If we have successfully created students, handle class assignments
      if (responseData.savedStudents && Array.isArray(responseData.savedStudents)) {
        await handleClassAssignments(responseData.savedStudents, studentsData);

        // Refetch all successfully created students to get updated class information
        const updatedStudents = await refetchStudents(responseData.savedStudents);
        responseData.savedStudents = updatedStudents;
      }

      // Normalize all returned students
      if (responseData.savedStudents) {
        responseData.savedStudents = responseData.savedStudents.map((student: any) =>
          this.normalizeStudent(student)
        );
      }

      return responseData;

    } catch (error) {
      console.error('Error creating multiple students:', error);
      throw error;
    }
  },

  // Get student academic performance
  async getStudentAcademicPerformance(studentId: string, year?: string): Promise<any> {
    try {
      const url = year
        ? `/students/${studentId}/performance?year=${year}`
        : `/students/${studentId}/performance`;

      const res = await api.get(url);
      return res.data;
    } catch (error) {
      console.error(`Error fetching performance for student ${studentId}:`, error);
      throw error;
    }
  },

  // Get student attendance
  async getStudentAttendance(studentId: string, year?: string): Promise<any> {
    try {
      const url = year
        ? `/students/${studentId}/attendance?year=${year}`
        : `/students/${studentId}/attendance`;

      const res = await api.get(url);
      return res.data;
    } catch (error) {
      console.error(`Error fetching attendance for student ${studentId}:`, error);
      throw error;
    }
  },

  // Utility function to normalize student data for frontend
  normalizeStudent(student: any): any {
    if (!student) return null;

    return {
      id: student.id || student._id,
      name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || student.phoneNumber,
      class: student.class?.name || student.className || student.classInfo?.classesName || 'Non assigné',
      classesId: student.class?._id || student.class,
      average: typeof student.average === 'number' ? student.average : (student.overallAverage ?? 0),
      status: student.status || 'active',
      enrollmentDate: student.enrollmentDate || student.createdAt || new Date().toISOString(),
      enrollmentYear: student.enrollmentYear, // Added from schema
      address: student.address,
      city: student.city,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      parentOccupation: student.parentOccupation, // Added from schema
      parentAddress: student.parentAddress, // Added from schema
      birthDate: student.birthDate || student.dateOfBirth,
      dateOfBirth: student.dateOfBirth || student.birthDate, // Added from schema
      avatar: student.avatar || student.profilePicture,
      profilePicture: student.profilePicture || student.avatar, // Added from schema
      level: student.level,
      matricule: student.matricule,
      gender: student.gender,
      nationality: student.nationality,
      birthPlace: student.birthPlace, // Added from schema
      academicStatus: student.academicStatus,
      attendanceRate: student.attendanceRate,
      isActive: student.isActive !== undefined ? student.isActive : true,

      // Medical information fields
      bloodGroup: student.bloodGroup || '', // Added from schema
      allergies: student.allergies || [], // Added from schema
      medicalConditions: student.medicalConditions || [], // Added from schema
      emergencyContact: student.emergencyContact || { // Added from schema
        name: '',
        relationship: '',
        phone: ''
      },

      // Academic history
      academicYears: student.academicYears || [], // Added from schema

      // School and creator references
      school: student.school, // Added from schema
      createdBy: student.createdBy, // Added from schema

      // Virtual fields
      fullName: student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      age: student.age // Virtual field from schema
    };
  },
  // Transform frontend data to backend format
  transformToBackendFormat(studentData: any, isUpdate: boolean = false): any {
    const payload: any = {};

    // Handle name splitting for create operations
    if (!isUpdate && studentData.name && !studentData.firstName) {
      const nameParts = studentData.name.trim().split(/\s+/);
      payload.firstName = nameParts[0] || 'Inconnu';
      payload.lastName = nameParts.slice(1).join(' ') || 'Inconnu';
    } else {
      if (studentData.firstName !== undefined) payload.firstName = studentData.firstName;
      if (studentData.lastName !== undefined) payload.lastName = studentData.lastName;
    }

    // Map fields to backend format
    const fieldMappings = {
      email: 'email',
      phone: 'phone',
      level: 'level',
      birthDate: 'dateOfBirth',
      dateOfBirth: 'dateOfBirth',
      enrollmentDate: 'enrollmentDate',
      address: 'address',
      city: 'city',
      parentName: 'parentName',
      parentPhone: 'parentPhone',
      parentEmail: 'parentEmail',
      parentOccupation: 'parentOccupation',
      parentAddress: 'parentAddress',
      classesId: 'classId',
      class: 'class',
      matricule: 'matricule',
      status: 'status',
      academicStatus: 'academicStatus',
      average: 'average',
      attendanceRate: 'attendanceRate',
      gender: 'gender',
      nationality: 'nationality',
      birthPlace: 'birthPlace',
      bloodGroup: 'bloodGroup',
      allergies: 'allergies',
      medicalConditions: 'medicalConditions',
      emergencyContact: 'emergencyContact',
      avatar: 'avatar',
      profilePicture: 'profilePicture',
      enrollmentYear: 'enrollmentYear',
      isActive: 'isActive'
    };

    Object.entries(fieldMappings).forEach(([frontendField, backendField]) => {
      if (studentData[frontendField] !== undefined) {
        payload[backendField] = studentData[frontendField];
      }
    });

    // Generate matricule if not provided for new students
    if (!isUpdate && !payload.matricule && !studentData.matricule) {
      payload.matricule = `MAT-${Date.now().toString().slice(-6)}`;
    }

    return payload;
  }
};