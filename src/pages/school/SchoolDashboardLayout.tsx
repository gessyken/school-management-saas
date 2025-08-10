import React, { useState } from "react";
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
    label: "Vue d'ensemble",
    path: "/school-dashboard",
    icon: LayoutDashboard, // More intuitive for dashboard
  },
  {
    label: "Académique",
    children: [
      {
        label: "Classes",
        path: "/school-dashboard/academic/classes",
        icon: School,
      },
      {
        label: "Matières",
        path: "/school-dashboard/academic/subjects",
        icon: BookMarked,
      },
      {
        label: "Résultats",
        path: "/school-dashboard/academic/results",
        icon: ScrollText, // represents a paper or result
      },
      {
        label: "Élèves",
        path: "/school-dashboard/academic/students",
        icon: Users,
      },
      {
        label: "Liste des classes",
        path: "/school-dashboard/academic/classes-list",
        icon: ListOrdered,
      },
      {
        label: "Paramètres",
        path: "/school-dashboard/academic/settings",
        icon: Settings,
      },
      {
        label: "Paiements",
        path: "/school-dashboard/academic/payments",
        icon: CreditCard,
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
    label: "Paramètres",
    children: [
      {
        label: "Modifier l'école",
        path: "/school-dashboard/edit",
        icon: Building2,
      },
      {
        label: "Demandes d'adhésion",
        path: "/school-dashboard/join-requests",
        icon: UserCheck,
      },
      {
        label: "Membres",
        path: "/school-dashboard/members",
        icon: UserCog,
      },
      {
        label: "Facturation",
        path: "/school-dashboard/billing",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Journaux",
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
  return (
    <div className="flex h-screen bg-muted text-foreground">
      {/* Sidebar */}
      <aside className="w-[250px] bg-background border-r border-primary/20 text-foreground flex flex-col shadow-lg">
        <div className="p-6 text-xl font-bold border-b border-primary/30 text-primary">
           🎓 Administration Scolaire
         </div>

        <nav className="flex-1 p-4 space-y-3 text-sm">
          {sidebarTabs.map((tab) => (
            <SidebarMenuItem key={tab.label} item={tab} />
          ))}
        </nav>

        <div className="p-4 text-xs text-center border-t border-primary/30 text-muted-foreground">
           &copy; 2025 Gestion Scolaire
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
