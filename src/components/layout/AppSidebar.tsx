
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
  LogOut,
  Newspaper,
  School,
  UserCheck,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
          { name: 'Tableau de bord', path: '/director/dashboard', icon: Home },
          { name: 'Classes', path: '/director/classes', icon: School },
          { name: 'Matières', path: '/director/subjects', icon: BookOpen },
          { name: 'Résultats', path: '/director/results', icon: Newspaper },
          { name: 'Élèves', path: '/director/students', icon: Users },
          { name: 'Liste Classes', path: '/director/classes-list', icon: UserCheck },
          { name: 'Paramètres', path: '/director/settings', icon: Settings },
          { name: 'Paiements', path: '/director/payments', icon: CreditCard },
          { name: 'Notes', path: '/director/grades', icon: GraduationCap },
          { name: 'Statistiques', path: '/director/statistics', icon: BarChart3 },
        ];
      case 'SECRETARY':
        return [
          { name: 'Tableau de bord', path: '/secretary/dashboard', icon: Home },
          { name: 'Classes', path: '/secretary/classes', icon: School },
          { name: 'Élèves', path: '/secretary/students', icon: Users },
          { name: 'Paiements', path: '/secretary/payments', icon: CreditCard },
        ];
      case 'TEACHER':
        return [
          { name: 'Tableau de bord', path: '/teacher/dashboard', icon: Home },
          { name: 'Classes', path: '/teacher/classes', icon: School },
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
        "min-h-screen bg-gradient-to-b from-skyblue/5 to-mustard/5 border-r border-skyblue/20 transition-all duration-300 flex flex-col backdrop-blur-sm",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo and collapse button */}
      <div className={cn(
        "flex items-center p-6 border-b border-skyblue/20 bg-white/80 backdrop-blur-sm",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-skyblue to-mustard rounded-lg shadow-lg">
              <School className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-skyblue to-mustard bg-clip-text text-transparent">
                MI-TECH
              </span>
              <div className="text-xs text-muted-foreground">École</div>
            </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full hover:bg-skyblue/20 transition-all duration-200"
        >
          <ChevronLeft className={cn(
            "h-5 w-5 transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* User info */}
      <div className={cn(
        "p-4 border-b border-skyblue/20 bg-white/60 backdrop-blur-sm",
        collapsed ? "items-center" : ""
      )}>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-skyblue/20 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-skyblue to-mustard text-white font-semibold">
              {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role === 'DIRECTOR' ? 'Directeur' : 
                 user?.role === 'SECRETARY' ? 'Secrétaire' : 'Enseignant'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-2">
        <div className={cn(
          "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4",
          collapsed && "text-center"
        )}>
          {!collapsed && "Navigation"}
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center p-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-skyblue to-mustard text-white shadow-lg" 
                      : "hover:bg-skyblue/10 text-foreground hover:text-foreground",
                    collapsed && "justify-center"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-skyblue to-mustard opacity-10"></div>
                  )}
                  
                  <div className="relative z-10 flex items-center">
                    <item.icon className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-skyblue"
                    )} />
                    {!collapsed && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                  </div>
                  
                  {/* Hover effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-skyblue/10 to-mustard/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-skyblue/20 bg-white/60 backdrop-blur-sm">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-skyblue/10 rounded-xl transition-all duration-200",
            collapsed && "justify-center"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3 font-medium">Déconnexion</span>}
        </Button>
      </div>
    </aside>
  );
};
