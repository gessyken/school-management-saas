// services/joinRequestService.ts
import api from '@/lib/api';
import { User } from './usersService';

export interface JoinRequest {
  _id: string;
  user: User;
  school: string;
  requestedRoles: string[];
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: string;
}

export interface SearchUserResult {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export const joinRequestService = {
  // Get join requests for a school
  async getJoinRequests(schoolId: string): Promise<JoinRequest[]> {
    const response = await api.get(`/schools/${schoolId}/join-requests`);
    return response.data.joinRequests || [];
  },

  // Approve a join request
  async approveJoinRequest(schoolId: string, userId: string): Promise<void> {
    await api.post(`/schools/${schoolId}/join-requests/${userId}/approve`);
  },

  // Reject a join request
  async rejectJoinRequest(schoolId: string, userId: string): Promise<void> {
    await api.delete(`/schools/${schoolId}/join-requests/${userId}/reject`);
  },

  // Search users by email
  async searchUsers(email: string): Promise<SearchUserResult[]> {
    const response = await api.get(`/users/search?email=${encodeURIComponent(email)}`);
    return response.data.users || [];
  },

  // Send invitation to user
  async sendInvitation(schoolId: string, userId: string): Promise<void> {
    await api.post(`/schools/${schoolId}/invite`, { userId });
  },

  // Get invitations for a school
  async getInvitationsBySchool(schoolId: string): Promise<any[]> {
    const response = await api.get(`/schools/${schoolId}/invitations`);
    return response.data || [];
  },
  

async getUserInvitations(): Promise<any[]> {
    const response = await api.get('/schools/invitations/my');
    return response.data || [];
  },

  // Accept an invitation
  async acceptInvitation(schoolId: string): Promise<void> {
    await api.put(`/schools/${schoolId}/invitations/accept`);
  },


  // Cancel invitation
  async cancelInvitation(schoolId: string, invitationId: string): Promise<void> {
    await api.delete(`/schools/${schoolId}/invitations/${invitationId}/cancel`);
  },
};