import api from '@/lib/api';
import { School, SchoolInput } from '@/types';

interface CreateSchoolResponse {
  school: School;
  token: string;
  user: any;
  message?: string;
}

interface SwitchSchoolResponse {
  token: string;
  message: string;
}

interface JoinRequestResponse {
  message: string;
}

interface SchoolMembersResponse {
  members: any[];
}

export interface InviteMemberRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  message?: string;
}

export const schoolService = {
  // Créer une nouvelle école
  async createSchool(formData: FormData): Promise<CreateSchoolResponse> {
    try {
      const response = await api.post('/schools/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  },

  // Récupérer toutes les écoles (admin only)
  async getAllSchools(): Promise<School[]> {
    try {
      const response = await api.get<School[]>('/schools/');
      return response.data;
    } catch (error) {
      console.error('Error fetching all schools:', error);
      throw error;
    }
  },

  // Récupérer les écoles de l'utilisateur
  async getUserSchools(): Promise<School[]> {
    try {
      const response = await api.get<School[]>('/schools/my-schools');
      return response.data;
    } catch (error) {
      console.error('Error fetching user schools:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'accès d'une école (admin only)
  async updateSchoolAccess(id: string, accessStatus: string, blockReason?: string): Promise<School> {
    try {
      const response = await api.put<{ school: School }>(`/schools/${id}/access`, {
        accessStatus,
        blockReason
      });
      return response.data.school;
    } catch (error) {
      console.error('Error updating school access:', error);
      throw error;
    }
  },

  // Changer d'école active
  async switchSchool(schoolId: string): Promise<SwitchSchoolResponse> {
    try {
      const response = await api.post<SwitchSchoolResponse>('/schools/switch', { schoolId });
      return response.data;
    } catch (error) {
      console.error('Error switching school:', error);
      throw error;
    }
  },

  // Demander à rejoindre une école
  async requestJoinSchool(schoolId: string): Promise<JoinRequestResponse> {
    try {
      const response = await api.post<JoinRequestResponse>(`/schools/${schoolId}/request-join`);
      return response.data;
    } catch (error) {
      console.error('Error requesting to join school:', error);
      throw error;
    }
  },

  // Obtenir les demandes de rejoindre une école
  async getJoinRequests(schoolId: string): Promise<any[]> {
    try {
      const response = await api.get<{ joinRequests: any[] }>(`/schools/${schoolId}/join-requests`);
      return response.data.joinRequests;
    } catch (error) {
      console.error('Error fetching join requests:', error);
      throw error;
    }
  },

  // Approuver une demande de rejoindre
  async approveJoinRequest(schoolId: string, userId: string): Promise<JoinRequestResponse> {
    try {
      const response = await api.post<JoinRequestResponse>(
        `/schools/${schoolId}/join-requests/${userId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error('Error approving join request:', error);
      throw error;
    }
  },

  // Rejeter une demande de rejoindre
  async rejectJoinRequest(schoolId: string, userId: string): Promise<JoinRequestResponse> {
    try {
      const response = await api.delete<JoinRequestResponse>(
        `/schools/${schoolId}/join-requests/${userId}/reject`
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting join request:', error);
      throw error;
    }
  },

  // Mettre à jour une école
  async updateSchool(id: string, schoolData: Partial<SchoolInput>): Promise<School> {
    try {
      const response = await api.put<{ school: School }>(`/schools/${id}`, schoolData);
      return response.data.school;
    } catch (error) {
      console.error('Error updating school:', error);
      throw error;
    }
  },

  // Obtenir les détails d'une école
  async getSchoolById(id: string): Promise<School> {
    try {
      const response = await api.get<School>(`/schools/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching school:', error);
      throw error;
    }
  },

  // Obtenir les membres d'une école
  async getSchoolMembers(schoolId: string): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`/schools/${schoolId}/members`);
      return response.data;
    } catch (error) {
      console.error('Error fetching school members:', error);
      throw error;
    }
  },

  // Mettre à jour les rôles d'un membre
  async updateMemberRoles(schoolId: string, memberId: string, roles: string[]): Promise<{ message: string }> {
    try {
      const response = await api.patch<{ message: string }>(
        `/schools/${schoolId}/members/${memberId}/roles`,
        { roles }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating member roles:', error);
      throw error;
    }
  },

  // Supprimer une école (note: this endpoint might not exist yet in your router)
  async deleteSchool(id: string): Promise<void> {
    try {
      await api.delete(`/schools/${id}`);
    } catch (error) {
      console.error('Error deleting school:', error);
      throw error;
    }
  },

  async inviteMember(schoolId: string, inviteData: InviteMemberRequest): Promise<void> {
    await api.post(`/schools/${schoolId}/invitations`, inviteData);
  },

  // If you're using the join request flow instead:
  async createJoinRequest(schoolId: string, userId: string): Promise<void> {
    await api.post(`/schools/${schoolId}/request-join`, { userId });
  }
};

export default schoolService;