import axios from '../api';

const API_BASE = '/invoices';

export const invoiceService = {
  // Get all invoices for a school
  getBySchool: (schoolId: string) => axios.get(`${API_BASE}/school/${schoolId}`),

  // Create 7-day trial invoice for a school
  createTrial: (schoolId: string) => axios.post(`${API_BASE}/trial/${schoolId}`),

  // Generate new monthly invoice for a school
  generate: (schoolId: string) => axios.post(`${API_BASE}/generate/${schoolId}`),

  // Mark invoice as paid
  pay: (invoiceId: string) => axios.put(`${API_BASE}/pay/${invoiceId}`),
};
