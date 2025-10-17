import api from '@/lib/api';

export type Teacher = {
  id: string;
  name: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
};

export type User = {
  _id: string;
  avatar: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  memberships: Array<{
    school: string;
    roles: string[];
    status: 'active' | 'pending' | 'suspended';
    joinedAt: string;
  }>;
  createdAt: string;
};

export const usersService = {
  async getTeachers(): Promise<Teacher[]> {
    try {
      const res = await api.get('/users/teachers');
      const users = res.data?.users || [];
      return users.map((u: any) => ({
        id: u._id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
      }));
    } catch {
      return [];
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await api.get('/users');
      return res.data?.users || [];
    } catch {
      return [];
    }
  },

  async inviteMember(payload: {
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    message?: string;
    schoolId: string;
  }): Promise<any> {
    const res = await api.post('/users/invite', payload);
    return res.data;
  },
};
