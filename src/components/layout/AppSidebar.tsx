
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  ChevronLeft, 
  Home, 
  Users, 
  BookOpen, 
  CreditCard, 
  GraduationCap, 
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const AppSidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Define navigation items based on user role
  const getNavItems = () => {
    switch (user?.role) {
      case 'DIRECTOR':
        return [
          { name: 'Dashboard', path: '/director/dashboard', icon: Home },
          { name: 'Classes', path: '/director/classes', icon: BookOpen },
          { name: 'Subject', path: '/director/subjects', icon: BookOpen },
          { name: 'Élèves', path: '/director/students', icon: Users },
          { name: 'Paiements', path: '/director/payments', icon: CreditCard },
          { name: 'Notes', path: '/director/grades', icon: GraduationCap },
          { name: 'Statistiques', path: '/director/statistics', icon: BarChart3 },
        ];
      case 'SECRETARY':
        return [
          { name: 'Dashboard', path: '/secretary/dashboard', icon: Home },
          { name: 'Classes', path: '/secretary/classes', icon: BookOpen },
          { name: 'Élèves', path: '/secretary/students', icon: Users },
          { name: 'Paiements', path: '/secretary/payments', icon: CreditCard },
        ];
      case 'TEACHER':
        return [
          { name: 'Dashboard', path: '/teacher/dashboard', icon: Home },
          { name: 'Classes', path: '/teacher/classes', icon: BookOpen },
          { name: 'Notes', path: '/teacher/grades', icon: GraduationCap },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside 
      className={cn(
        "min-h-screen bg-skyblue/10 border-r border-skyblue/20 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo and collapse button */}
      <div className={cn(
        "flex items-center p-4 border-b border-skyblue/20",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center">
            <span className="font-semibold text-lg text-skyblue">MI-TECH</span>
            <span className="ml-1 text-xs bg-mustard text-white px-2 py-0.5 rounded">École</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full hover:bg-skyblue/20"
        >
          <ChevronLeft className={cn(
            "h-5 w-5 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* User info */}
      <div className={cn(
        "p-4 border-b border-skyblue/20",
        collapsed ? "items-center" : ""
      )}>
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-skyblue text-white flex items-center justify-center font-medium">
            {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role === 'DIRECTOR' ? 'Directeur' : 
                 user?.role === 'SECRETARY' ? 'Secrétaire' : 'Enseignant'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center p-3 rounded-md transition-colors",
                    isActive 
                      ? "bg-skyblue text-white" 
                      : "hover:bg-skyblue/20",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-skyblue/20">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground",
            collapsed && "justify-center"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-2">Déconnexion</span>}
        </Button>
      </div>
    </aside>
  );
};
