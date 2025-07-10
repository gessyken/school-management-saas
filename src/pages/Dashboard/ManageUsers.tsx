import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import api from "../../lib/api";
import { ShieldCheck, KeyRound, UserX } from "lucide-react"; // Lucide Icons
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [filters, setFilters] = useState({ school: "", status: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "male",
    roles: ["USER"],
    schoolId: "",
    schoolRoles: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get("/users/getAll");
      const schoolRes = await api.get("/schools");
      console.log("schoolRes", schoolRes.data);
      setUsers(userRes.data.users || []);
      setSchools(schoolRes.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  console.log("schools", users);
  const filteredUsers = users.filter((user) => {
    return (
      (!filters.school ||
        user.memberships?.some((m) => m.school === filters.school)) &&
      (!filters.status || user.status === filters.status) &&
      (!filters.role || user.roles?.includes(filters.role.toUpperCase()))
    );
  });

  const confirmAction = async (message, onConfirm) => {
    const res = await Swal.fire({
      title: message,
      icon: "warning",
      showCancelButton: true,
    });
    if (res.isConfirmed) await onConfirm();
  };

  const toggleUserStatus = async (id) => {
    confirmAction("Toggle user's status?", async () => {
      await api.put(`/users/${id}/toggle-status`);
      fetchData();
    });
  };

  const toggleUserRole = async (id) => {
    confirmAction("Toggle user's global role?", async () => {
      await api.put(`/users/${id}/toggle-role`);
      fetchData();
    });
  };

  const resetUserPassword = async (email) => {
    confirmAction(`Reset password for ${email}?`, async () => {
      await api.post("/users/reset-password", { email });
      Swal.fire("Success", "Password reset link sent", "success");
    });
  };

  const handleRegister = async () => {
    try {
      const payload = {
        ...newUser,
        roles: newUser.roles,
        memberships: [{ school: newUser.schoolId, roles: newUser.schoolRoles }],
      };
      await api.post("/users/register", payload);
      Swal.fire("Success", "User registered", "success");
      setShowRegisterModal(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
        gender: "male",
        roles: ["USER"],
        schoolId: "",
        schoolRoles: [],
      });
      fetchData();
    } catch {
      Swal.fire("Error", "Registration failed", "error");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowRegisterModal(true)}
        >
          Register New
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <select
          className="border p-2"
          value={filters.school}
          onChange={(e) => setFilters({ ...filters, school: e.target.value })}
        >
          <option value="">All Schools</option>
          {schools.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="border p-2"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="border p-2"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <table className="min-w-full border border-collapse rounded overflow-hidden shadow-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
          <tr>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Phone</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Global Role</th>
            <th className="p-3 border">Memberships</th>
            <th className="p-3 border text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800">
          {filteredUsers.map((u) => (
            <tr key={u._id} className="even:bg-gray-50 text-center">
              <td className="p-3 border font-medium text-left">
                {u.firstName} {u.lastName}
              </td>
              <td className="p-3 border">{u.email}</td>
              <td className="p-3 border">{u.phoneNumber || "—"}</td>
              <td className="p-3 border">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    u.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td className="p-3 border space-x-1">
                {u.roles?.map((r) => (
                  <span
                    key={r}
                    className="inline-block bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded"
                  >
                    {r}
                  </span>
                ))}
              </td>
              <td className="p-3 border text-left text-xs space-y-2">
                {u.memberships?.length > 0 ? (
                  u.memberships.map((m, i) => {
                    const school = schools.find((opt) => opt._id === m.school);
                    return (
                      <div
                        key={i}
                        className="p-2 border rounded bg-gray-50 shadow-sm text-gray-700"
                      >
                        <div className="font-semibold text-gray-800 text-sm">
                          {school?.name || "Unknown School"}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {m.roles.map((role, j) => (
                            <span
                              key={j}
                              className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <em className="text-gray-400">—</em>
                )}
              </td>

              <td className="p-3 border">
                <div className="flex justify-center items-center space-x-2">
                  {/* Toggle Status */}
                  <button
                    title="Toggle Status"
                    onClick={() => toggleUserStatus(u._id)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                  >
                    <UserX className="h-4 w-4" />
                  </button>

                  {/* Toggle Role */}
                  <button
                    title="Toggle Global Role"
                    onClick={() => toggleUserRole(u._id)}
                    className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50"
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </button>

                  {/* Reset Password */}
                  <button
                    title="Reset Password"
                    onClick={() => resetUserPassword(u.email)}
                    className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-50"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Register New User</h3>
            <input
              className="border w-full p-2 mb-2"
              placeholder="First Name"
              value={newUser.firstName}
              onChange={(e) =>
                setNewUser({ ...newUser, firstName: e.target.value })
              }
            />
            <input
              className="border w-full p-2 mb-2"
              placeholder="Last Name"
              value={newUser.lastName}
              onChange={(e) =>
                setNewUser({ ...newUser, lastName: e.target.value })
              }
            />
            <input
              className="border w-full p-2 mb-2"
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <input
              className="border w-full p-2 mb-2"
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
            <input
              className="border w-full p-2 mb-2"
              placeholder="Phone Number"
              value={newUser.phoneNumber}
              onChange={(e) =>
                setNewUser({ ...newUser, phoneNumber: e.target.value })
              }
            />
            <select
              className="border w-full p-2 mb-2"
              value={newUser.gender}
              onChange={(e) =>
                setNewUser({ ...newUser, gender: e.target.value })
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select
              className="border w-full p-2 mb-2"
              value={newUser.roles[0]}
              onChange={(e) =>
                setNewUser({ ...newUser, roles: [e.target.value] })
              }
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select
              className="border w-full p-2 mb-2"
              value={newUser.schoolId}
              onChange={(e) =>
                setNewUser({ ...newUser, schoolId: e.target.value })
              }
            >
              <option value="">Select School</option>
              {schools.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              className="border w-full p-2 mb-4"
              multiple
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  schoolRoles: Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  ),
                })
              }
            >
              <option value="DIRECTOR">Director</option>
              <option value="SECRETARY">Secretary</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">School Admin</option>
            </select>
            <div className="flex justify-between">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleRegister}
              >
                Register
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
