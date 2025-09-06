import React from 'react';
import { Users, BookOpen, TrendingUp, DollarSign, AlertTriangle, Calendar, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
  const navigate = useNavigate();
  const { currentSchool, user } = useAuth();
  
  // Données réelles (vides au début)
  const performanceData: any[] = [];
  const classesData: any[] = [];
  const financesData: any[] = [];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {currentSchool ? `${currentSchool.name}` : 'Tableau de bord'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {currentSchool 
              ? `Gestion des élèves de ${currentSchool.name}` 
              : 'Vue d\'ensemble des performances de votre école'
            }
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Année académique 2023-2024</span>
          </div>
          {currentSchool && (
            <div className="text-sm text-muted-foreground">
              Directeur: {user?.firstName} {user?.lastName}
            </div>
          )}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Élèves inscrits"
          value="0"
          subtitle="Total cette année"
          icon={Users}
          variant="primary"
          trend={{ value: 12, label: "vs l'année dernière" }}
        />
        
        <StatCard
          title="Classes actives"
          value="0"
          subtitle="Toutes sections"
          icon={BookOpen}
          variant="secondary"
          trend={{ value: 8, label: "nouvelles classes" }}
        />
        
        <StatCard
          title="Moyenne générale"
          value="0"
          subtitle="Sur 20 points"
          icon={TrendingUp}
          variant="success"
          trend={{ value: 5, label: "d'amélioration" }}
        />
        
        <StatCard
          title="Élèves à risque"
          value="0"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/students')}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Users className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Ajouter un élève</h3>
              <p className="text-sm text-muted-foreground">Inscrire un nouvel élève</p>
            </button>
            
            <button 
              onClick={() => navigate('/classes')}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <BookOpen className="w-8 h-8 text-secondary mb-2" />
              <h3 className="font-semibold">Créer une classe</h3>
              <p className="text-sm text-muted-foreground">Nouvelle classe ou section</p>
            </button>
            
            <button 
              onClick={() => navigate('/finances')}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <DollarSign className="w-8 h-8 text-success mb-2" />
              <h3 className="font-semibold">Enregistrer un paiement</h3>
              <p className="text-sm text-muted-foreground">Saisir un nouveau paiement</p>
            </button>

            <button 
              onClick={() => navigate('/school-settings')}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Settings className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold">Paramètres de l'école</h3>
              <p className="text-sm text-muted-foreground">Modifier les infos de l'école</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;