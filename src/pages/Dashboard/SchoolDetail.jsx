import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import { User } from "lucide-react";
import { studentService } from "@/lib/services/studentService";

const SchoolDetail = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const schoolRes = await api.get(`/schools/${id}`);
      setSchool(schoolRes.data);
      
        const userRes = await api.get(`/students/schools/${id}`); // Assuming this returns all users
        console.log(userRes?.data?.students)
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

  if (loading) return <p className="p-6">Loading...</p>;
  if (!school) return <p className="p-6 text-red-500">School not found.</p>;

  return (
    <div className="p-6">
      {/* School Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{school.name}</h2>
        <p className="text-sm text-gray-500">ID: {school._id}</p>
      </div>

      {/* School Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {school.email}
          </p>
          <p>
            <span className="font-semibold">Phone:</span>{" "}
            {school.phone || "—"}
          </p>
          <p>
            <span className="font-semibold">Address:</span>{" "}
            {school.address || "—"}
          </p>
          <p>
            <span className="font-semibold">Subdomain:</span>{" "}
            <span className="text-blue-700">{school.subdomain || "—"}</span>
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Plan:</span>{" "}
            <span className="text-indigo-700">{school.plan}</span>
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                school.accessStatus === "active"
                  ? "bg-green-100 text-green-800"
                  : school.accessStatus === "suspended"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {school.accessStatus}
            </span>
          </p>
          <p>
            <span className="font-semibold">Students:</span>{" "}
            {school.usage?.studentsCount || 0}
          </p>
          <p>
            <span className="font-semibold">Staff:</span>{" "}
            {school.usage?.staffCount || 0}
          </p>
          <p>
            <span className="font-semibold">Classes:</span>{" "}
            {school.usage?.classCount || 0}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Students</h3>
        <span className="text-sm text-gray-600">
          Total:{" "}
          <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
            {students.length}
          </span>
        </span>
      </div>

      <div className="border rounded shadow-sm overflow-x-auto">
        {students.length === 0 ? (
          <p className="p-4 text-gray-500">No students found.</p>
        ) : (
          <table className="min-w-full table-auto text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
              <tr>
                <th className="p-3 border">Matricule</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s._id}
                  className="even:bg-gray-50 text-center text-sm"
                >
                  <td className="p-3 border text-left">{s.matricule}</td>
                  <td className="p-3 border font-medium text-left">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="p-3 border text-left">{s.email}</td>
                  <td className="p-3 border text-left">{s.phoneNumber || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SchoolDetail;
