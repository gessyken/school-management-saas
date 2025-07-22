import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
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
  BookMarked,
} from "lucide-react"; // assuming you're using lucide-react
import { useTranslation } from "react-i18next";

const SidebarMenuItem = ({ item }: { item: SidebarItem }) => {
  const [open, setOpen] = useState(false);
  const isExpandable = item.children && item.children.length > 0;

  return (
    <div className="space-y-1">
      {isExpandable ? (
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-full text-left px-4 py-2 flex items-center justify-between rounded-md hover:bg-[#334155] transition"
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
              isActive ? "bg-white text-[#1e293b]" : "hover:bg-[#334155]"
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
                  isActive ? "bg-white text-[#1e293b]" : "hover:bg-[#334155]"
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
  const { t } = useTranslation();
  const sidebarTabs = [
    {
      label: t("sidebar.overview"),
      path: "/school-dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("sidebar.academic"),
      children: [
        {
          label: t("sidebar.subject"),
          path: "/school-dashboard/academic/subjects",
          icon: BookMarked,
        },
        {
          label: t("sidebar.classes"),
          path: "/school-dashboard/academic/classes",
          icon: School,
        },
        {
          label: t("sidebar.students"),
          path: "/school-dashboard/academic/students",
          icon: Users,
        },
        {
          label: t("sidebar.classesList"),
          path: "/school-dashboard/academic/classes-list",
          icon: ListOrdered,
        },
        {
          label: t("sidebar.payments"),
          path: "/school-dashboard/academic/payments",
          icon: CreditCard,
        },
        {
          label: t("sidebar.academicSettings"),
          path: "/school-dashboard/academic/settings",
          icon: Settings,
        },
        {
          label: t("sidebar.results"),
          path: "/school-dashboard/academic/results",
          icon: ScrollText,
        },
        {
          label: t("sidebar.grades"),
          path: "/school-dashboard/academic/grades",
          icon: GraduationCap,
        },
        {
          label: t("sidebar.statistics"),
          path: "/school-dashboard/academic/statistics",
          icon: BarChart3,
        },
      ],
    },
    {
      label: t("sidebar.settings"),
      children: [
        {
          label: t("sidebar.editSchool"),
          path: "/school-dashboard/edit",
          icon: Building2,
        },
        {
          label: t("sidebar.joinRequests"),
          path: "/school-dashboard/join-requests",
          icon: UserCheck,
        },
        {
          label: t("sidebar.members"),
          path: "/school-dashboard/members",
          icon: UserCog,
        },
        {
          label: t("sidebar.billing"),
          path: "/school-dashboard/billing",
          icon: CreditCard,
        },
      ],
    },
    {
      label: t("sidebar.logs"),
      path: "/school-dashboard/logs",
      icon: FileClock,
    },
  ];
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-[260px] bg-slate-900 text-white flex flex-col shadow-lg">
        <div className="p-6 text-xl font-bold border-b border-slate-800">
          🎓 {t("layout.schoolAdmin")}
        </div>

        <nav className="flex-1 p-4 space-y-2 text-sm">
          {sidebarTabs.map((tab) => (
            <SidebarMenuItem key={tab.label} item={tab} />
          ))}
        </nav>

        <div className="p-4 text-xs text-center border-t border-slate-800 text-gray-400">
          &copy; 2025 {t("layout.copyright")}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SchoolDashboardLayout;
