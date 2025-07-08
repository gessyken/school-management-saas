import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("tonti_token");
    if (!token) {
      // navigate("/login");
      // return;
    }

    const storedUser = localStorage.getItem("tonti_user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    } else {
      fetchUserInfo(token);
    }

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Close dropdown on ESC key
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/user/getUserDetail", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        localStorage.setItem("tonti_user", JSON.stringify(data));
      } else {
        throw new Error("Failed to fetch user info");
      }
    } catch (error) {
      console.error(error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("tonti_token");
    localStorage.removeItem("tonti_user");
    navigate("/login");
  };

  // Navigation helpers for dropdown links
  const goToProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const goToSettings = () => {
    setMenuOpen(false);
    navigate("/settings");
  };

  const goToChangePassword = () => {
    setMenuOpen(false);
    navigate("/change-password");
  };

  return (
    <header className="h-[60px] bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-2xl font-semibold text-gray-800 select-none">Admin Dashboard</h1>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="User menu"
          type="button"
        >
          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg uppercase select-none">
            {user && user.name ? user.name.charAt(0) : "U"}
          </div>
          {/* Username */}
          <span className="text-gray-700 font-medium hidden sm:inline-block select-none">
            {user ? user.name : "Loading..."}
          </span>
          {/* Dropdown Icon */}
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
              menuOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu"
          >
            <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 select-none">
              Signed in as <br />
              <span className="font-semibold text-gray-900">{user ? user.email : "..."}</span>
            </div>

            <button
              onClick={goToProfile}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 transition-colors"
              role="menuitem"
              type="button"
            >
              Profile
            </button>
            <button
              onClick={goToSettings}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 transition-colors"
              role="menuitem"
              type="button"
            >
              Settings
            </button>
            <button
              onClick={goToChangePassword}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 transition-colors"
              role="menuitem"
              type="button"
            >
              Change Password
            </button>

            <div className="border-t border-gray-100" />

            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors"
              role="menuitem"
              type="button"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
