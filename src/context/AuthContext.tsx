import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '@/lib/api';
import { User, School, AuthResponse } from '@/types';
import { toast } from '@/components/ui/use-toast';

// SchoolWithId est un type qui permet d'utiliser soit 'id' soit '_id' pour identifier une école
interface SchoolWithId extends Omit<School, 'id'> {
  id: string;
  _id?: string;
}

interface AuthState {
  user: User | null;
  currentSchool: SchoolWithId | null;
  userSchools: SchoolWithId[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; schools: SchoolWithId[]; currentSchool: SchoolWithId | null } }
  | { type: 'LOGOUT' }
  | { type: 'SWITCH_SCHOOL'; payload: SchoolWithId }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  currentSchool: null,
  userSchools: [],
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        userSchools: action.payload.schools,
        currentSchool: action.payload.currentSchool,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        currentSchool: null,
        userSchools: [],
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SWITCH_SCHOOL':
      return {
        ...state,
        currentSchool: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string, schoolId: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  switchSchool: (school: SchoolWithId) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkSession = async () => {
      const savedAuth = localStorage.getItem('schoolAuth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          
          // Vérifier si le token est toujours valide
          const isValid = await api.get('/auth/check').then(() => true).catch(() => false);
          
          if (isValid) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: authData,
            });
          } else {
            // Token invalide, nettoyer le stockage local
            localStorage.removeItem('token');
            localStorage.removeItem('schoolAuth');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } catch (error) {
          localStorage.removeItem('schoolAuth');
          localStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    checkSession();
  }, []);

  const login = async (email: string, password: string, schoolId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Appel à l'API d'authentification
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
        school_id: schoolId || undefined
      });
      
      const { token, user, schools = [] } = response.data;
      
      if (!token || !user) {
        throw new Error('Réponse du serveur invalide');
      }
      
      // Stocker le token JWT
      localStorage.setItem('token', token);
      
      // Convertir les écoles en format SchoolWithId
      const schoolsWithId: SchoolWithId[] = schools.map(school => {
        // Type assertion pour accéder à _id si présent
        const schoolWithId = school as unknown as { _id?: string } & School;
        return {
          ...school,
          id: school.id || schoolWithId._id || '',
        };
      });
      
      // Trouver l'école sélectionnée ou la première école disponible
      let currentSchool: SchoolWithId | null = null;
      if (schoolId) {
        currentSchool = schoolsWithId.find(school => school.id === schoolId) || null;
      } else if (schoolsWithId.length > 0) {
        currentSchool = schoolsWithId[0];
      }
      
      const authData = {
        user,
        schools: schoolsWithId,
        currentSchool,
      };
      
      localStorage.setItem('schoolAuth', JSON.stringify(authData));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: authData,
      });
      
      // Vérifier si l'utilisateur a des écoles associées
      if (schoolsWithId.length === 0) {
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue, ${user.firstName || user.name}! Vous n'avez pas encore d'école associée.`,
        });
      } else if (schoolsWithId.length > 1 && !schoolId) {
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue, ${user.firstName || user.name}! Veuillez sélectionner une école.`,
        });
      } else {
        // Une seule école ou école déjà sélectionnée
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue, ${user.firstName || user.name}!`,
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      
      toast({
        title: 'Échec de connexion',
        description: 'Email ou mot de passe incorrect.',
        variant: 'destructive',
      });
    }
  };

  const logout = async () => {
    try {
      // Appel à l'API de déconnexion
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer les données d'authentification locales
      localStorage.removeItem('token');
      localStorage.removeItem('schoolAuth');
      dispatch({ type: 'LOGOUT' });
    }
  };

  /**
   * Changer d'école active
   */
  const switchSchool = async (school: SchoolWithId): Promise<void> => {
    try {
      // Appel à l'API pour changer d'école et obtenir un nouveau token
      const response = await api.post<{ token: string; message: string }>('/schools/switch', {
        schoolId: school?.id || school?._id
      });
      
      const { token } = response.data;
      
      // Mettre à jour le token JWT
      localStorage.setItem('token', token);
      
      // Mettre à jour les données d'authentification locales
      const authData = JSON.parse(localStorage.getItem('schoolAuth') || '{}');
      authData.currentSchool = school;
      localStorage.setItem('schoolAuth', JSON.stringify(authData));
      
      // Mettre à jour le state
      dispatch({ type: 'SWITCH_SCHOOL', payload: school });
      
      toast({
        title: 'École changée',
        description: `Vous avez sélectionné l'école ${school.name}.`,
      });
    } catch (error) {
      console.error('Erreur lors du changement d\'école:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de changer d\'école.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  /**
   * Met à jour le profil de l'utilisateur
   */
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await api.put<{ user: User }>('/auth/profile', userData);
      
      // Mettre à jour les données utilisateur dans le state et le localStorage
      const authData = JSON.parse(localStorage.getItem('schoolAuth') || '{}');
      authData.user = response.data.user;
      localStorage.setItem('schoolAuth', JSON.stringify(authData));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          ...authData,
          user: response.data.user
        },
      });
      
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été mises à jour avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  const checkAuth = async (): Promise<boolean> => {
    try {
      await api.get('/auth/check');
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Inscription d'un nouvel utilisateur
   */
  const register = async (name: string, email: string, phone: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Appel à l'API d'inscription
      await api.post('/auth/register', {
        name,
        email,
        phone,
        password
        // Plus besoin d'envoyer school_id car la sélection se fait après la connexion
      });
      
      // L'inscription ne connecte pas automatiquement l'utilisateur
      dispatch({ type: 'SET_LOADING', payload: false });
      
      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
      });
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      
      toast({
        title: 'Échec de l\'inscription',
        description: error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        switchSchool,
        updateProfile,
        checkAuth
      }}
    >
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