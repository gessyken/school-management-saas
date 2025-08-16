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
import { useTranslation } from "react-i18next";

const ManageSchools = () => {
  const { t } = useTranslation();

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get("/schools");
      setSchools(res.data || []);
    } catch (err) {
      Swal.fire(
        t('admin.manage_schools.error.title'),
        t('admin.manage_schools.error.fetch_failed'),
        "error"
      );
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
      title: t('admin.manage_schools.confirm.title', { status: t(`admin.manage_schools.status.${newStatus}`) }),
      text: t('admin.manage_schools.confirm.text'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t('admin.manage_schools.confirm.confirm_button'),
      cancelButtonText: t('admin.manage_schools.confirm.cancel_button'),
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.put(`/schools/${id}/access-status`, { status: newStatus });
      Swal.fire(
        t('admin.manage_schools.success.title'),
        t('admin.manage_schools.success.status_updated'),
        "success"
      );
      fetchSchools();
    } catch (err) {
      Swal.fire(
        t('admin.manage_schools.error.title'),
        t('admin.manage_schools.error.update_failed'),
        "error"
      );
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {t("admin.manage_schools.title")}
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "school",
                    "email",
                    "phone",
                    "subdomain",
                    "plan",
                    "usage",
                    "billingStatus",
                    "access",
                    "actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t(`admin.manage_schools.headers.${header}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schools.map((school) => (
                  <tr key={school._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {school.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {school.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {school.phone || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                      {school.subdomain || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                      {t(`admin.manage_schools.plans.${school.plan?.toLowerCase() || "free"}`)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>
                          {t("admin.manage_schools.usage.students")}:{" "}
                          {school.usage?.studentsCount || 0}
                        </div>
                        <div>
                          {t("admin.manage_schools.usage.staff")}:{" "}
                          {school.usage?.staffCount || 0}
                        </div>
                        <div>
                          {t("admin.manage_schools.usage.classes")}:{" "}
                          {school.usage?.classCount || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          school.billing?.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {t(
                          `admin.manage_schools.billingStatus.${
                            school.billing?.status || "inactive"
                          }`
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          school.accessStatus === "active"
                            ? "bg-green-100 text-green-800"
                            : school.accessStatus === "suspended"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {t(`admin.manage_schools.accessStatus.${school.accessStatus || "inactive"}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          title={t("admin.manage_schools.actions.view")}
                          onClick={() =>
                            navigate(
                              `/admin-dashboard/manage-schools/${school._id}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title={t("admin.manage_schools.actions.toggleAccess")}
                          onClick={() =>
                            toggleAccess(school._id, school.accessStatus)
                          }
                          className={`p-1 rounded ${
                            school.accessStatus === "active"
                              ? "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                              : "text-green-600 hover:text-green-900 hover:bg-green-50"
                          }`}
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
                    <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                      {t("admin.manage_schools.no_schools")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchools;