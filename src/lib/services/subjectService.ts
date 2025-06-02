// services/subjectService.ts
import axios from '../api';

const API_BASE = '/subjects';

export const subjectService = {
  getAll: (params?: any) => axios.get(API_BASE, { params }),
  getById: (id: string) => axios.get(`${API_BASE}/${id}`),
  create: (data: any) => axios.post(API_BASE, data),
  update: (id: string, data: any) => axios.put(`${API_BASE}/${id}`, data),
  remove: (id: string) => axios.delete(`${API_BASE}/${id}`),
  toggleActive: (id: string) => axios.patch(`${API_BASE}/${id}/toggle`),
  bulkImport: (data: any[]) => axios.post(`${API_BASE}/bulk`, data),
};
