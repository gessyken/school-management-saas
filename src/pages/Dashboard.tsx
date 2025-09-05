import React from 'react';
import { Users, BookOpen, TrendingUp, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  // Données de démonstration
  const performanceData = [
    { name: 'Sep', moyenne: 12.5, presence: 85 },
    { name: 'Oct', moyenne: 13.2, presence: 88 },
    { name: 'Nov', moyenne: 14.1, presence: 92 },
    { name: 'Dec', moyenne: 13.8, presence: 89 },
    { name: 'Jan', moyenne: 14.5, presence: 91 },
    { name: 'Fev', moyenne: 15.2, presence: 94 },
  ];

  const classesData = [
    { name: '6ème A', effectif: 28, moyenne: 14.2 },
    { name: '6ème B', effectif: 25, moyenne: 13.8 },
    { name: '5ème A', effectif: 30, moyenne: 15.1 },
    { name: '5ème B', effectif: 27, moyenne: 14.6 },
    { name: '4ème A', effectif: 24, moyenne: 13.9 },
  ];

  const financesData = [
    { name: 'Payé', value: 75, color: '#28A745' },
    { name: 'En attente', value: 20, color: '#FD7E14' },
    { name: 'En retard', value: 5, color: '#DC3545' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble des performances de votre école
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Année académique 2023-2024</span>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Étudiants inscrits"
          value="1,247"
          subtitle="Total cette année"
          icon={Users}
          variant="primary"
          trend={{ value: 12, label: "vs l'année dernière" }}
        />
        
        <StatCard
          title="Classes actives"
          value="42"
          subtitle="Toutes sections"
          icon={BookOpen}
          variant="secondary"
          trend={{ value: 8, label: "nouvelles classes" }}
        />
        
        <StatCard
          title="Moyenne générale"
          value="14.2"
          subtitle="Sur 20 points"
          icon={TrendingUp}
          variant="success"
          trend={{ value: 5, label: "d'amélioration" }}
        />
        
        <StatCard
          title="Étudiants à risque"
          value="23"
          subtitle="Moyenne < 10"
          icon={AlertTriangle}
          variant="warning"
          trend={{ value: -15, label: "en amélioration" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance académique */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Performance académique</CardTitle>
            <CardDescription>
              Évolution des moyennes et de la présence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="moyenne" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="presence" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--secondary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des paiements */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>État des paiements</CardTitle>
            <CardDescription>
              Répartition des frais de scolarité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value}%)`}
                >
                  {financesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {financesData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance par classe */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Performance par classe</CardTitle>
          <CardDescription>
            Comparaison des effectifs et des moyennes par classe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classesData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="effectif" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="moyenne" 
                fill="hsl(var(--secondary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accès rapide aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
              <Users className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Ajouter un étudiant</h3>
              <p className="text-sm text-muted-foreground">Inscrire un nouvel élève</p>
            </button>
            
            <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
              <BookOpen className="w-8 h-8 text-secondary mb-2" />
              <h3 className="font-semibold">Créer une classe</h3>
              <p className="text-sm text-muted-foreground">Nouvelle classe ou section</p>
            </button>
            
            <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
              <DollarSign className="w-8 h-8 text-success mb-2" />
              <h3 className="font-semibold">Enregistrer un paiement</h3>
              <p className="text-sm text-muted-foreground">Saisir un nouveau paiement</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;