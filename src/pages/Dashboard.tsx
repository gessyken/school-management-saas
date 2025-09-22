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
  console.log(user)
  
  // Données réelles (vides au début)
  const performanceData: any[] = [];
  const classesData: any[] = [];
  const financesData: any[] = [];

  // Rediriger vers la page de création d'école si aucune école n'est sélectionnée
  if (!currentSchool) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Vous n'avez pas encore d'école</h1>
          <p className="text-muted-foreground mb-6">
            Veuillez créer votre établissement scolaire en remplissant le formulaire.
          </p>
          <button
            onClick={() => navigate('/create-school')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Créer une école
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête personnalisé avec les informations de l'école */}
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
          {currentSchool && (
            <div className="mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">Système:</span> 
                <span className="capitalize">{currentSchool.system_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Adresse:</span> 
                <span>{currentSchool.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Contact:</span> 
                <span>{currentSchool.phone} | {currentSchool.email}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          {currentSchool && currentSchool.logo && (
            <div className="w-24 h-24 rounded-md overflow-hidden border border-border">
              <img 
                src={currentSchool.logo} 
                alt={`Logo ${currentSchool.name}`} 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Année académique 2023-2024</span>
          </div>
          {currentSchool && (
            <div className="text-sm text-muted-foreground">
              Directeur: {user?.firstName || user?.name}
            </div>
          )}
        </div>
      </div>

      {/* Statistiques principales personnalisées selon le type d'école */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={currentSchool?.system_type === 'anglophone' ? 'Enrolled Students' : 'Élèves inscrits'}
          value="0"
          subtitle={currentSchool?.system_type === 'anglophone' ? 'Total this year' : 'Total cette année'}
          icon={Users}
          variant="primary"
          trend={{ 
            value: 12, 
            label: currentSchool?.system_type === 'anglophone' ? 'vs last year' : "vs l'année dernière" 
          }}
        />
        
        <StatCard
          title={currentSchool?.system_type === 'anglophone' ? 'Active Classes' : 'Classes actives'}
          value="0"
          subtitle={currentSchool?.system_type === 'anglophone' ? 'All sections' : 'Toutes sections'}
          icon={BookOpen}
          variant="secondary"
          trend={{ 
            value: 8, 
            label: currentSchool?.system_type === 'anglophone' ? 'new classes' : 'nouvelles classes' 
          }}
        />
        
        <StatCard
          title={currentSchool?.system_type === 'anglophone' ? 'Overall Average' : 'Moyenne générale'}
          value="0"
          subtitle={currentSchool?.system_type === 'anglophone' ? 'Out of 100 points' : 'Sur 20 points'}
          icon={TrendingUp}
          variant="success"
          trend={{ 
            value: 5, 
            label: currentSchool?.system_type === 'anglophone' ? 'improvement' : "d'amélioration" 
          }}
        />
        
        <StatCard
          title={currentSchool?.system_type === 'anglophone' ? 'At-risk Students' : 'Élèves à risque'}
          value="0"
          subtitle={currentSchool?.system_type === 'anglophone' ? 'Average < 50%' : 'Moyenne < 10'}
          icon={AlertTriangle}
          variant="warning"
          trend={{ 
            value: -15, 
            label: currentSchool?.system_type === 'anglophone' ? 'improving' : 'en amélioration' 
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance académique */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>
              {currentSchool?.system_type === 'anglophone' ? 'Academic Performance' : 'Performance académique'}
            </CardTitle>
            <CardDescription>
              {currentSchool?.system_type === 'anglophone' 
                ? 'Evolution of averages and attendance' 
                : 'Évolution des moyennes et de la présence'
              }
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
            <CardTitle>
              {currentSchool?.system_type === 'anglophone' ? 'Payment Status' : 'État des paiements'}
            </CardTitle>
            <CardDescription>
              {currentSchool?.system_type === 'anglophone' 
                ? 'Distribution of tuition fees' 
                : 'Répartition des frais de scolarité'
              }
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
          <CardTitle>
            {currentSchool?.system_type === 'anglophone' ? 'Performance by Class' : 'Performance par classe'}
          </CardTitle>
          <CardDescription>
            {currentSchool?.system_type === 'anglophone' 
              ? 'Comparison of enrollment and averages by class' 
              : 'Comparaison des effectifs et des moyennes par classe'
            }
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
                name={currentSchool?.system_type === 'anglophone' ? 'Enrollment' : 'Effectif'}
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="moyenne" 
                name={currentSchool?.system_type === 'anglophone' ? 'Average' : 'Moyenne'}
                fill="hsl(var(--secondary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actions rapides personnalisées selon le type d'école */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accès rapide aux fonctionnalités principales
            {currentSchool && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Système {currentSchool.system_type}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/students')}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Users className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">
                {currentSchool?.system_type === 'anglophone' ? 'Add Student' : 'Ajouter un élève'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSchool?.system_type === 'anglophone' ? 'Register new student' : 'Inscrire un nouvel élève'}
              </p>
            </button>
            
            <button 
              onClick={() => navigate('/classes')}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <BookOpen className="w-8 h-8 text-secondary mb-2" />
              <h3 className="font-semibold">
                {currentSchool?.system_type === 'anglophone' ? 'Create Class' : 'Créer une classe'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSchool?.system_type === 'anglophone' ? 'New class or section' : 'Nouvelle classe ou section'}
              </p>
            </button>
            
            <button 
              onClick={() => navigate('/finances')}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <DollarSign className="w-8 h-8 text-success mb-2" />
              <h3 className="font-semibold">
                {currentSchool?.system_type === 'anglophone' ? 'Record Payment' : 'Enregistrer un paiement'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSchool?.system_type === 'anglophone' ? 'Enter new payment' : 'Saisir un nouveau paiement'}
              </p>
            </button>

            <button 
              onClick={() => navigate('/settings')}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Settings className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold">
                {currentSchool?.system_type === 'anglophone' ? 'School Settings' : 'Paramètres de l\'école'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSchool?.system_type === 'anglophone' ? 'Modify school information' : 'Modifier les infos de l\'école'}
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;