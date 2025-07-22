import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import api from "../../lib/api";
import { ShieldCheck, KeyRound, UserX } from "lucide-react"; // Lucide Icons
import { useTranslation } from "react-i18next";
const ManageUsers = () => {
  const { t } = useTranslation();
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("userManagement.title")}
        </h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
          onClick={() => setShowRegisterModal(true)}
        >
          {t("userManagement.registerNew")}
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          className="border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.school}
          onChange={(e) => setFilters({ ...filters, school: e.target.value })}
        >
          <option value="">{t("filters.allSchools")}</option>
          {schools.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">{t("filters.allStatus")}</option>
          <option value="active">{t("status.active")}</option>
          <option value="inactive">{t("status.inactive")}</option>
        </select>
        <select
          className="border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">{t("filters.allRoles")}</option>
          <option value="USER">{t("roles.user")}</option>
          <option value="ADMIN">{t("roles.admin")}</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "name",
                "email",
                "phone",
                "status",
                "globalRole",
                "memberships",
                "actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t(`userManagement.headers.${header}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {u.phoneNumber || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t(`status.${u.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-1">
                  {u.roles?.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {t(`roles.${r.toLowerCase()}`)}
                    </span>
                  ))}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.memberships?.length > 0 ? (
                    <div className="space-y-2">
                      {u.memberships.map((m, i) => {
                        const school = schools.find(
                          (opt) => opt._id === m.school
                        );
                        return (
                          <div
                            key={i}
                            className="p-2 border border-gray-200 rounded-md bg-gray-50"
                          >
                            <div className="font-medium text-gray-800">
                              {school?.name ||
                                t("userManagement.unknownSchool")}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {m.roles.map((role, j) => (
                                <span
                                  key={j}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                >
                                  {t(`schoolRoles.${role.toLowerCase()}`)}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">
                      {t("common.none")}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      title={t("actions.toggleStatus")}
                      onClick={() => toggleUserStatus(u._id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                    <button
                      title={t("actions.toggleRole")}
                      onClick={() => toggleUserRole(u._id)}
                      className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                    <button
                      title={t("actions.resetPassword")}
                      onClick={() => resetUserPassword(u.email)}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t("userManagement.registerTitle")}
              </h3>
              <div className="space-y-4">
                {[
                  "firstName",
                  "lastName",
                  "email",
                  "password",
                  "phoneNumber",
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t(`userForm.${field}`)}
                    </label>
                    <input
                      type={
                        field === "password"
                          ? "password"
                          : field === "email"
                          ? "email"
                          : "text"
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newUser[field]}
                      onChange={(e) =>
                        setNewUser({ ...newUser, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("userForm.gender")}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newUser.gender}
                    onChange={(e) =>
                      setNewUser({ ...newUser, gender: e.target.value })
                    }
                  >
                    {["male", "female", "other"].map((gender) => (
                      <option key={gender} value={gender}>
                        {t(`genders.${gender}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("userForm.role")}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newUser.roles[0]}
                    onChange={(e) =>
                      setNewUser({ ...newUser, roles: [e.target.value] })
                    }
                  >
                    {["USER", "ADMIN"].map((role) => (
                      <option key={role} value={role}>
                        {t(`roles.${role.toLowerCase()}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("userForm.school")}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newUser.schoolId}
                    onChange={(e) =>
                      setNewUser({ ...newUser, schoolId: e.target.value })
                    }
                  >
                    <option value="">{t("userForm.selectSchool")}</option>
                    {schools.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("userForm.schoolRoles")}
                  </label>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-auto"
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
                    {["DIRECTOR", "SECRETARY", "TEACHER", "ADMIN"].map(
                      (role) => (
                        <option key={role} value={role}>
                          {t(`schoolRoles.${role.toLowerCase()}`)}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowRegisterModal(false)}
                >
                  {t("common.cancel")}
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={handleRegister}
                >
                  {t("common.register")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
