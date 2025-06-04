import axios from "@/lib/api"; // Your configured axios instance

export interface UserSecurity {
  twoFactorEnabled?: boolean;
  loginAttempts?: number;
  lockUntil?: string;
}

export interface User {
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  roles?: ('DIRECTOR' | 'SECRETARY' | 'TEACHER' | 'ADMIN')[];
  security?: UserSecurity;
  status?: 'active' | 'inactive' | 'suspended' | 'banned';
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = '/users';

export const userService = {
  // Register a new user
  register: async (data: Partial<User>) => {
    return await axios.post(`${API_BASE}/register`, data);
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    return await axios.post(`${API_BASE}/login`, credentials);
  },

  // Get logged-in user's profile
  getProfile: async () => {
    return await axios.get(`${API_BASE}/profile`);
  },

  // Update logged-in user's profile
  updateProfile: async (data: Partial<User>) => {
    return await axios.put(`${API_BASE}/profile`, data);
  },

  // Change password of logged-in user
  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    return await axios.put(`${API_BASE}/change-password`, data);
  },

  // Admin-only: Get all users (with optional query params e.g. pagination)
  getAll: async (params = {}) => {
    return await axios.get(`${API_BASE}`, { params });
  },

  // Admin-only: Get user by ID
  getById: async (id: string) => {
    return await axios.get(`${API_BASE}/${id}`);
  },

  // Admin-only: Update user by ID
  update: async (id: string, data: Partial<User>) => {
    return await axios.put(`${API_BASE}/${id}`, data);
  },

  // Admin-only: Delete user by ID
  remove: async (id: string) => {
    return await axios.delete(`${API_BASE}/${id}`);
  }
};
