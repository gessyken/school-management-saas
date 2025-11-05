import React, { useEffect, useState } from 'react';
import { Users, BookOpen, TrendingUp, DollarSign, AlertTriangle, Calendar, Settings, Badge, Globe, MapPin, Mail, Building2, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge as BadgeUI } from '@/components/ui/badge';
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
import { baseURL } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import settingsService from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';
import { AcademicYear as AcademicYearDetail } from "@/types/settings";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentAcademicYears, setCurrentAcademicYears] = useState<AcademicYearDetail>();

  const { currentSchool, user } = useAuth();
  
  useEffect(() => {
    getCurrentAcademicYear()
  }, []);

  const getCurrentAcademicYear = async () => {
    try {
      const academicYearsData = await settingsService.getAcademicYears();
      setCurrentAcademicYears(academicYearsData.find(t => t.isCurrent));
    } catch (error) {
      console.error('Error loading Annee:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les Annee',
        variant: "destructive"
      });
    }
  };

  // Données réelles (vides au début)
  const performanceData: any[] = [];
  const classesData: any[] = [];
  const financesData: any[] = [];
  
  // Helper function for avatar initials
  const getUserInitials = (name: string) => {
    return name
      ?.split(' ')
      ?.map(part => part[0])
      ?.join('')
      ?.toUpperCase()
      ?.slice(0, 2);
  };
  
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
    <div className="p-6 space-y-6 animate-fade-in">
      {/* En-tête personnalisé avec les informations de l'école */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* School Logo */}
            {currentSchool?.logoUrl && (
              <div className="hidden sm:block flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-border shadow-lg bg-white">
                  <img
                    src={currentSchool.logoUrl.startsWith('/upload')
                      ? `${baseURL}/../document${currentSchool.logoUrl}`
                      : currentSchool.logoUrl
                    }
                    alt={`Logo ${currentSchool.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {currentSchool ? currentSchool.name : 'Tableau de bord'}
              </h1>

              <p className="text-lg text-muted-foreground mt-2">
                {currentSchool
                  ? `Gestion des élèves de ${currentSchool.name}`
                  : 'Vue d\'ensemble des performances de votre école'
                }
              </p>

              {currentSchool && (
                <div className="mt-4 space-y-2">
                  {/* School Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    {/* System Type */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border">
                      <Globe className="w-4 h-4 text-primary" />
                      <div>
                        <span className="font-medium text-muted-foreground">Système: </span>
                        <BadgeUI variant="secondary" className="capitalize">{currentSchool.system_type}</BadgeUI>
                      </div>
                    </div>

                    {/* Address */}
                    {currentSchool.address && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <span className="font-medium text-muted-foreground">Adresse: </span>
                          <span className="text-foreground line-clamp-1">{currentSchool.address}</span>
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {(currentSchool.phone || currentSchool.email) && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border">
                        <Mail className="w-4 h-4 text-primary" />
                        <div>
                          <span className="font-medium text-muted-foreground">Contact: </span>
                          <span className="text-foreground">
                            {currentSchool.phone || ''} {currentSchool.phone && currentSchool.email ? '|' : ''} {currentSchool.email || ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Meta Information */}
        <div className="flex flex-col items-end space-y-3">
          {/* Academic Year & Principal */}
          <div className="text-right space-y-3">
            {/* Academic Year */}
            <div className="flex items-center justify-end gap-2 text-sm px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">
                Année académique {currentAcademicYears?.name || '2023-2024'}
              </span>
            </div>

            {/* Principal */}
            {currentSchool?.principal && (
              <div className="flex items-center justify-end gap-2 text-sm px-3 py-1.5 bg-muted/50 rounded-lg border border-border">
                <div className="text-right">
                  <span className="text-muted-foreground">Directeur: </span>
                  <span className="font-medium text-foreground">
                    {typeof currentSchool.principal === 'object'
                      ? currentSchool.principal.fullName
                      : user?.firstName || user?.name
                    }
                  </span>
                </div>
                <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                  <AvatarImage
                    src={typeof currentSchool.principal === 'object'
                      ? currentSchool.principal.avatar
                      : user?.avatar
                    }
                  />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {typeof currentSchool.principal === 'object'
                      ? getUserInitials(currentSchool?.principal?.fullName)
                      : getUserInitials(user?.firstName || user?.name || '')
                    }
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Large Logo for Mobile */}
          {currentSchool?.logoUrl && (
            <div className="sm:hidden w-full">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border shadow-lg bg-white mx-auto">
                <img
                  src={currentSchool.logoUrl.startsWith('/upload')
                    ? `${baseURL}/../document${currentSchool.logoUrl}`
                    : currentSchool.logoUrl
                  }
                  alt={`Logo ${currentSchool.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques principales personnalisées selon le type d'école */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance académique */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
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
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-card)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moyenne" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="presence" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--secondary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-center">
                <div className="space-y-3">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-muted-foreground">
                    {currentSchool?.system_type === 'anglophone' 
                      ? 'No performance data available yet' 
                      : 'Aucune donnée de performance disponible'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Répartition des paiements */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-secondary" />
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
            {financesData.length > 0 ? (
              <>
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
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-card)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center flex-wrap gap-4 mt-4">
                  {financesData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-center">
                <div className="space-y-3">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-muted-foreground">
                    {currentSchool?.system_type === 'anglophone' 
                      ? 'No payment data available yet' 
                      : 'Aucune donnée de paiement disponible'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance par classe */}
      <Card className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
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
          {classesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-card)'
                  }}
                />
                <Bar 
                  dataKey="effectif" 
                  name={currentSchool?.system_type === 'anglophone' ? 'Enrollment' : 'Effectif'}
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="moyenne" 
                  name={currentSchool?.system_type === 'anglophone' ? 'Average' : 'Moyenne'}
                  fill="hsl(var(--secondary))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-center">
              <div className="space-y-3">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground">
                  {currentSchool?.system_type === 'anglophone' 
                    ? 'No class data available yet' 
                    : 'Aucune donnée de classe disponible'
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides personnalisées selon le type d'école */}
      <Card className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Actions rapides
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Accès rapide aux fonctionnalités principales
            {currentSchool && (
              <BadgeUI variant="secondary" className="ml-2">
                Système {currentSchool.system_type}
              </BadgeUI>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/students')}
              className="group p-5 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {currentSchool?.system_type === 'anglophone' ? 'Add Student' : 'Ajouter un élève'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSchool?.system_type === 'anglophone' ? 'Register new student' : 'Inscrire un nouvel élève'}
              </p>
            </button>
            
            <button 
              onClick={() => navigate('/classes')}
              className="group p-5 border-2 border-border rounded-xl hover:border-secondary/50 hover:bg-secondary/5 transition-all duration-200 text-left hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {currentSchool?.system_type === 'anglophone' ? 'Create Class' : 'Créer une classe'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSchool?.system_type === 'anglophone' ? 'New class or section' : 'Nouvelle classe ou section'}
              </p>
            </button>
            
            <button 
              onClick={() => navigate('/finances')}
              className="group p-5 border-2 border-border rounded-xl hover:border-success/50 hover:bg-success/5 transition-all duration-200 text-left hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-success/20 transition-colors">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {currentSchool?.system_type === 'anglophone' ? 'Record Payment' : 'Enregistrer un paiement'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSchool?.system_type === 'anglophone' ? 'Enter new payment' : 'Saisir un nouveau paiement'}
              </p>
            </button>

            <button 
              onClick={() => navigate('/settings')}
              className="group p-5 border-2 border-border rounded-xl hover:border-warning/50 hover:bg-warning/5 transition-all duration-200 text-left hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-warning/20 transition-colors">
                <Settings className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
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