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
      dateModified: string;
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
  date?: string;
}

export interface AcademicYear {
  _id?: string;
  student: string;
  year: string;
  classes: string;
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
  create: async (data: AcademicYear) => {
    const response = await axios.post(API_BASE, data);
    return response.data;
  },

  // Update academic year
  update: async (id: string, data: Partial<AcademicYear>) => {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  },

  // Delete academic year
  remove: async (id: string) => {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  // Add a fee to a student for a specific academic year
  addFee: async (id: string, feeData: AcademicFee) => {
    const response = await axios.post(`${API_BASE}/${id}/add-fee`, feeData);
    return response.data;
  },

  // Update a specific mark
  updateMark: async (
    id: string,
    termIndex: number,
    sequenceIndex: number,
    subjectIndex: number,
    newMark: number,
    modifiedBy: { name: string; userId: string }
  ) => {
    const response = await axios.post(`${API_BASE}/${id}/update-mark`, {
      termIndex,
      sequenceIndex,
      subjectIndex,
      newMark,
      modifiedBy,
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
  bulkImport: async (data: AcademicYear[]) => {
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
      params: { year, threshold }
    });
    return response.data;
  },
};
