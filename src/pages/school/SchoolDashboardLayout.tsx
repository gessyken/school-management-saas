import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/header/Header";
import {
  ChevronDown,
  ChevronRight,
  Users,
  BookOpen,
  CreditCard,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  Newspaper,
  Logs,
  Languages,
} from "lucide-react";

interface SidebarItem {
  label: string;
  icon?: React.ElementType;
  path?: string;
  children?: SidebarItem[];
}

import {
  LayoutDashboard,
  ScrollText,
  ListOrdered,
  School,
  ShieldCheck,
  FileText,
  UserCheck,
  Building2,
  UserCog,
  FileClock,
  BookMarked
} from "lucide-react";

const getSidebarTabs = (t: (key: string) => string): SidebarItem[] => [
  {
    label: t("overview"),
    path: "/school-dashboard",
    icon: LayoutDashboard,
  },
  {
    label: t("academic"),
    children: [
      {
        label: t("class"),
        path: "/school-dashboard/academic/classes",
        icon: School,
      },
      {
        label: t("subjects"),
        path: "/school-dashboard/academic/subjects",
        icon: BookMarked,
      },
      {
        label: t("results"),
        path: "/school-dashboard/academic/results",
        icon: ScrollText,
      },
      {
        label: t("students"),
        path: "/school-dashboard/academic/students",
        icon: Users,
      },
      {
        label: t("classesList"),
        path: "/school-dashboard/academic/classes-list",
        icon: ListOrdered,
      },
      {
        label: t("settings"),
        path: "/school-dashboard/academic/settings",
        icon: Settings,
      },
      {
        label: t("payments"),
        path: "/school-dashboard/academic/payments",
        icon: CreditCard,
      },
      {
        label: t("grades"),
        path: "/school-dashboard/academic/grades",
        icon: GraduationCap,
      },
      {
        label: t("statistics"),
        path: "/school-dashboard/academic/statistics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: t("settings"),
    children: [
      {
        label: t("editSchool"),
        path: "/school-dashboard/edit",
        icon: Building2,
      },
      {
        label: t("joinRequests"),
        path: "/school-dashboard/join-requests",
        icon: UserCheck,
      },
      {
        label: t("members"),
        path: "/school-dashboard/members",
        icon: UserCog,
      },
      {
        label: t("billing"),
        path: "/school-dashboard/billing",
        icon: CreditCard,
      },
    ],
  },
  {
    label: t("logs"),
    path: "/school-dashboard/logs",
    icon: FileClock,
  },
];

const SidebarMenuItem = ({ item }: { item: SidebarItem }) => {
  const [open, setOpen] = useState(false);
  const isExpandable = item.children && item.children.length > 0;

  return (
    <div className="space-y-1">
      {isExpandable ? (
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-full text-left px-4 py-2 flex items-center justify-between rounded-md hover:bg-primary/10 hover:text-primary transition"
        >
          <span className="font-medium">{item.label}</span>
          {open ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      ) : (
        <NavLink
          to={item.path!}
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-md transition ${
              isActive ? "bg-primary text-white" : "hover:bg-primary/10 text-primary"
            }`
          }
        >
          {item.icon && <item.icon className="w-4 h-4" />}
          {item.label}
        </NavLink>
      )}

      {isExpandable && open && (
        <div className="ml-4 mt-1 space-y-1">
          {item.children?.map((child) => (
            <NavLink
              key={child.path}
              to={child.path!}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-1.5 text-sm rounded-md transition ${
                  isActive ? "bg-primary text-white" : "hover:bg-primary/10 text-primary"
                }`
              }
            >
              {child.icon && <child.icon className="w-4 h-4" />}
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const SchoolDashboardLayout = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const changeLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
  };

  return (
    <div className="flex h-screen bg-muted text-foreground">
      {/* Sidebar */}
      <aside className="w-[250px] bg-background border-r border-primary/20 text-foreground flex flex-col shadow-lg">
        <div className="p-6 text-xl font-bold border-b border-primary/30 text-primary">
          🎓 {t("schoolAdministration")}
        </div>

        <nav className="flex-1 p-4 space-y-3 text-sm">
          {getSidebarTabs(t).map((tab) => (
            <SidebarMenuItem key={tab.label} item={tab} />
          ))}
        </nav>

        <div className="p-4 border-t border-primary/30">
          <button
            onClick={changeLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-primary/10 text-primary w-full"
          >
            <Languages className="w-4 h-4" />
            <span>{t("changeLanguage")}</span>
          </button>
        </div>

        <div className="p-4 text-xs text-center border-t border-primary/30 text-muted-foreground">
          &copy; {new Date().getFullYear()} {t("schoolManagement")}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SchoolDashboardLayout;