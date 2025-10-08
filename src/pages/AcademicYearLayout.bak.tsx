import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  Home, 
  LayoutDashboard,
  FileText,
  Award,
  GraduationCap,
  DollarSign,
  BarChart3
} from 'lucide-react';

const AcademicYearLayout: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },

    { 
      name: 'Tableau de bord', 
      href: '/academic-years/overview', 
      icon: Home 
    },
    { 
      name: 'Affectation élèves', 
      href: '/academic-years/assignment', 
      icon: Users 
    },
    { 
      name: 'Notes et évaluations', 
      href: '/academic-years/grades', 
      icon: BookOpen,
      children: [
        { name: 'Saisie des notes', href: '/academic-years/grades' },
        { name: 'Saisie en masse', href: '/academic-years/grades/bulk' }
      ]
    },
    { 
      name: 'Statistiques', 
      href: '/academic-years/analytics', 
      icon: TrendingUp 
    },
    { 
      name: 'Frais scolaires', 
      href: '/academic-years/fees', 
      icon: DollarSign,
      children: [
        { name: 'Gestion des frais', href: '/academic-years/fees' },
        { name: 'Analytique financière', href: '/academic-years/fees/analytics' }
      ]
    },
    { 
      name: 'Classements', 
      href: '/academic-years/ranks', 
      icon: Award 
    },
    { 
      name: 'Promotion élèves', 
      href: '/academic-years/promotion', 
      icon: GraduationCap 
    },
    { 
      name: 'Bulletins', 
      href: '/academic-years/reports', 
      icon: FileText 
    },
    { 
      name: 'Paramètres', 
      href: '/academic-years/settings', 
      icon: Settings 
    },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isChildActive = (children: any[] = []) => {
    return children.some(child => isActivePath(child.href));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Gestion Académique</h1>
            <p className="text-sm text-gray-500 mt-1">Système de gestion scolaire</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              const hasActiveChild = isChildActive(item.children);

              return (
                <div key={item.name} className="space-y-1">
                  <NavLink
                    to={item.href}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group
                      ${isActive || hasActiveChild
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                
                    {/* {item.children && item.children.length > 0 && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        isActive || hasActiveChild ? 'rotate-180' : ''
                      }`} />
                    )} */}
                  </NavLink>

                  {/* Child Navigation */}
                  {/* {item.children && item.children.length > 0 && (isActive || hasActiveChild) && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = location.pathname === child.href;
                        return (
                          <NavLink
                            key={child.name}
                            to={child.href}
                            className={`
                              flex items-center px-3 py-2 rounded-lg text-sm transition-colors
                              ${isChildActive
                                ? 'bg-primary/20 text-primary font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }
                            `}
                          >
                            <span>{child.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )} */}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2024 École Management System
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AcademicYearLayout;
