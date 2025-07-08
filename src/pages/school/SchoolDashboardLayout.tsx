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
  BookMarked
} from "lucide-react"; // assuming you're using lucide-react

const sidebarTabs: SidebarItem[] = [
  {
    label: "Overview",
    path: "/school-dashboard",
    icon: LayoutDashboard, // More intuitive for dashboard
  },
  {
    label: "Academic",
    children: [
      {
        label: "Subject",
        path: "/school-dashboard/academic/subjects",
        icon: BookMarked,
      },
      {
        label: "Classes",
        path: "/school-dashboard/academic/classes",
        icon: School,
      },
      {
        label: "Élèves",
        path: "/school-dashboard/academic/students",
        icon: Users,
      },
      {
        label: "Classes List",
        path: "/school-dashboard/academic/classes-list",
        icon: ListOrdered,
      },
      {
        label: "Paiements",
        path: "/school-dashboard/academic/payments",
        icon: CreditCard,
      },
      {
        label: "Settings",
        path: "/school-dashboard/academic/settings",
        icon: Settings,
      },
      {
        label: "Result",
        path: "/school-dashboard/academic/results",
        icon: ScrollText, // represents a paper or result
      },
      {
        label: "Notes",
        path: "/school-dashboard/academic/grades",
        icon: GraduationCap,
      },
      {
        label: "Statistiques",
        path: "/school-dashboard/academic/statistics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Settings",
    children: [
      {
        label: "Edit School",
        path: "/school-dashboard/edit",
        icon: Building2,
      },
      {
        label: "Join Requests",
        path: "/school-dashboard/join-requests",
        icon: UserCheck,
      },
      {
        label: "Members",
        path: "/school-dashboard/members",
        icon: UserCog,
      },
      {
        label: "Billing",
        path: "/school-dashboard/billing",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Logs",
    path: "/school-dashboard/logs",
    icon: FileClock, // log with a time symbol
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
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-[250px] bg-[#1e293b] text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          🎓 School Admin
        </div>

        <nav className="flex-1 p-4 space-y-3 text-sm">
          {sidebarTabs.map((tab) => (
            <SidebarMenuItem key={tab.label} item={tab} />
          ))}
        </nav>

        <div className="p-4 text-xs text-center border-t border-gray-700">
          &copy; 2025 School Management
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SchoolDashboardLayout;
