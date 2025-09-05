import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface School {
  id: string;
  name: string;
  logo?: string;
}

interface AuthState {
  user: User | null;
  currentSchool: School | null;
  userSchools: School[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; schools: School[]; currentSchool: School } }
  | { type: 'LOGOUT' }
  | { type: 'SWITCH_SCHOOL'; payload: School }
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
  logout: () => void;
  switchSchool: (school: School) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Simulate checking for existing session
    const savedAuth = localStorage.getItem('schoolAuth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: authData,
        });
      } catch (error) {
        localStorage.removeItem('schoolAuth');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string, schoolId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: '1',
      name: 'Jean Dupont',
      email: email,
      avatar: '/placeholder-avatar.jpg'
    };
    
    const mockSchools = [
      { id: '1', name: 'École Primaire Saint-Michel' },
      { id: '2', name: 'Collège Victor Hugo' },
    ];
    
    const currentSchool = mockSchools.find(s => s.id === schoolId) || mockSchools[0];
    
    const authData = {
      user: mockUser,
      schools: mockSchools,
      currentSchool,
    };
    
    localStorage.setItem('schoolAuth', JSON.stringify(authData));
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: authData,
    });
  };

  const logout = () => {
    localStorage.removeItem('schoolAuth');
    dispatch({ type: 'LOGOUT' });
  };

  const switchSchool = (school: School) => {
    const authData = JSON.parse(localStorage.getItem('schoolAuth') || '{}');
    authData.currentSchool = school;
    localStorage.setItem('schoolAuth', JSON.stringify(authData));
    dispatch({ type: 'SWITCH_SCHOOL', payload: school });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        switchSchool,
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