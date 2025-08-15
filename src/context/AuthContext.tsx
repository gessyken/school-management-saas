import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { User, AuthResponse } from '@/types/User';
import { SCHOOL_KEY, TOKEN_KEY, USER_KEY } from "@/lib/key";
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  socialLogin: (email: string) => Promise<void>;
  verifyEmail: (email: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  selectSchool: (schoolId: string) => Promise<void>;
}

// Interfaces matching your service
export interface RegisterData {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string | 'male' | 'female' | 'other';
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

type UserRole = 'USER' | 'ADMIN' | 'STUDENT';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Verify token validity by fetching profile
          await getProfile();
        }
      } catch (err) {
        console.error('Initial auth check failed', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleAuthResponse = (response) => {
    console.log("response ok", response)
    if (!response.token || !response.user) {
      throw new Error('Invalid authentication response');
    }

    setToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);
    setError(null);

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      handleAuthResponse(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      handleAuthResponse(response.data);
    } catch (err) {
      const errorMessage = err?.response?.data?.message[language] || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SCHOOL_KEY);
  };

  const getProfile = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getProfile();
      console.log("profile", response)
      setUser(response.data);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      logout();
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    setIsLoading(true);
    try {
      const response = await authService.updateProfile(data);
      setUser(response.data);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    setIsLoading(true);
    try {
      await authService.changePassword(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await authService.socialLogin(email);
      handleAuthResponse(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Social login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.verifyEmail(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.resendVerification(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Resend verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSchool = async (schoolId: string) => {
    setIsLoading(true);
    try {
      const response = await authService.selectSchool(schoolId);
      // setToken(response.data.token);
      // localStorage.setItem(TOKEN_KEY, response.data.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'School selection failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user || !user.roles) return false;

    if (Array.isArray(role)) {
      return role.some(r => user.roles.includes(r));
    }
    return user.roles.includes(role);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    socialLogin,
    verifyEmail,
    resendVerification,
    hasRole,
    selectSchool,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};