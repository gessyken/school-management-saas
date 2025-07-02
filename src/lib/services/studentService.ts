import axios from "@/lib/api"; 

const BASE_URL = '/students';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface Student {
  _id?: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  phoneNumber?: string;
  dateOfBirth: string;
  gender?: string | 'male' | 'female' | 'other';
  address?: Address;
  emergencyContact?: EmergencyContact;
  academicYears?: string[];
  fullName?:string;
  classInfo?: any;
  profilePicture?: string;
  status?: string | 'active' | 'suspended' | 'graduated' | 'withdrawn';
  createdAt?: string;
  updatedAt?: string;
}

export const studentService = {
  // ================================
  // Student CRUD Services
  // ================================
  
  create: async (student: Student) => {
    const response = await axios.post(`${BASE_URL}/register`, student);
    return response.data;
  },

  bulkImport: async (students: any[]) => {
    const response = await axios.post(`${BASE_URL}/register_many_students`, { students });
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await axios.get(BASE_URL,{ params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  update: async (id: string, updatedData: Partial<Student>) => {
    const response = await axios.put(`${BASE_URL}/${id}`, updatedData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  changeStatus: async (id: string, status: string) => {
    const response = await axios.patch(`${BASE_URL}/${id}/status`, { status });
    return response.data;
  },

  // ================================
  // Academic & Class Related Services
  // ================================

  getPerformance: async (id: string) => {
    const response = await axios.get(`${BASE_URL}/${id}/performance`);
    return response.data;
  },

  getByClass: async (classId: string) => {
    const response = await axios.get(`${BASE_URL}/class/${classId}`);
    return response.data;
  },

  getAtRisk: async () => {
    const response = await axios.get(`${BASE_URL}/at-risk`);
    return response.data;
  },

  getAttendance: async (id: string) => {
    const response = await axios.get(`${BASE_URL}/${id}/attendance`);
    return response.data;
  },
};
