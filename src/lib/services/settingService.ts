import axios from "@/lib/api";

const BASE_URL = "/settings";

// Interfaces for your settings
export interface AcademicYear {
  _id?: string;
  name: string;
  startDate: string;
  endDate: string;
  terms?: Term[];
  isCurrent?: boolean;
}

export interface Term {
  _id?: string;
  name: string;
  startDate: string;
  endDate: string;
  academicYear?: string;
  sequences?: Sequence[];
  isActive?: boolean;
}

export interface Sequence {
  _id?: string;
  name: string;
  startDate: string;
  endDate: string;
  term?: any;
  isActive?: boolean;
}

export const settingService = {
  // ================================
  // Academic Year Services
  // ================================
  createAcademicYear: async (data: AcademicYear) => {
    const res = await axios.post(`${BASE_URL}/academic-year`, data);
    return res.data;
  },

  getAcademicYears: async () => {
    const res = await axios.get(`${BASE_URL}/academic-year`);
    return res.data;
  },

  updateAcademicYear: async (id: string, data: Partial<AcademicYear>) => {
    const res = await axios.put(`${BASE_URL}/academic-year/${id}`, data);
    return res.data;
  },

  deleteAcademicYear: async (id: string) => {
    const res = await axios.delete(`${BASE_URL}/academic-year/${id}`);
    return res.data;
  },

  // ================================
  // Term Services
  // ================================
  createTerm: async (data: Term) => {
    const res = await axios.post(`${BASE_URL}/term`, data);
    return res.data;
  },

  getTerms: async (params = {}) => {
    const res = await axios.get(`${BASE_URL}/term`, { params });
    return res.data;
  },

  updateTerm: async (id: string, data: Partial<Term>) => {
    const res = await axios.put(`${BASE_URL}/term/${id}`, data);
    return res.data;
  },

  deleteTerm: async (id: string) => {
    const res = await axios.delete(`${BASE_URL}/term/${id}`);
    return res.data;
  },

  // ================================
  // Sequence Services
  // ================================
  createSequence: async (data: Sequence) => {
    const res = await axios.post(`${BASE_URL}/sequence`, data);
    return res.data;
  },

  getSequences: async () => {
    const res = await axios.get(`${BASE_URL}/sequence`);
    return res.data;
  },

  updateSequence: async (id: string, data: Partial<Sequence>) => {
    const res = await axios.put(`${BASE_URL}/sequence/${id}`, data);
    return res.data;
  },

  deleteSequence: async (id: string) => {
    const res = await axios.delete(`${BASE_URL}/sequence/${id}`);
    return res.data;
  },
};
