import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import AdminSchoolBillingPage from "./AdminSchoolBillingPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { CreditCard, Loader2, User } from "lucide-react";

const SchoolDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [school, setSchool] = useState<any>(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const schoolRes = await api.get(`/schools/${id}`);
      setSchool(schoolRes.data);

      const userRes = await api.get(`/students/schools/${id}`);
      setStudents(userRes?.data?.students || []);
    } catch (err) {
      console.error("Failed to load school detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-6 text-gray-600 dark:text-gray-300">
        <Loader2 className="animate-spin mr-2 h-5 w-5 text-blue-500" />
        {t("schoolInterface.loading")}
      </div>
    );

  if (!school)
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-md border border-red-200 dark:bg-red-900 dark:text-red-300">
        {t("schoolInterface.notFound")}
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* School Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{school.name}</h2>
        <p className="text-sm text-gray-500">
          {t("school.idLabel")}: {school._id}
        </p>
      </div>

      {/* School Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-3">
          {["email", "phone", "address", "subdomain"].map((field) => (
            <div key={field} className="flex">
              <span className="font-medium text-gray-700 w-28">
                {t(`school.info.${field}`)}:
              </span>
              <span
                className={`${field === "subdomain" ? "text-blue-600" : ""}`}
              >
                {school[field] || <span className="text-gray-400">—</span>}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="flex">
            <span className="font-medium text-gray-700 w-28">
              {t("school.info.plan")}:
            </span>
            <span className="text-indigo-600">
              {t(`plans.${school.plan?.toLowerCase() || "free"}`)}
            </span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-700 w-28">
              {t("school.info.status")}:
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                school.accessStatus === "active"
                  ? "bg-green-100 text-green-800"
                  : school.accessStatus === "suspended"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {t(`status.${school.accessStatus}`)}
            </span>
          </div>
          {["students", "staff", "classes"].map((field) => (
            <div key={field} className="flex">
              <span className="font-medium text-gray-700 w-28">
                {t(`school.usage.${field}`)}:
              </span>
              <span>{school.usage?.[`${field}Count`] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="mb-6 bg-gray-100">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("tabs.students")}
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t("tabs.billing")}
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {t("tabs.students")}
            </h3>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              {t("common.total")}:
              <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full">
                {students.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {students.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t("students.empty")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["matricule", "name", "email", "phone"].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {t(`students.headers.${header}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {s.matricule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {s.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {s.phoneNumber || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <AdminSchoolBillingPage schoolId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolDetail;
