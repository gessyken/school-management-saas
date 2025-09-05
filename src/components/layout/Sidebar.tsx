import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  School,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Étudiants', href: '/students', icon: Users },
  { name: 'Classes', href: '/classes', icon: BookOpen },
  { name: 'Matières', href: '/subjects', icon: GraduationCap },
  { name: 'Années académiques', href: '/academic-years', icon: Calendar },
  { name: 'Bulletins', href: '/reports', icon: FileText },
  { name: 'Finances', href: '/finances', icon: DollarSign },
  { name: 'Administration', href: '/administration', icon: School },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const location = useLocation();
  const { currentSchool, logout, user } = useAuth();

  return (
    <div className={cn(
      'bg-gradient-primary text-white h-screen flex flex-col transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <School className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm truncate">
                {currentSchool?.name || 'École'}
              </h1>
              <p className="text-xs opacity-80 truncate">
                Système de gestion
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'hover:bg-white/20 hover:backdrop-blur-sm',
                isActive && 'bg-white/20 backdrop-blur-sm shadow-soft',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0',
                !isCollapsed && 'mr-3'
              )} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="w-2 h-2 bg-white rounded-full ml-auto" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/20">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs opacity-80 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium',
            'hover:bg-white/20 transition-colors duration-200',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className={cn(
            'w-5 h-5 flex-shrink-0',
            !isCollapsed && 'mr-3'
          )} />
          {!isCollapsed && 'Déconnexion'}
        </button>
      </div>
    </div>
  );
};

export { Sidebar };