import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  ChevronRight,
  User,
  Building
} from 'lucide-react';
import { cn, formatEmail } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { baseURL } from '@/lib/api';

const navigation = [
  {
    group: "Général",
    items: [
      { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    group: "Pédagogie",
    items: [
      { name: 'Matières', href: '/subjects', icon: GraduationCap },
      { name: 'Classes', href: '/classes', icon: BookOpen },
      { name: 'Élèves', href: '/students', icon: Users },
      { name: 'Années académiques', href: '/academic-years', icon: Calendar },
      { name: 'Bulletins', href: '/reports', icon: FileText },
    ]
  },
  {
    group: "Administration",
    items: [
      { name: 'Finances', href: '/finances', icon: DollarSign },
      { name: 'Administration', href: '/administration', icon: Building },
      { name: 'Paramètres', href: '/settings', icon: Settings },
    ]
  }
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const { currentSchool, logout, user, switchSchool, userSchools } = useAuth();
  const navigate = useNavigate();
  console.log("currentSchool", currentSchool)
  const handleSchoolChange = (school: any) => {
    switchSchool(school);
  };

  const leaveSchool = () => {
    localStorage.removeItem('schoolAuth');
    navigate("/select-school");
  };

  return (
    <div className={cn(
      'bg-gradient-to-b from-primary to-primary/90 text-white h-screen flex flex-col transition-all duration-300 relative',
      isCollapsed ? 'w-16' : 'w-[50vh]'
    )}>
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 z-10 w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <ChevronRight className={cn(
          "w-3 h-3 transition-transform",
          isCollapsed ? "rotate-180" : "rotate-0"
        )} />
      </button>

      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            {currentSchool.logoUrl ? (
              <div className="relative">
                <img
                  src={!currentSchool.logoUrl.startsWith('/upload') ?
                    currentSchool.logoUrl :
                    `${baseURL}/../document${currentSchool.logoUrl}`}
                  alt="Logo de l'école"
                  className="w-6 h-6 rounded-xl object-cover border-4 border-white shadow-lg"
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate">
                {currentSchool?.name || 'École'}
              </h1>
              <p className="text-xs opacity-90 truncate">
                Système de gestion scolaire
              </p>
            </div>
          )}
        </div>
      </div>

      {/* School Selector (only when expanded) */}
      {!isCollapsed && userSchools && userSchools.length > 1 && (
        <div className="px-4 py-3 border-b border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              Changer d'école
            </span>
          </div>
          <select
            value={currentSchool?.id}
            onChange={(e) => {
              const selectedSchool = userSchools.find(school => school.id === e.target.value);
              if (selectedSchool) handleSchoolChange(selectedSchool);
            }}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 hover:bg-white/15 transition-colors"
          >
            {userSchools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {navigation.map((group, groupIndex) => (
          <div key={groupIndex}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3 px-2">
                {group.group}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                      'hover:bg-white/20 hover:backdrop-blur-sm hover:shadow-soft',
                      isActive && 'bg-white/20 backdrop-blur-sm shadow-soft border border-white/10',
                      isCollapsed && 'justify-center px-2 py-3'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
                      !isCollapsed && 'mr-3'
                    )} />
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto animate-pulse" />
                    )}
                    {!isActive && !isCollapsed && (
                      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-70 transition-opacity" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/20 bg-white/5 backdrop-blur-sm">
        {!isCollapsed ? (
          <>
            <Button
              onClick={leaveSchool}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/20 hover:text-white border border-white/20"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Changer D'Ecole
            </Button>

            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/20 hover:text-white border border-white/20"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/10">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/30 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Version Info (only when expanded) */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-t border-white/20">
          <p className="text-xs text-center opacity-50">
            v1.0.0 • © 2024 SchoolManager
          </p>
        </div>
      )}
    </div>
  );
};

export { Sidebar };