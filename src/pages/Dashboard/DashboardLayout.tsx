import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, School, Users, BarChart3, CreditCard, FileClock, Settings } from "lucide-react";
import Header from "@/components/header/Header";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin-dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Schools",
    path: "/admin-dashboard/manage-schools",
    icon: <School className="w-5 h-5" />,
  },
  {
    label: "Users",
    path: "/admin-dashboard/manage-users",
    icon: <Users className="w-5 h-5" />,
  },
  // {
  //   label: "Statistics",
  //   path: "/admin-dashboard/statistics",
  //   icon: <BarChart3 className="w-5 h-5" />,
  // },
  // {
  //   label: "Billing",
  //   path: "/admin-dashboard/billing",
  //   icon: <CreditCard className="w-5 h-5" />,
  // },
  {
    label: "Logs",
    path: "/admin-dashboard/logs",
    icon: <FileClock className="w-5 h-5" />,
  },
  {
    label: "Settings",
    path: "/admin-dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

const AdminDashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0f172f] text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-white text-[#0f172f] font-semibold"
                    : "hover:bg-[#1a2a4f]"
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-xs text-center border-t border-gray-700">
          &copy; {new Date().getFullYear()} School SaaS Admin
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
