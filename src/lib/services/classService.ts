import axios from "@/lib/api"; // Ensure this points to your Axios instance

export interface SubjectInfo {
  subjectInfo: any; // MongoDB ObjectId of Subject
  coefficient: number|"";
  teacherInfo: any; // MongoDB ObjectId of User (teacher)
}

export interface SchoolClass {
  _id?: string;
  classesName: string;
  description?: string;
  status?: string ;
  level: string;
  capacity?: number|string|'';
  amountFee?: number|"";
  subjects?: SubjectInfo[];
  studentList?: any[]; // Array of Student ObjectIds
  mainTeacherInfo?: string; // MongoDB ObjectId of User
  year?: string; // Format: YYYY-YYYY
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = '/classes';

export const classService = {
  // Get all classes (with optional query params like pagination)
  getAll: async (params = {}) => {
    return await axios.get(`${API_BASE}`, { params });
  },

  // Get a specific class by ID
  getById: async (id: string) => {
    return await axios.get(`${API_BASE}/${id}`);
  },

  // Create a new class
  create: async (data: SchoolClass) => {
    return await axios.post(`${API_BASE}`, data);
  },

  // Update an existing class
  update: async (id: string, data: Partial<SchoolClass>) => {
    return await axios.put(`${API_BASE}/${id}`, data);
  },

  // Delete a class
  remove: async (id: string) => {
    return await axios.delete(`${API_BASE}/${id}`);
  },

  // Bulk import classes
  bulkImport: async (data: SchoolClass[]) => {
    return await axios.post(`${API_BASE}/import`, { classes: data });
  },
};
