import api from '@/lib/api';

export const reportsService = {
  async getTemplates(): Promise<any[]> {
    // Expected shape: [{ id, name, description, type, icon, color, generated, lastGenerated }, ...]
    try {
      const res = await api.get('/reports/types');
      return res.data || [];
    } catch {
      return [];
    }
  },

  async getTerms(): Promise<any[]> {
    // Expected shape: [{ id, name }, ...]
    try {
      const res = await api.get('/academic-years');
      return res.data?.map((year: any) => year.terms || []).flat() || [];
    } catch {
      return [];
    }
  },

  async getClasses(): Promise<any[]> {
    // Expected shape: [{ id, name }, ...]
    try {
      const res = await api.get('/classes');
      const raw = res.data?.classes || [];
      // Normalize to { id, name } expected by UI
      return Array.isArray(raw)
        ? raw.map((c: any) => ({ id: c.id || c._id, name: c.name || c.classesName || c.className }))
        : [];
    } catch {
      return [];
    }
  },

  async getRecentReports(): Promise<any[]> {
    // Expected shape: [{ id, name, type, generated, size, studentCount }, ...]
    try {
      const res = await api.get('/reports/history');
      return res.data || [];
    } catch {
      return [];
    }
  },
};
