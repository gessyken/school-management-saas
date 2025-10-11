import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line
} from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  CreditCard,
  Calendar,
  School,
  BookOpen
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function FeesStatistics() {
  const context = useOutletContext<{
    academicYear: string;
    educationSystem: string;
    level: string;
    class: string;
    academicStudents: any[];
    academicYearObj: any;
    educationSystemObj: any;
    levelObj: any;
    classObj: any;
  }>();

  const {
    academicYear,
    educationSystem,
    level,
    class: classId,
    academicStudents = [],
    academicYearObj,
    educationSystemObj,
    levelObj,
    classObj,
  } = context;

  // Filter students based on current context
  const filteredStudents = useMemo(() => {
    return academicStudents
      .filter(student =>
        (academicYear ? student.year === academicYear : true) &&
        (educationSystem ? student.classes?.educationSystem === educationSystem : true) &&
        (level ? student.classes?.level === level : true) &&
        (classId ? student.classes?._id === classId : true)
      )
      .map(student => {
        const totalFeesPaid = student.fees?.filter(f=>f.type==='Tuition')?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const amountToPay = student.classes?.amountFee || 0;
        const remaining = amountToPay - totalFeesPaid;

        return {
          ...student,
          totalFeesPaid,
          amountToPay,
          remaining,
          isPaid: remaining <= 0,
          paymentStatus: remaining <= 0 ? 'paid' : remaining < amountToPay ? 'partial' : 'pending'
        };
      });
  }, [academicStudents, academicYear, educationSystem, level, classId]);

  // Calculate overall statistics
  const statistics = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const totalAmountToPay = filteredStudents.reduce((sum, student) => sum + student.amountToPay, 0);
    const totalPaid = filteredStudents.reduce((sum, student) => sum + student.totalFeesPaid, 0);
    const totalRemaining = filteredStudents.reduce((sum, student) => sum + student.remaining, 0);
    const paidStudents = filteredStudents.filter(student => student.isPaid).length;
    const pendingStudents = filteredStudents.filter(student => !student.isPaid && student.totalFeesPaid === 0).length;
    const partialStudents = filteredStudents.filter(student => !student.isPaid && student.totalFeesPaid > 0).length;

    return {
      totalStudents,
      totalAmountToPay,
      totalPaid,
      totalRemaining,
      paidStudents,
      pendingStudents,
      partialStudents,
      collectionRate: totalAmountToPay > 0 ? (totalPaid / totalAmountToPay) * 100 : 0
    };
  }, [filteredStudents]);

  // Payment Status Distribution for Pie Chart
  const paymentStatusData = useMemo(() => [
    { name: 'Payé', value: statistics.paidStudents, color: '#10B981' },
    { name: 'Partiel', value: statistics.partialStudents, color: '#F59E0B' },
    { name: 'En attente', value: statistics.pendingStudents, color: '#EF4444' }
  ], [statistics]);

  // Payment Methods Distribution
  const paymentMethodsData = useMemo(() => {
    const methods: Record<string, number> = {};
    
    filteredStudents.forEach(student => {
      student.fees?.forEach(fee => {
        methods[fee.paymentMethod] = (methods[fee.paymentMethod] || 0) + fee.amount;
      });
    });

    return Object.entries(methods).map(([name, value]) => ({
      name: name === 'cash' ? 'Espèces' : 
            name === 'bank_transfer' ? 'Virement' :
            name === 'mobile_money' ? 'Mobile Money' :
            name === 'credit_card' ? 'Carte Crédit' :
            name === 'check' ? 'Chèque' : name,
      value
    }));
  }, [filteredStudents]);

  // Monthly Collection Trend
  const monthlyData = useMemo(() => {
    const monthly: Record<string, number> = {};
    
    filteredStudents.forEach(student => {
      student.fees?.forEach(fee => {
        if (fee.paymentDate) {
          const month = new Date(fee.paymentDate).toLocaleDateString('fr-FR', { 
            month: 'short', 
            year: 'numeric' 
          });
          monthly[month] = (monthly[month] || 0) + fee.amount;
        }
      });
    });

    return Object.entries(monthly)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [filteredStudents]);

  // Fee Type Distribution
  const feeTypeData = useMemo(() => {
    const types: Record<string, number> = {};
    
    filteredStudents.forEach(student => {
      student.fees?.forEach(fee => {
        types[fee.type] = (types[fee.type] || 0) + fee.amount;
      });
    });

    return Object.entries(types).map(([name, amount]) => ({
      name: name === 'Tuition' ? 'Scolarité' :
            name === 'Books' ? 'Livres' :
            name === 'Uniform' ? 'Uniforme' :
            name === 'Transport' ? 'Transport' :
            name === 'Other' ? 'Autre' : name,
      amount
    }));
  }, [filteredStudents]);

  // Class-wise Performance
  const classPerformanceData = useMemo(() => {
    const classData: Record<string, { total: number; paid: number; students: number }> = {};
    
    filteredStudents.forEach(student => {
      const className = student.classes?.name || 'Non assigné';
      if (!classData[className]) {
        classData[className] = { total: 0, paid: 0, students: 0 };
      }
      classData[className].total += student.amountToPay;
      classData[className].paid += student.totalFeesPaid;
      classData[className].students += 1;
    });

    return Object.entries(classData).map(([name, data]) => ({
      name,
      total: data.total,
      paid: data.paid,
      remaining: data.total - data.paid,
      collectionRate: data.total > 0 ? (data.paid / data.total) * 100 : 0,
      students: data.students
    }));
  }, [filteredStudents]);

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString()} FCFA
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render customized label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (filteredStudents.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen">
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune donnée disponible</h3>
          <p className="text-muted-foreground">
            Aucun élève trouvé pour les critères sélectionnés
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Statistiques des Frais</h1>
            <p className="text-muted-foreground mt-2">
              Analyse et visualisation des données de paiement
            </p>
          </div>
          
          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {academicYear && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {academicYear}
              </Badge>
            )}
            {educationSystem && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <School className="w-3 h-3" />
                {educationSystem}
              </Badge>
            )}
            {level && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {level}
              </Badge>
            )}
            {classId && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {classObj?.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Élèves</p>
                  <p className="text-2xl font-bold">{statistics.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Collecté</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.totalPaid.toLocaleString()} FCFA
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reste à Collecter</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {statistics.totalRemaining.toLocaleString()} FCFA
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taux de Collecte</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statistics.collectionRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Statut des Paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} élèves`, 'Nombre']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mt-4">
                {paymentStatusData.map((item, index) => (
                  <div key={index} className="text-sm">
                    <div 
                      className="w-3 h-3 rounded-full inline-block mr-1"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}: {item.value}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Collection Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendance de Collecte Mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} FCFA`, 'Montant']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      name="Montant Collecté"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Méthodes de Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} FCFA`, 'Montant']} />
                    <Legend />
                    <Bar dataKey="value" name="Montant" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Class Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance par Classe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'collectionRate') {
                        return [`${Number(value).toFixed(1)}%`, 'Taux de Collecte'];
                      }
                      return [`${Number(value).toLocaleString()} FCFA`, name];
                    }} />
                    <Legend />
                    <Bar dataKey="paid" name="Payé" fill="#00C49F" />
                    <Bar dataKey="remaining" name="Reste" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Type de Frais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feeTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {feeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} FCFA`, 'Montant']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}