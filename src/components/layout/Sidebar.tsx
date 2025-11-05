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
  Building,
  X
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
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed = false, 
  onToggleCollapse,
  isMobileOpen = false,
  onMobileToggle
}) => {
  const location = useLocation();
  const { currentSchool, logout, user, switchSchool, userSchools } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  // Use external state if provided, otherwise use internal state
  const mobileOpen = isMobileOpen !== undefined ? isMobileOpen : isMobileMenuOpen;
  
  const handleMobileToggle = () => {
    if (onMobileToggle) {
      onMobileToggle();
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };
  const handleSchoolChange = (school: any) => {
    switchSchool(school);
  };

  const leaveSchool = () => {
    localStorage.removeItem('schoolAuth');
    navigate("/select-school");
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleMobileToggle}
        />
      )}
      
      <div className={cn(
        'bg-gradient-to-br from-primary via-primary to-primary/95 text-white h-screen flex flex-col transition-all duration-300 ease-in-out relative shadow-elevated z-50',
        'fixed lg:relative',
        isCollapsed ? 'w-20' : 'w-72',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Mobile Close Button */}
        <button
          onClick={handleMobileToggle}
          className="absolute top-4 right-4 lg:hidden w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Collapse Toggle Button (desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 z-10 w-7 h-7 bg-primary rounded-full border-2 border-white shadow-lg items-center justify-center hover:bg-primary-hover hover:scale-110 transition-all duration-200 backdrop-blur-sm"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight className={cn(
            "w-4 h-4 transition-transform duration-300",
            isCollapsed ? "rotate-180" : "rotate-0"
          )} />
        </button>

        {/* Header */}
        <div className="p-5 border-b border-white/20 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/30 transition-all duration-200 overflow-hidden">
              {currentSchool?.logoUrl ? (
                <img
                  src={!currentSchool.logoUrl.startsWith('/upload') ?
                    currentSchool.logoUrl :
                    `${baseURL}/../document${currentSchool.logoUrl}`}
                  alt="Logo de l'école"
                  className="w-full h-full object-cover"
                />
              ) : (
                <School className="w-6 h-6" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <h1 className="font-bold text-lg truncate drop-shadow-sm">
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
        <div className="px-4 py-3 border-b border-white/20 bg-white/5 backdrop-blur-sm">
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
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 hover:bg-white/15 transition-all duration-200 cursor-pointer backdrop-blur-sm"
          >
            {userSchools.map((school) => (
              <option key={school.id} value={school.id} className="bg-primary text-white">
                {school.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        {navigation.map((group, groupIndex) => (
          <div key={groupIndex} className="animate-fade-in" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3 px-2">
                {group.group}
              </h3>
            )}
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={handleMobileToggle}
                    className={cn(
                      'flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                      'hover:bg-white/20 hover:backdrop-blur-sm hover:shadow-lg hover:scale-[1.02]',
                      isActive && 'bg-white/25 backdrop-blur-sm shadow-lg border border-white/20 scale-[1.02]',
                      isCollapsed && 'justify-center px-2 py-3'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}
                    <item.icon className={cn(
                      'w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                      !isCollapsed && 'mr-3'
                    )} />
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="w-2 h-2 bg-white rounded-full ml-auto animate-pulse" />
                    )}
                    {!isActive && !isCollapsed && (
                      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-70 transition-opacity duration-200" />
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
            <div className="flex items-center space-x-3 mb-4 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20 shadow-md hover:bg-white/30 transition-all duration-200">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs opacity-80 truncate">{formatEmail(user?.email)}</p>
                {currentSchool && (
                  <p className="text-xs opacity-60 truncate mt-1">
                    {currentSchool.name}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Button
                onClick={leaveSchool}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/20 hover:text-white border border-white/20 hover:scale-[1.02] transition-all duration-200"
                size="sm"
              >
                <Building className="w-4 h-4 mr-2" />
                Changer D'Ecole
              </Button>

              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/20 hover:text-white border border-white/20 hover:scale-[1.02] transition-all duration-200"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20 shadow-md hover:bg-white/30 transition-all duration-200 cursor-pointer">
              <User className="w-5 h-5" />
            </div>
            <button
              onClick={logout}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20 hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-md"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Version Info (only when expanded) */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-t border-white/20 bg-white/5 backdrop-blur-sm">
          <p className="text-xs text-center opacity-60">
            v1.0.0 • © 2024 SchoolManager
          </p>
        </div>
      )}
      </div>
    </>
  );
};

export { Sidebar };