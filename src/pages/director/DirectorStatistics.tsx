import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download } from "lucide-react";

// Mock data for charts
const attendanceData = [
  { month: "Jan", présence: 94, absence: 6 },
  { month: "Fév", présence: 92, absence: 8 },
  { month: "Mar", présence: 93, absence: 7 },
  { month: "Avr", présence: 95, absence: 5 },
  { month: "Mai", présence: 91, absence: 9 },
  { month: "Juin", présence: 94, absence: 6 },
  { month: "Juil", présence: 97, absence: 3 },
  { month: "Août", présence: 95, absence: 5 },
  { month: "Sept", présence: 92, absence: 8 },
  { month: "Oct", présence: 93, absence: 7 },
  { month: "Nov", présence: 91, absence: 9 },
  { month: "Déc", présence: 90, absence: 10 },
];

const performanceData = [
  { class: "6ème A", moyenne: 13.5 },
  { class: "6ème B", moyenne: 12.8 },
  { class: "5ème A", moyenne: 14.2 },
  { class: "5ème B", moyenne: 13.7 },
  { class: "4ème A", moyenne: 12.5 },
  { class: "4ème B", moyenne: 13.2 },
  { class: "3ème A", moyenne: 14.8 },
  { class: "3ème B", moyenne: 14.1 },
];

const paymentsData = [
  { month: "Jan", payé: 85, nonPayé: 15 },
  { month: "Fév", payé: 78, nonPayé: 22 },
  { month: "Mar", payé: 82, nonPayé: 18 },
  { month: "Avr", payé: 80, nonPayé: 20 },
  { month: "Mai", payé: 85, nonPayé: 15 },
  { month: "Juin", payé: 88, nonPayé: 12 },
];

const genderData = [
  { name: "Filles", value: 162 },
  { name: "Garçons", value: 150 },
];

const enrollmentData = [
  { year: "2019", élèves: 240 },
  { year: "2020", élèves: 258 },
  { year: "2021", élèves: 275 },
  { year: "2022", élèves: 290 },
  { year: "2023", élèves: 304 },
  { year: "2024", élèves: 312 },
];

const classDistributionData = [
  { name: "6ème", value: 86 },
  { name: "5ème", value: 80 },
  { name: "4ème", value: 78 },
  { name: "3ème", value: 68 },
];

// Custom colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const GENDER_COLORS = ["#FF6384", "#36A2EB"];

const DirectorStatistics = () => {
  const [yearFilter, setYearFilter] = useState("2024");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <div className="flex gap-3">
          <Select defaultValue={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Présences</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Moyennes par classe</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    moyenne: {
                      label: "Moyenne",
                      theme: { light: "#33C3F0", dark: "#1E90FF" },
                    },
                  }}
                  className="h-80 w-full"
                >
                  <BarChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip
                      content={(props) => (
                        <ChartTooltipContent {...(props as any)} />
                      )}
                    />
                    <Legend />
                    <Bar dataKey="moyenne" fill="#33C3F0" name="Moyenne" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution des effectifs</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    élèves: {
                      label: "Élèves",
                      theme: { light: "#33C3F0", dark: "#1E90FF" },
                    },
                  }}
                  className="h-80 w-full"
                >
                  <LineChart
                    data={enrollmentData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      content={(props) => (
                        <ChartTooltipContent {...(props as any)} />
                      )}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="élèves"
                      stroke="#33C3F0"
                      name="Élèves"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par niveau</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-80 w-full max-w-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={classDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {classDistributionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} élèves`, "Effectif"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par genre</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-80 w-full max-w-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} élèves`, "Effectif"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Taux de présence mensuel</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  présence: {
                    label: "Présence",
                    theme: { light: "#33C3F0", dark: "#1E90FF" },
                  },
                  absence: {
                    label: "Absence",
                    theme: { light: "#FF6384", dark: "#FF0000" },
                  },
                }}
                className="h-80 w-full"
              >
                <LineChart
                  data={attendanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={(props) => (
                      <ChartTooltipContent {...(props as any)} />
                    )}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="présence"
                    stroke="#33C3F0"
                    name="Présence (%)"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="absence"
                    stroke="#FF6384"
                    name="Absence (%)"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Taux de paiement mensuel</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  payé: {
                    label: "Payé",
                    theme: { light: "#33C3F0", dark: "#1E90FF" },
                  },
                  nonPayé: {
                    label: "Non payé",
                    theme: { light: "#FF6384", dark: "#1E90FF" },
                  },
                }}
                className="h-80 w-full"
              >
                <BarChart
                  data={paymentsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={(props) => (
                      <ChartTooltipContent {...(props as any)} />
                    )}
                  />
                  <Legend />
                  <Bar
                    dataKey="payé"
                    stackId="a"
                    fill="#33C3F0"
                    name="Payé (%)"
                  />
                  <Bar
                    dataKey="nonPayé"
                    stackId="a"
                    fill="#FF6384"
                    name="Non payé (%)"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-skyblue/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taux de recouvrement
                </CardTitle>
                <div className="text-2xl font-bold">78%</div>
              </CardHeader>
            </Card>
            <Card className="bg-skyblue/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Montant recouvré
                </CardTitle>
                <div className="text-2xl font-bold">15.6M FCFA</div>
              </CardHeader>
            </Card>
            <Card className="bg-skyblue/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Montant à recouvrer
                </CardTitle>
                <div className="text-2xl font-bold">4.4M FCFA</div>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DirectorStatistics;
