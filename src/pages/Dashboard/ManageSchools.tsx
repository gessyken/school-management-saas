import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Swal from "sweetalert2";
import {
  Eye,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  CheckCircle,
  Pause,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ManageSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get("/schools");
      setSchools(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch schools", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const toggleAccess = async (id, status) => {
    const newStatus =
      status === "active"
        ? "suspended"
        : status === "suspended"
        ? "blocked"
        : "active";

    const confirm = await Swal.fire({
      title: `Change access status to ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.put(`/schools/${id}/access-status`, { status: newStatus });
      Swal.fire("Updated", "School access updated", "success");
      fetchSchools();
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">School Management</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-collapse rounded overflow-hidden shadow-sm">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
              <tr>
                <th className="p-3 border">School</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Subdomain</th>
                <th className="p-3 border">Plan</th>
                <th className="p-3 border">Usage</th>
                <th className="p-3 border">Billing Status</th>
                <th className="p-3 border">Access</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {schools.map((school) => (
                <tr key={school._id} className="even:bg-gray-50 text-center">
                  <td className="p-3 border text-left font-semibold">
                    {school.name}
                  </td>
                  <td className="p-3 border">{school.email}</td>
                  <td className="p-3 border">{school.phone || "—"}</td>
                  <td className="p-3 border text-xs text-gray-600">
                    {school.subdomain || "—"}
                  </td>
                  <td className="p-3 border font-medium text-blue-600">
                    {school.plan}
                  </td>
                  <td className="p-3 border text-left text-xs space-y-1">
                    <div>Students: {school.usage?.studentsCount || 0}</div>
                    <div>Staff: {school.usage?.staffCount || 0}</div>
                    <div>Classes: {school.usage?.classCount || 0}</div>
                  </td>
                  <td className="p-3 border">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        school.billing?.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {school.billing?.status}
                    </span>
                  </td>
                  <td className="p-3 border">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        school.accessStatus === "active"
                          ? "bg-green-100 text-green-800"
                          : school.accessStatus === "suspended"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {school.accessStatus}
                    </span>
                  </td>
                  <td className="p-3 border">
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        title="View School"
                        onClick={() => navigate(`/admin-dashboard/manage-schools/${school._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        title="Toggle Access"
                        onClick={() =>
                          toggleAccess(school._id, school.accessStatus)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        {school.accessStatus === "active" ? (
                          <Pause className="h-4 w-4" />
                        ) : school.accessStatus === "suspended" ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {schools.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center text-gray-500 py-8 text-sm"
                  >
                    No schools found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageSchools;
