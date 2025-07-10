import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Helper to convert month number to name
const monthName = (month: number) =>
  new Date(2000, month - 1, 1).toLocaleString("default", { month: "short" });

const prepareChartData = (data: any[]) =>
  data.map((item) => ({
    month: monthName(item._id),
    value: item.totalRevenue || item.schools,
  }));

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Erreur de chargement des stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Chargement des statistiques...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-skyblue">
        Tableau de bord administrateur
      </h2>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[
          { label: "Écoles", value: stats.totalSchools },
          { label: "Utilisateurs", value: stats.totalUsers },
          { label: "Étudiants", value: stats.totalStudents },
          { label: "Factures", value: stats.totalInvoices },
          { label: "Factures payées", value: stats.paidInvoices },
          { label: "Factures impayées", value: stats.unpaidInvoices },
          { label: "Écoles en retard", value: stats.overdueSchools },
          { label: "Écoles bloquées", value: stats.blockedSchools },
          { label: "Matières", value: stats.totalSubjects },
          { label: "Classes", value: stats.totalClasses },
          {
            label: "Années scolaires actives",
            value: stats.currentAcademicYears,
          },
        ].map((item, i) => (
          <Card key={i} className="shadow hover:shadow-lg transition">
            <CardHeader className="text-gray-600 text-sm">
              {item.label}
            </CardHeader>
            <CardContent className="text-3xl font-bold text-skyblue">
              {item.value}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* 📊 Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="text-sm font-semibold">
            Revenus mensuels
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareChartData(stats.charts.revenueByMonth)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* School Growth */}
        <Card>
          <CardHeader className="text-sm font-semibold">
            Nouvelles écoles / mois
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData(stats.charts.schoolsByMonth)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
