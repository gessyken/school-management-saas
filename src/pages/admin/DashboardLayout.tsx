import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/header/Header";
import {
  LayoutDashboard,
  School,
  Users,
  BarChart3,
  CreditCard,
  FileClock,
  Settings,
  ChevronDown,
  ChevronRight,
  Languages,
} from "lucide-react";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: MenuItem[];
}

const AdminDashboardLayout = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const menuItems: MenuItem[] = [
    {
      label: "dashboard",
      icon: LayoutDashboard,
      path: "/admin-dashboard"
    },
    {
      label: "schools",
      icon: School,
      path: "/admin-dashboard/manage-schools"
    },
    {
      label: "users",
      icon: Users,
      path: "/admin-dashboard/manage-users"
    },
    {
      label: "reports",
      icon: BarChart3,
      children: [
        {
          label: "statistics",
          icon: BarChart3,
          path: "/admin-dashboard/reports/statistics"
        },
        {
          label: "financial",
          icon: CreditCard,
          path: "/admin-dashboard/reports/financial"
        }
      ]
    },
    {
      label: "system",
      icon: Settings,
      children: [
        {
          label: "logs",
          icon: FileClock,
          path: "/admin-dashboard/system/logs"
        },
        {
          label: "settings",
          icon: Settings,
          path: "/admin-dashboard/system/settings"
        }
      ]
    }
  ];

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const changeLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLanguage(newLang);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Dark blue background similar to original */}
      <aside className="w-64 bg-[#0f172f] text-white flex flex-col border-r border-gray-200">
        <div className="p-5 border-b border-[#1e293b]">
          <h1 className="text-xl font-bold">{t('admin.layout.title')}</h1>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label} className="mb-1">
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-[#1e293b] text-gray-200'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{t(`admin.layout.${item.label}`)}</span>
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-[#1e293b] text-gray-200 transition-colors"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      <span>{t(`admin.layout.${item.label}`)}</span>
                    </div>
                    {expandedMenus[item.label] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {expandedMenus[item.label] && item.children && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path!}
                          className={({ isActive }) =>
                            `flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-[#1e293b] text-gray-300'
                            }`
                          }
                        >
                          <child.icon className="w-4 h-4 mr-3" />
                          {t(`admin.layout.${child.label}`)}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1e293b]">
          <button
            onClick={changeLanguage}
            className="flex items-center w-full px-3 py-2 rounded-md hover:bg-[#1e293b] text-gray-200 transition-colors"
          >
            <Languages className="w-5 h-5 mr-3" />
            <span>{t('admin.layout.change_language')}</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;