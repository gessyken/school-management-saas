import axios from "@/lib/api"; // Adjust to your axios instance

export interface AcademicSubject {
  subjectInfo: string;
  isActive: boolean;
  marks: {
    currentMark: number;
    isActive: boolean;
    modified: {
      preMark: number;
      modMark: number;
      modifiedBy: {
        name: string;
        userId: string;
      };
      dateModified: string | "";
    }[];
  };
}

export interface AcademicSequence {
  sequenceInfo: string;
  isActive: boolean;
  average: number;
  rank?: number;
  absences?: number;
  subjects: AcademicSubject[];
}

export interface AcademicTerm {
  termInfo: string;
  average: number;
  rank?: number;
  sequences: AcademicSequence[];
  discipline?: "Excellent" | "Good" | "Average" | "Poor";
}

export interface AcademicFee {
  billID?: string;
  type?: string;
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
}

export interface AcademicYearStudent {
  _id?: string;
  student: any;
  year: string;
  classes: any;
  hasRepeated?: boolean;
  hasCompleted?: boolean;
  terms: AcademicTerm[];
  fees: AcademicFee[];
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = "/academic-years"; // Adjust this if your backend routes use a different base

export const academicService = {
  // Get all academic years with optional filters (e.g., student, year)
  getAll: async (params = {}) => {
    const response = await axios.get(API_BASE, { params });
    return response.data;
  },

  // Get academic year by ID
  getById: async (id: string) => {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  },

  // Create new academic year
  assignStudent: async (
    selectedStudents: any,
    selectedClass: any,
    selectedYear: any
  ) => {
    const response = await axios.post(`${API_BASE}/assign`, {
      studentList: selectedStudents,
      classId: selectedClass,
      academicYear: selectedYear,
    });
    return response.data;
  },

  // Update academic year
  update: async (id: string, data: Partial<AcademicYearStudent>) => {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  },

  // Delete academic year
  remove: async (id: string) => {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  // ✅ 6. Get all fees for an academic year
  getFees: async (id: string) => {
    const response = await axios.get(`${API_BASE}/${id}/fees`);
    return response.data;
  },

  // ✅ 7. Add a fee to an academic year
  addFee: async (id: string, feeData: AcademicFee) => {
    const response = await axios.post(`${API_BASE}/${id}/fees`, feeData);
    return response.data;
  },

  // ✅ 8. Update a specific fee by billID
  updateFee: async (id: string, billID: string, updatedData: AcademicFee) => {
    const response = await axios.put(
      `${API_BASE}/${id}/fees/${billID}`,
      updatedData
    );
    return response.data;
  },

  // ✅ 9. Delete a fee by billID
  deleteFee: async (id: string, billID: string) => {
    const response = await axios.delete(`${API_BASE}/${id}/fees/${billID}`);
    return response.data;
  },

  // Update a specific mark
  updateMark: async (
    id: string,
    termInfo: string,
    sequenceInfo: string,
    subjectInfo: string,
    newMark: number
    // modifiedBy: { name: string; userId: string }
  ) => {
    const response = await axios.put(`${API_BASE}/${id}/marks`, {
      termInfo,
      sequenceInfo,
      subjectInfo,
      newMark,
      // modifiedBy,
    });
    return response.data;
  },

  // Manually trigger re-calculation of averages
  calculateAverages: async (id: string) => {
    const response = await axios.post(`${API_BASE}/${id}/calculate-averages`);
    return response.data;
  },

  // Mark academic year as completed
  markAsCompleted: async (id: string) => {
    const response = await axios.post(`${API_BASE}/${id}/check-completion`);
    return response.data;
  },

  // Optionally: bulk import academic years
  bulkImport: async (data: AcademicYearStudent[]) => {
    const response = await axios.post(`${API_BASE}/import`, {
      academicYears: data,
    });
    return response.data;
  },

  // Get all academic years for a specific student
  getByStudent: async (studentId: string) => {
    const response = await axios.get(`${API_BASE}/student/${studentId}`);
    return response.data;
  },

  // Get students at risk for a year
  getStudentsAtRisk: async (year: string, threshold = 10) => {
    const response = await axios.get(`${API_BASE}/students-at-risk`, {
      params: { year, threshold },
    });
    return response.data;
  },
};
