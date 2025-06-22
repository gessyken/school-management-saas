// SchoolDashboardLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import Header from "@/components/header/Header";

const SchoolDashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-[250px] bg-[#1e293b] text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          🎓 School Admin
        </div>
        <nav className="flex-1 p-4 space-y-3 text-sm">
          <NavLink
            to="/school-dashboard/overview"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition ${
                isActive ? "bg-white text-[#1e293b]" : "hover:bg-[#334155]"
              }`
            }
          >
            Overview
          </NavLink>

          <NavLink
            to="/school-dashboard/edit"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition ${
                isActive ? "bg-white text-[#1e293b]" : "hover:bg-[#334155]"
              }`
            }
          >
            ✏️ Edit School
          </NavLink>

          <NavLink
            to="/school-dashboard/join-requests"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition ${
                isActive ? "bg-white text-[#1e293b]" : "hover:bg-[#334155]"
              }`
            }
          >
            📬 Join Requests
          </NavLink>

          <NavLink
            to="/school-dashboard/members"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition ${
                isActive ? "bg-white text-[#1e293b]" : "hover:bg-[#334155]"
              }`
            }
          >
            👥 Members
          </NavLink>

          <NavLink
            to="/school-dashboard/billing"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition ${
                isActive ? "bg-white text-[#1e293b]" : "hover:bg-[#334155]"
              }`
            }
          >
            💳 Billing
          </NavLink>
        </nav>

        <div className="p-4 text-xs text-center border-t border-gray-700">
          &copy; 2025  School Management
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
