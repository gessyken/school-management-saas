import api from '@/lib/api';
import {
  AcademicYear,
  Student,
  Class,
  CreateAcademicYearsRequest,
  CreateAcademicYearsResponse,
  UpdateMarkRequest,
  BulkUpdateMarksRequest,
  PerformanceSummary,
  FeeSummary,
  ClassAcademicOverview,
  FeeAnalytics,
  RankCalculationRequest,
  PromotionRequest
} from '@/types/academicYear';

class AcademicYearService {
  /* ───────────── ACADEMIC YEAR MANAGEMENT ───────────── */

  async createAcademicYearsForStudents(data: CreateAcademicYearsRequest): Promise<CreateAcademicYearsResponse> {
    try {
      const res = await api.post('/academic-years/create-for-students', data);
      return res.data;
    } catch (error) {
      console.error('Error creating academic years for students:', error);
      throw error;
    }
  }

  async assignStudentsToClass(data: {
    studentList: string[];
    classId: string;
    academicYear: string;
  }): Promise<{ message: string; summary: any }> {
    try {
      const res = await api.post('/academic-years/assign', data);
      return res.data;
    } catch (error) {
      console.error('Error assigning students to class:', error);
      throw error;
    }
  }

  async getAcademicYears(params?: {
    student?: string;
    year?: string;
    class?: string;
    classes?: string;
    status?: string;
  }): Promise<AcademicYear[]> {
    try {
      const res = await api.get('/academic-years', { params });
      return res.data.students || [];
    } catch (error) {
      console.error('Error fetching academic years:', error);
      throw error;
    }
  }

  async getAcademicYearByStudent(studentId: string, year: string): Promise<AcademicYear> {
    try {
      const res = await api.get(`/academic-years/student/${studentId}/year/${year}`);
      return res.data.academicYear;
    } catch (error) {
      console.error(`Error fetching academic year for student ${studentId}:`, error);
      throw error;
    }
  }

  async getAcademicYearById(id: string): Promise<AcademicYear> {
    try {
      const res = await api.get(`/academic-years/${id}`);
      return res.data.academicYear;
    } catch (error) {
      console.error(`Error fetching academic year ${id}:`, error);
      throw error;
    }
  }

  async syncAcademicYearWithClass(academicYearId: string): Promise<{ message: string; summary: any }> {
    try {
      const res = await api.put(`/academic-years/${academicYearId}/sync-class`);
      return res.data;
    } catch (error) {
      console.error(`Error syncing academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  async deactivateAcademicYear(academicYearId: string, reason: string, notes?: string): Promise<AcademicYear> {
    try {
      const res = await api.put(`/academic-years/${academicYearId}/deactivate`, { reason, notes });
      return res.data.academicYear;
    } catch (error) {
      console.error(`Error deactivating academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  async reactivateAcademicYear(academicYearId: string): Promise<AcademicYear> {
    try {
      const res = await api.put(`/academic-years/${academicYearId}/reactivate`);
      return res.data.academicYear;
    } catch (error) {
      console.error(`Error reactivating academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  async deleteAcademicYear(id: string): Promise<void> {
    try {
      await api.delete(`/academic-years/${id}`);
    } catch (error) {
      console.error(`Error deleting academic year ${id}:`, error);
      throw error;
    }
  }

  /* ───────────── MARK MANAGEMENT ───────────── */

  async updateStudentMark(academicYearId: string, data: Omit<UpdateMarkRequest, 'academicYearId'>): Promise<AcademicYear> {
    try {
      const res = await api.put(`/academic-years/${academicYearId}/marks`, data);
      return res.data.academicYear;
    } catch (error) {
      console.error(`Error updating mark for academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  async bulkUpdateMarks(data: BulkUpdateMarksRequest): Promise<{ message: string; summary: any }> {
    try {
      const res = await api.put('/academic-years/bulk/marks', data);
      return res.data;
    } catch (error) {
      console.error('Error bulk updating marks:', error);
      throw error;
    }
  }

  async calculateAverages(academicYearId: string): Promise<AcademicYear> {
    try {
      const res = await api.put(`/academic-years/${academicYearId}/calculate-averages`);
      return res.data.academicYear;
    } catch (error) {
      console.error(`Error calculating averages for academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  /* ───────────── PERFORMANCE & ANALYTICS ───────────── */

  async getStudentPerformanceSummary(studentId: string, year: string): Promise<{
    student: Student;
    academicYear: string;
    performance: PerformanceSummary;
    fees: FeeSummary;
    overallRank: number;
    hasCompleted: boolean;
    hasRepeated: boolean;
  }> {
    try {
      const res = await api.get(`/academic-years/student/${studentId}/year/${year}/performance`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching performance summary for student ${studentId}:`, error);
      throw error;
    }
  }

  async getClassAcademicOverview(classId: string, year: string): Promise<ClassAcademicOverview> {
    try {
      const res = await api.get('/academic-years/class/overview', { 
        params: { classId, year } 
      });
      return res.data.overview;
    } catch (error) {
      console.error(`Error fetching class overview for class ${classId}:`, error);
      throw error;
    }
  }

  async getFeeAnalytics(year: string, classId?: string): Promise<FeeAnalytics> {
    try {
      const res = await api.get('/academic-years/analytics/fees', { 
        params: { year, classId } 
      });
      return res.data.analytics;
    } catch (error) {
      console.error(`Error fetching fee analytics for year ${year}:`, error);
      throw error;
    }
  }

  /* ───────────── RANK MANAGEMENT ───────────── */

  async calculateSubjectRank(data: RankCalculationRequest): Promise<{ message: string; ranks: any }> {
    try {
      const res = await api.put('/academic-years/ranks/subject', data);
      return res.data;
    } catch (error) {
      console.error('Error calculating subject ranks:', error);
      throw error;
    }
  }

  async calculateSequenceRank(data: Omit<RankCalculationRequest, 'subjectId'>): Promise<{ message: string; ranks: any }> {
    try {
      const res = await api.put('/academic-years/ranks/sequence', data);
      return res.data;
    } catch (error) {
      console.error('Error calculating sequence ranks:', error);
      throw error;
    }
  }

  async calculateTermRank(data: Omit<RankCalculationRequest, 'sequenceId' | 'subjectId'>): Promise<{ message: string; ranks: any }> {
    try {
      const res = await api.put('/academic-years/ranks/term', data);
      return res.data;
    } catch (error) {
      console.error('Error calculating term ranks:', error);
      throw error;
    }
  }

  async calculateAcademicRanks(data: Omit<RankCalculationRequest, 'termId' | 'sequenceId' | 'subjectId'>): Promise<{ message: string; ranks: any }> {
    try {
      const res = await api.put('/academic-years/ranks/academic', data);
      return res.data;
    } catch (error) {
      console.error('Error calculating academic ranks:', error);
      throw error;
    }
  }

  async promoteStudents(data: PromotionRequest): Promise<{ message: string }> {
    try {
      const res = await api.put('/academic-years/promote-students', data);
      return res.data;
    } catch (error) {
      console.error('Error promoting students:', error);
      throw error;
    }
  }

  /* ───────────── FEE MANAGEMENT ───────────── */

  async getFees(academicYearId: string): Promise<any[]> {
    try {
      const res = await api.get(`/academic-years/${academicYearId}/fees`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching fees for academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  async addFee(academicYearId: string, feeData: any): Promise<{ message: string; fees: any[] }> {
    try {
      const res = await api.post(`/academic-years/${academicYearId}/fees`, feeData);
      return res.data;
    } catch (error) {
      console.error(`Error adding fee to academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  async updateFee(academicYearId: string, billID: string, feeData: any): Promise<{ message: string; fee: any }> {
    try {
      const res = await api.put(`/academic-years/${academicYearId}/fees/${billID}`, feeData);
      return res.data;
    } catch (error) {
      console.error(`Error updating fee ${billID} for academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  async deleteFee(academicYearId: string, billID: string): Promise<{ message: string }> {
    try {
      const res = await api.delete(`/academic-years/${academicYearId}/fees/${billID}`);
      return res.data;
    } catch (error) {
      console.error(`Error deleting fee ${billID} for academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  /* ───────────── REPORT GENERATION ───────────── */

  async generateReportCard(academicYearId: string, termIndex?: number): Promise<{ reportCard: any }> {
    try {
      const res = await api.get(`/academic-years/${academicYearId}/report-card`, {
        params: { termIndex }
      });
      return res.data;
    } catch (error) {
      console.error(`Error generating report card for academic year ${academicYearId}:`, error);
      throw error;
    }
  }

  async getClassRankings(classId: string, year: string, termIndex?: number): Promise<{ rankings: any[] }> {
    try {
      const res = await api.get('/academic-years/class/rankings', {
        params: { classId, year, termIndex }
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching class rankings for class ${classId}:`, error);
      throw error;
    }
  }

  async getStudentsAtRisk(year: string, threshold?: number): Promise<{ studentsAtRisk: any[] }> {
    try {
      const res = await api.get('/academic-years/students-at-risk', {
        params: { year, threshold }
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching students at risk for year ${year}:`, error);
      throw error;
    }
  }

  async checkYearCompletion(academicYearId: string): Promise<{ message: string; hasCompleted: boolean; academicYear: AcademicYear }> {
    try {
      const res = await api.put(`/academic-years/${academicYearId}/check-completion`);
      return res.data;
    } catch (error) {
      console.error(`Error checking year completion for academic year ${academicYearId}:`, error);
      throw error;
    }
  }
}

export const academicYearService = new AcademicYearService();
export default academicYearService;