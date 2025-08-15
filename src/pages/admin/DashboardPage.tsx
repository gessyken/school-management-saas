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
import { useTranslation } from "react-i18next";

// Helper to convert month number to name
const monthName = (month: number) =>
  new Date(2000, month - 1, 1).toLocaleString("default", { month: "short" });

const prepareChartData = (data: any[]) =>
  data.map((item) => ({
    month: monthName(item._id),
    value: item.totalRevenue || item.schools,
  }));

const AdminDashboard = () => {
  const { t } = useTranslation();
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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-skyblue">
        {t("adminDashboard.title")}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="animate-spin w-6 h-6 mr-2" />
          {t("common.loading")}
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              { key: "schools", value: stats.totalSchools },
              { key: "users", value: stats.totalUsers },
              { key: "students", value: stats.totalStudents },
              { key: "invoices", value: stats.totalInvoices },
              { key: "paidInvoices", value: stats.paidInvoices },
              { key: "unpaidInvoices", value: stats.unpaidInvoices },
              { key: "overdueSchools", value: stats.overdueSchools },
              { key: "blockedSchools", value: stats.blockedSchools },
              { key: "subjects", value: stats.totalSubjects },
              { key: "classes", value: stats.totalClasses },
              { key: "activeAcademicYears", value: stats.currentAcademicYears },
            ].map((item, i) => (
              <Card
                key={i}
                className="shadow hover:shadow-lg transition hover:bg-gray-50"
              >
                <CardHeader className="text-gray-600 text-sm">
                  {t(`adminDashboard.stats.${item.key}`)}
                </CardHeader>
                <CardContent className="text-3xl font-bold text-skyblue">
                  {item.value}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="text-sm font-semibold">
                {t("adminDashboard.charts.monthlyRevenue")}
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={prepareChartData(stats.charts.revenueByMonth)}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="text-sm font-semibold">
                {t("adminDashboard.charts.newSchools")}
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={prepareChartData(stats.charts.schoolsByMonth)}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
