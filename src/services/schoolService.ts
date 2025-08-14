import api from '@/lib/api';
import {
  School,
  SchoolMember,
  JoinRequest,
  CreateSchoolDto,
  UpdateSchoolDto,
  PaginatedResponse,
} from '@/types/School';

class SchoolService {
  // School CRUD Operations
  async create(data: CreateSchoolDto): Promise<School> {
    const response = await api.post('/schools/register', data);
    return response.data;
  }

  async getAll(page = 1, limit = 10) {
    const response = await api.get(`/schools?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getById(id: string): Promise<School> {
    const response = await api.get(`/schools/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateSchoolDto): Promise<School> {
    const response = await api.put(`/schools/${id}`, data);
    return response.data;
  }

  // Membership Management
  async getMembers(schoolId: string): Promise<SchoolMember[]> {
    const response = await api.get(`/schools/${schoolId}/members`);
    return response.data;
  }

  async updateMemberRoles(
    schoolId: string,
    memberId: string,
    roles: string[]
  ): Promise<void> {
    await api.patch(`/schools/${schoolId}/members/${memberId}/roles`, { roles });
  }

  // Join Requests
  async requestJoin(schoolId: string): Promise<void> {
    await api.post(`/schools/${schoolId}/request-join`);
  }

  async getJoinRequests(schoolId: string): Promise<JoinRequest[]> {
    const response = await api.get(`/schools/${schoolId}/join-requests`);
    return response.data.joinRequests;
  }

  async approveJoinRequest(schoolId: string, userId: string): Promise<void> {
    await api.post(`/schools/${schoolId}/join-requests/${userId}/approve`);
  }

  async rejectJoinRequest(schoolId: string, userId: string): Promise<void> {
    await api.delete(`/schools/${schoolId}/join-requests/${userId}/reject`);
  }

  // School Context
  async switch(schoolId: string): Promise<{ token: string; school: School }> {
    const response = await api.post('/schools/switch', { schoolId });
    return response.data;
  }
}

export const schoolService = new SchoolService();