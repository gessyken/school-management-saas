import React, { useState } from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  School,
  Calendar,
  Award,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CardExamples = () => {
  const [loading, setLoading] = useState(false);

  const handleCardClick = (cardName: string) => {
    console.log(`Carte cliquée: ${cardName}`);
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-muted/50 to-muted min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Composants de Cartes Animées
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez nos composants de cartes réutilisables avec des animations fluides et des designs modernes.
        </p>
      </div>

      {/* Stats Cards Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Cartes de Statistiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Étudiants Inscrits"
            value="1,234"
            description="Total des étudiants actifs"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            color="primary"
            variant="floating"
            animationDelay={0}
            onClick={() => handleCardClick('Étudiants')}
            loading={loading}
          />
          
          <StatsCard
            title="Classes Actives"
            value="45"
            description="Classes en cours"
            icon={School}
            trend={{ value: 8, isPositive: true }}
            color="secondary"
            variant="glow"
            animationDelay={200}
            onClick={() => handleCardClick('Classes')}
          />
          
          <StatsCard
            title="Professeurs"
            value="89"
            description="Équipe pédagogique"
            icon={GraduationCap}
            trend={{ value: 5, isPositive: true }}
            color="primary"
            variant="default"
            animationDelay={400}
            onClick={() => handleCardClick('Professeurs')}
          />
          
          <StatsCard
            title="Matières"
            value="156"
            description="Cours disponibles"
            icon={BookOpen}
            color="primary"
            variant="minimal"
            animationDelay={600}
            onClick={() => handleCardClick('Matières')}
          />
        </div>
      </section>

      {/* Custom Cards Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Cartes Personnalisées</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-float"
            onClick={() => handleCardClick('Dashboard')}
          >
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Tableau de Bord</CardTitle>
                <p className="text-sm text-muted-foreground">Vue d'ensemble des activités</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progression</span>
                  <span className="text-lg font-semibold text-primary">85%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full w-[85%] animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-glow"
            onClick={() => handleCardClick('Calendrier')}
          >
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-2 bg-secondary/10 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-lg">Calendrier</CardTitle>
                <p className="text-sm text-muted-foreground">Événements à venir</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                  <span className="text-sm">Réunion équipe - 14h00</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm">Formation - 16h30</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5"
            onClick={() => handleCardClick('Récompenses')}
          >
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Récompenses</CardTitle>
                <p className="text-sm text-muted-foreground">Achievements débloqués</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Cartes Interactives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-shimmer ${loading ? 'opacity-50' : ''}`}
            onClick={() => handleCardClick('Finances')}
          >
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Finances</CardTitle>
                <p className="text-sm text-muted-foreground">Gestion budgétaire</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget Total</span>
                  <span className="font-semibold text-primary">€125,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dépenses</span>
                  <span className="font-semibold text-secondary">€89,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solde</span>
                  <span className="font-semibold text-primary">€35,500</span>
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  Voir Détails
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Actions Rapides</CardTitle>
              <p className="text-sm text-muted-foreground">Raccourcis fréquents</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary/30">
                  Nouvel Étudiant
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-secondary/10 hover:border-secondary/30">
                  Nouvelle Classe
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary/30">
                  Rapport
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-secondary/10 hover:border-secondary/30">
                  Paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Controls */}
      <section className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-muted-foreground">Contrôles de Démonstration</h3>
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => setLoading(!loading)}
            variant={loading ? "destructive" : "default"}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            {loading ? 'Arrêter Chargement' : 'Simuler Chargement'}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CardExamples;