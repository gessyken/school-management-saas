
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect is handled in the login function
    } catch (error) {
      toast({
        title: "Échec de connexion",
        description: "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    let demoCredentials = { email: '', password: 'password123' };
    
    switch (role) {
      case 'director':
        demoCredentials.email = 'directeur@ecole.com';
        break;
      case 'secretary':
        demoCredentials.email = 'secretaire@ecole.com';
        break;
      case 'teacher':
        demoCredentials.email = 'professeur@ecole.com';
        break;
      default:
        return;
    }
    
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    
    try {
      await login(demoCredentials.email, demoCredentials.password);
    } catch (error) {
      toast({
        title: "Échec de connexion",
        description: "Impossible de se connecter avec les identifiants de démo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-skyblue/10 to-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-skyblue">EDUTRACK</h1>
          <p className="text-lg text-muted-foreground">Gestion Scolaire</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full bg-skyblue hover:bg-skyblue/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8">
          <p className="text-center text-sm text-muted-foreground mb-3">
            Identifiants de démonstration
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('director')}
              className="text-xs"
            >
              Directeur
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('secretary')}
              className="text-xs"
            >
              Secrétaire
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('teacher')}
              className="text-xs"
            >
              Enseignant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
