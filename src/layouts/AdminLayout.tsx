import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  School, 
  DollarSign, 
  Settings, 
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: number;
}

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Get user roles for current school
  const userRoles = user?.memberships?.find(m => m.school === (user as any)?.currentSchool)?.roles || [];
  const isAdmin = userRoles.includes('ADMIN');
  const isTeacher = userRoles.includes('TEACHER');
  const isFinance = userRoles.includes('FINANCE');

  const navItems: NavItem[] = [
    {
      path: '/admin',
      label: 'Tableau de bord',
      icon: BarChart3,
    },
    {
      path: '/admin/users',
      label: 'Utilisateurs',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      path: '/admin/students',
      label: 'Élèves',
      icon: GraduationCap,
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      path: '/admin/classes',
      label: 'Classes',
      icon: School,
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      path: '/admin/subjects',
      label: 'Matières',
      icon: BookOpen,
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      path: '/admin/finances',
      label: 'Finances',
      icon: DollarSign,
      roles: ['ADMIN', 'FINANCE'],
    },
    {
      path: '/admin/settings',
      label: 'Paramètres',
      icon: Settings,
      roles: ['ADMIN'],
    },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => userRoles.includes(role));
  });

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getPageTitle = () => {
    const currentItem = navItems.find(item => isActivePath(item.path));
    return currentItem?.label || 'Administration';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`
        ${sidebarCollapsed ? 'w-16' : 'w-64'} 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        fixed md:relative z-50 h-full bg-card border-r border-border
        transition-all duration-300 ease-in-out
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold text-foreground">Administration</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userRoles.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
                <p className="text-sm text-muted-foreground">
                  Gestion de l'établissement
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {(user as any)?.school?.name || 'École'}
              </Badge>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
