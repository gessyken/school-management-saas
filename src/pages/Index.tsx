
import { Link } from 'react-router-dom';
import { School, UserCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">MI-TECH École</h1>
          <p className="text-xl text-muted-foreground">
            Plateforme de gestion scolaire
          </p>
        </div>

        {/* Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Director Card */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <School className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-4">Directeur</h2>
              <p className="text-muted-foreground mb-6">
                Gérez votre établissement, suivez les performances et prenez des décisions éclairées.
              </p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link to="/login">Connexion Directeur</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Secretary Card */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-4">Secrétaire</h2>
              <p className="text-muted-foreground mb-6">
                Gérez les inscriptions, les paiements et les dossiers des élèves efficacement.
              </p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link to="/login">Connexion Secrétaire</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Teacher Card */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-4">Enseignant</h2>
              <p className="text-muted-foreground mb-6">
                Suivez vos classes, gérez les notes et communiquez avec vos élèves.
              </p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link to="/login">Connexion Enseignant</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-muted-foreground">
          <p>© 2024 MI-TECH École. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
