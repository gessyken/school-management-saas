import React, { useEffect, useState } from 'react';
import { Users, BookOpen, TrendingUp, DollarSign, AlertTriangle, Calendar, Settings, Badge, Globe, MapPin, Mail, Building2, Crown, Sparkles } from 'lucide-react';
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
  console.log(user)
  console.log(currentSchool)
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
  // Add this helper function for avatar initials
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
    <div className="p-6 space-y-6">
      {/* En-tête personnalisé avec les informations de l'école */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* School Logo */}
            {currentSchool?.logoUrl && (
              <div className="hidden sm:block flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white">
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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {currentSchool ? currentSchool.name : 'Tableau de bord'}
              </h1>

              <p className="text-lg text-gray-600 mt-2">
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
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Système</p>
                        <p className="text-gray-600 capitalize">{currentSchool.system_type}</p>
                      </div>
                    </div>

                    {/* Address */}
                    {currentSchool.address && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Adresse</p>
                          <p className="text-gray-600 line-clamp-1">{currentSchool.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {(currentSchool.phone || currentSchool.email) && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Contact</p>
                          <div className="text-gray-600">
                            {currentSchool.phone && <span>{currentSchool.phone}</span>}
                            {currentSchool.phone && currentSchool.email && <span> • </span>}
                            {currentSchool.email && <span>{currentSchool.email}</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* School Type */}
                    {currentSchool.type && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Type</p>
                          <p className="text-gray-600">{currentSchool.type}</p>
                        </div>
                      </div>
                    )}

                    {/* Motto */}
                    {currentSchool.motto && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Devise</p>
                          <p className="text-gray-600 italic">"{currentSchool.motto}"</p>
                        </div>
                      </div>
                    )}

                    {/* Plan */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Crown className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Forfait</p>
                        <Badge
                          // variant={
                          //   currentSchool.plan === 'PRO' ? 'default' :
                          //     currentSchool.plan === 'BASIC' ? 'secondary' : 'outline'
                          // }
                          className="mt-1"
                        >
                        </Badge>
                        {currentSchool.plan}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Meta Information */}
        <div className="flex flex-col items-end space-y-4">
          {/* Academic Year & Principal */}
          <div className="text-right space-y-3">
            {/* Academic Year */}
            <div className="flex items-center justify-end gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>Année académique {currentAcademicYears?.name}</span>
            </div>

            {/* Principal */}
            {currentSchool?.principal && (
              <div className="flex items-center justify-end gap-2 text-sm">
                <div className="text-right">
                  <p className="font-medium text-gray-900">Directeur</p>
                  <p className="text-gray-600">
                    {typeof currentSchool.principal === 'object'
                      ? currentSchool.principal.fullName
                      : user?.firstName || user?.name
                    }
                  </p>
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

            {/* School Status */}
            {currentSchool && (
              <div className="text-xs flex items-center justify-end gap-2">
                {currentSchool.accessStatus === 'active' ? 'Actif' :
                  currentSchool.accessStatus === 'suspended' ? 'Suspendu' : 'Bloqué'}
                <Badge
                  // variant={
                  //   currentSchool.accessStatus === 'active' ? 'default' :
                  //     currentSchool.accessStatus === 'suspended' ? 'secondary' : 'destructive'
                  // }
                  className="text-xs"
                >
                  {currentSchool.accessStatus === 'active' ? 'Actif' :
                    currentSchool.accessStatus === 'suspended' ? 'Suspendu' : 'Bloqué'}
                </Badge>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Large Logo for Mobile */}
          {currentSchool?.logoUrl && (
            <div className="sm:hidden w-full">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white mx-auto">
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