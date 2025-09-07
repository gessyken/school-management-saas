import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, BookOpen, School, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  activeStudents: number;
  inactiveStudents: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    activeStudents: 0,
    inactiveStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // TODO: Implement real API calls
        // const [students, teachers, classes, subjects] = await Promise.all([
        //   studentsService.getStudents(),
        //   usersService.getTeachers(),
        //   classesService.getClasses(),
        //   subjectsService.getSubjects()
        // ]);
        
        // For now, set to 0 to avoid fake data
        setStats({
          totalStudents: 0,
          totalTeachers: 0,
          totalClasses: 0,
          totalSubjects: 0,
          activeStudents: 0,
          inactiveStudents: 0,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Élèves',
      value: stats.totalStudents,
      description: `${stats.activeStudents} actifs, ${stats.inactiveStudents} inactifs`,
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Enseignants',
      value: stats.totalTeachers,
      description: 'Professeurs enregistrés',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Classes',
      value: stats.totalClasses,
      description: 'Classes configurées',
      icon: School,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Matières',
      value: stats.totalSubjects,
      description: 'Matières disponibles',
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickActions = [
    {
      title: 'Ajouter un élève',
      description: 'Inscrire un nouvel élève',
      href: '/admin/students?action=create',
      icon: GraduationCap,
    },
    {
      title: 'Créer une classe',
      description: 'Configurer une nouvelle classe',
      href: '/admin/classes?action=create',
      icon: School,
    },
    {
      title: 'Ajouter une matière',
      description: 'Créer une nouvelle matière',
      href: '/admin/subjects?action=create',
      icon: BookOpen,
    },
    {
      title: 'Gérer les utilisateurs',
      description: 'Ajouter des enseignants',
      href: '/admin/users',
      icon: Users,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-primary-foreground">
        <h2 className="text-2xl font-bold mb-2">
          Bienvenue, {user?.firstName} {user?.lastName}
        </h2>
        <p className="text-primary-foreground/90">
          Tableau de bord de l'administration - {(user as any)?.school?.name || 'École'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Actions rapides
            </CardTitle>
            <CardDescription>
              Accès direct aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-md border hover:bg-accent transition-colors"
                >
                  <div className="p-2 rounded-md bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </a>
              );
            })}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              État du système
            </CardTitle>
            <CardDescription>
              Informations sur la configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de données</span>
              <Badge variant="default">Connectée</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentification</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Année académique</span>
              <Badge variant="outline">2024-2025</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Système éducatif</span>
              <Badge variant="outline">Francophone/Anglophone</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
