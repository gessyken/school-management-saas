import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTontines: 0,
    activeTontines: 0,
    totalContributions: 0,
    totalBalance: 0,
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("tonti_token");

      const [usersRes, tontinesRes, contribRes, balanceRes] = await Promise.all([
        axios.get("http://localhost:5000/api/stats/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/stats/tontines", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/stats/contributions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/stats/balance", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats({
        totalUsers: usersRes.data.totalUsers || 0,
        totalTontines: tontinesRes.data.totalTontines || 0,
        activeTontines: tontinesRes.data.activeTontines || 0,
        totalContributions: contribRes.data.totalContributions || 0,
        totalBalance: balanceRes.data.totalBalance || 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format number with thousand separators and FCFA suffix
  const formatXAF = (amount) => {
    return amount.toLocaleString("fr-FR") + " FCFA";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-800">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <StatCard title="Total Users" value={stats.totalUsers} color="bg-gradient-to-r from-blue-500 to-blue-700" icon="users" />
        <StatCard title="Total Tontines" value={stats.totalTontines} color="bg-gradient-to-r from-green-500 to-green-700" icon="coins" />
        <StatCard title="Active Tontines" value={stats.activeTontines} color="bg-gradient-to-r from-yellow-400 to-yellow-600" icon="check-circle" />
        <StatCard title="Total Contributions" value={stats.totalContributions} color="bg-gradient-to-r from-purple-500 to-purple-700" icon="hand-holding-usd" />
        <StatCard title="Total Balance (XAF)" value={formatXAF(stats.totalBalance)} color="bg-gradient-to-r from-red-500 to-red-700" icon="cash" />
      </div>
    </div>
  );
};

const icons = {
  users: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 opacity-70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m1-4a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  ),
  coins: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 opacity-70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4-3.134-4-7-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6" />
    </svg>
  ),
  "check-circle": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 opacity-70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 20a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  ),
  "hand-holding-usd": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 opacity-70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4-3.134-4-7-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6" />
    </svg>
  ),
  cash: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 opacity-70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 17h16M4 7v10a1 1 0 001 1h14a1 1 0 001-1V7" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

const StatCard = ({ title, value, color, icon }) => {
  return (
    <div
      className={`${color} rounded-xl shadow-lg p-6 inline-flex items-center space-x-6 max-w-max`}
      style={{ minWidth: "fit-content" }}
    >
      <div className="p-3 bg-white bg-opacity-20 rounded-full">{icons[icon]}</div>
      <div>
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <p className="text-white mt-2 text-4xl font-extrabold tracking-tight">{value}</p>
      </div>
    </div>
  );
};


export default Dashboard;
