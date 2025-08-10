
import React from 'react';
import { 
  Users, 
  School, 
  BookOpen, 
  CreditCard, 
  UserCheck, 
  Percent,
  TrendingUp,
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DirectorDashboard = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-6 animate-fade-in-up space-y-8">
        {/* Header */}
        <div className="space-y-2 animate-slide-in-right">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-skyblue to-mustard bg-clip-text text-transparent hover:animate-glow transition-all duration-300">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground animate-fade-in-up delay-100">
            Vue d'ensemble de votre établissement scolaire
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
          <div className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 card-glow group">
            <StatsCard
              title="Effectif total"
              value="312"
              description="Élèves inscrits"
              icon={Users}
              trend={{ value: 5, isPositive: true }}
              color="skyblue"
            />
          </div>
          <div className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 card-glow group">
            <StatsCard
              title="Nombre de classes"
              value="12"
              description="Classes actives"
              icon={School}
              color="mustard"
            />
          </div>
          <div className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 card-glow group">
            <StatsCard
              title="Corps enseignant"
              value="24"
              description="Professeurs actifs"
              icon={BookOpen}
              color="skyblue"
            />
          </div>
          <div className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 card-glow group">
            <StatsCard
              title="Recouvrement"
              value="78%"
              description="Taux de paiement"
              icon={CreditCard}
              trend={{ value: 3, isPositive: true }}
              color="mustard"
            />
          </div>
          <div className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 card-glow group">
            <StatsCard
              title="Taux de présence"
              value="92%"
              description="Présence moyenne"
              icon={UserCheck}
              trend={{ value: 1, isPositive: true }}
              color="skyblue"
            />
          </div>
          <div className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 card-glow group">
            <StatsCard
              title="Taux de réussite"
              value="85%"
              description="Réussite académique"
              icon={Percent}
              trend={{ value: 2, isPositive: true }}
              color="skyblue"
            />
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Répartition des élèves
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Par niveau d'étude
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-dashed border-primary/20">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-primary/40 mx-auto mb-3" />
                  <p className="text-primary font-medium">Graphique de répartition</p>
                  <p className="text-sm text-primary/60">En cours de développement</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Évolution des paiements
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Suivi mensuel
                </p>
              </div>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg border-2 border-dashed border-secondary/20">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-secondary/40 mx-auto mb-3" />
                  <p className="text-secondary font-medium">Graphique des paiements</p>
                  <p className="text-sm text-secondary/60">En cours de développement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Gérer les élèves
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ajouter, modifier ou consulter les profils
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                  <School className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                    Gérer les classes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Organiser les classes et matières
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Suivi financier
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Consulter les paiements et recouvrements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold text-foreground">
                Activité récente
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">
                  Nouvelle inscription : Marie Dubois (6ème A)
                </span>
                <span className="text-xs text-muted-foreground ml-auto">Il y a 2h</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-secondary/5 rounded-lg">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm text-foreground">
                  Paiement reçu : Jean Martin (5ème B)
                </span>
                <span className="text-xs text-muted-foreground ml-auto">Il y a 4h</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                <span className="text-sm text-foreground">
                  Note ajoutée : Mathématiques 4ème A
                </span>
                <span className="text-xs text-muted-foreground ml-auto">Il y a 6h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DirectorDashboard;
