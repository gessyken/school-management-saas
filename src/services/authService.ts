import api from '@/lib/api';
import { AuthResponse } from '@/types/User';
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string|'male' | 'female' | 'other';
  // Add other updatable fields
}

interface UpdateUserRolesData {
  roles: ('USER' | 'ADMIN' | 'STUDENT')[];
}

export const authService = {
  // Authentication
  async login(credentials: LoginCredentials) {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterData) {
    return api.post<AuthResponse>('/auth/register', data);
  },

  async socialLogin(email: string) {
    return api.post<AuthResponse>('/auth/social-login', { email });
  },

  // Profile Management
  async getProfile() {
    return api.get<AuthResponse>('/auth/profile');
  },

  async updateProfile(data: UpdateProfileData) {
    return api.put<AuthResponse>('/auth/profile', data);
  },

  // Password Management
  async changePassword(data: ChangePasswordData): Promise<{ message: { en: string; fr: string } }> {
    return api.put('/auth/change-password', data);
  },

  async forgotPassword(email: string): Promise<{ message: { en: string; fr: string } }> {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: { en: string; fr: string } }> {
    return api.put(`/auth/reset-password/${resetToken}`, { password: newPassword });
  },

  // Email Verification
  async verifyEmail(email: string): Promise<{ message: { en: string; fr: string } }> {
    return api.post('/auth/verify-email', { email });
  },

  async resendVerification(email: string): Promise<{ message: { en: string; fr: string } }> {
    return api.post('/auth/resend-verification', { email });
  },

  // Admin Functions
  async getAllUsers() {
    return api.get('/auth/users');
  },

  async updateUserRoles(userId: string, data: UpdateUserRolesData) {
    return api.put(`/auth/users/${userId}/roles`, data);
  },

  // Utility function to handle school selection
  async selectSchool(schoolId: string): Promise<{ token: string }> {
    return api.post('/auth/select-school', { schoolId });
  }
};