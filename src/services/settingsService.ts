import api from '@/lib/api';
import {
  AcademicYear,
  Term,
  Sequence,
  AcademicYearProgress,
  CreateAcademicYearData,
  CreateTermData,
  CreateSequenceData,
  BulkUpdateTermStatusData,
  DateValidationData
} from '@/types/settings';

class SettingsService {
  /* ───────────── ACADEMIC YEAR SERVICES ───────────── */

  async getAcademicYears(params?: {
    status?: string;
    isCurrent?: boolean;
    year?: string;
  }): Promise<AcademicYear[]> {
    try {
      const res = await api.get('/settings/academic-years', { params });
      return res.data || [];
    } catch (error) {
      console.error('Error fetching academic years:', error);
      throw error;
    }
  }

  async getAcademicYearById(id: string): Promise<AcademicYear> {
    try {
      const res = await api.get(`/settings/academic-years/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching academic year ${id}:`, error);
      throw error;
    }
  }

  async getCurrentAcademicYear(): Promise<AcademicYear> {
    try {
      const res = await api.get('/settings/academic-years/current');
      return res.data;
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      throw error;
    }
  }

  async createAcademicYear(data: CreateAcademicYearData): Promise<AcademicYear> {
    try {
      const res = await api.post('/settings/academic-years', data);
      return res.data;
    } catch (error) {
      console.error('Error creating academic year:', error);
      throw error;
    }
  }

  async updateAcademicYear(id: string, data: Partial<CreateAcademicYearData>): Promise<AcademicYear> {
    try {
      const res = await api.put(`/settings/academic-years/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(`Error updating academic year ${id}:`, error);
      throw error;
    }
  }

  async deleteAcademicYear(id: string): Promise<void> {
    try {
      await api.delete(`/settings/academic-years/${id}`);
    } catch (error) {
      console.error(`Error deleting academic year ${id}:`, error);
      throw error;
    }
  }

  async getAcademicYearProgress(id: string): Promise<AcademicYearProgress> {
    try {
      const res = await api.get(`/settings/academic-years/${id}/progress`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching progress for academic year ${id}:`, error);
      throw error;
    }
  }

  async validateAcademicYearDates(data: DateValidationData): Promise<{ valid: boolean; error?: string; overlappingYears?: string[] }> {
    try {
      const res = await api.post('/settings/academic-years/validate-dates', data);
      return res.data;
    } catch (error) {
      console.error('Error validating academic year dates:', error);
      throw error;
    }
  }

  /* ───────────── TERM SERVICES ───────────── */

  async getTerms(params?: {
    academicYear?: string;
    status?: string;
    isCurrent?: boolean;
  }): Promise<Term[]> {
    try {
      const res = await api.get('/settings/terms', { params });
      return res.data || [];
    } catch (error) {
      console.error('Error fetching terms:', error);
      throw error;
    }
  }

  async getTermById(id: string): Promise<Term> {
    try {
      const res = await api.get(`/settings/terms/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching term ${id}:`, error);
      throw error;
    }
  }

  async getCurrentTerm(): Promise<Term> {
    try {
      const res = await api.get('/settings/terms/current');
      return res.data;
    } catch (error) {
      console.error('Error fetching current term:', error);
      throw error;
    }
  }

  async getTermsByAcademicYear(academicYearId: string): Promise<Term[]> {
    try {
      const res = await api.get(`/settings/terms/academic-year/${academicYearId}`);
      return res.data || [];
    } catch (error) {
      console.error(`Error fetching terms for academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  async createTerm(data: CreateTermData): Promise<Term> {
    try {
      const res = await api.post('/settings/terms', data);
      return res.data;
    } catch (error) {
      console.error('Error creating term:', error);
      throw error;
    }
  }

  async updateTerm(id: string, data: Partial<CreateTermData>): Promise<Term> {
    try {
      const res = await api.put(`/settings/terms/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(`Error updating term ${id}:`, error);
      throw error;
    }
  }

  async deleteTerm(id: string): Promise<void> {
    try {
      await api.delete(`/settings/terms/${id}`);
    } catch (error) {
      console.error(`Error deleting term ${id}:`, error);
      throw error;
    }
  }

  async bulkUpdateTermStatus(data: BulkUpdateTermStatusData): Promise<{ message: string; modifiedCount: number }> {
    try {
      const res = await api.patch('/settings/terms/bulk-status', data);
      return res.data;
    } catch (error) {
      console.error('Error bulk updating term status:', error);
      throw error;
    }
  }

  /* ───────────── SEQUENCE SERVICES ───────────── */

  async getSequences(params?: {
    term?: string;
    status?: string;
    isCurrent?: boolean;
  }): Promise<Sequence[]> {
    try {
      const res = await api.get('/settings/sequences', { params });
      return res.data || [];
    } catch (error) {
      console.error('Error fetching sequences:', error);
      throw error;
    }
  }

  async getSequenceById(id: string): Promise<Sequence> {
    try {
      const res = await api.get(`/settings/sequences/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching sequence ${id}:`, error);
      throw error;
    }
  }

  async getCurrentSequence(): Promise<Sequence> {
    try {
      const res = await api.get('/settings/sequences/current');
      return res.data;
    } catch (error) {
      console.error('Error fetching current sequence:', error);
      throw error;
    }
  }

  async getSequencesByTerm(termId: string): Promise<Sequence[]> {
    try {
      const res = await api.get(`/settings/sequences/term/${termId}`);
      return res.data || [];
    } catch (error) {
      console.error(`Error fetching sequences for term ${termId}:`, error);
      throw error;
    }
  }

  async createSequence(data: CreateSequenceData): Promise<Sequence> {
    try {
      const res = await api.post('/settings/sequences', data);
      return res.data;
    } catch (error) {
      console.error('Error creating sequence:', error);
      throw error;
    }
  }

  async updateSequence(id: string, data: Partial<CreateSequenceData>): Promise<Sequence> {
    try {
      const res = await api.put(`/settings/sequences/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(`Error updating sequence ${id}:`, error);
      throw error;
    }
  }

  async deleteSequence(id: string): Promise<void> {
    try {
      await api.delete(`/settings/sequences/${id}`);
    } catch (error) {
      console.error(`Error deleting sequence ${id}:`, error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;