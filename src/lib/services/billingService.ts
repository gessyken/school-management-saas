import axios from '../api';

const API_BASE = '/schools/billing';

export const billingService = {
  // Get billing rules and usage for a school
  get: (schoolId: string) => axios.get(`${API_BASE}/${schoolId}`),

  // Update billing rules
  updateRules: (schoolId: string, data: any) =>
    axios.put(`${API_BASE}/${schoolId}/billing-rules`, data),

  // Update usage
  updateUsage: (schoolId: string, data: any) =>
    axios.put(`${API_BASE}/${schoolId}/usage`, data),
};
