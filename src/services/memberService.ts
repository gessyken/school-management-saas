// services/memberService.ts
import api from '@/lib/api';
import { User } from './usersService';

export interface Member extends User {
    memberships: {
        school: string;
        roles: string[];
        status: 'active' | 'pending' | 'inactive';
    }[];
}

export interface UpdateRolesRequest {
    roles: string[];
}

export const memberService = {
    // Get school members
    async getSchoolMembers(schoolId: string): Promise<Member[]> {
        const response = await api.get(`/schools/${schoolId}/members`);
        return response.data;
    },

    // Update member roles
    async updateMemberRoles(schoolId: string, memberId: string, roles: string[]): Promise<void> {
        await api.patch(`/schools/${schoolId}/members/${memberId}/roles`, { roles });
    },

    // Remove member from school
    async removeMember(schoolId: string, memberId: string): Promise<void> {
        await api.delete(`/schools/${schoolId}/members/${memberId}`);
    }
};

