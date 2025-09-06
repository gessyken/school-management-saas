import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { School, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { schoolService } from '@/services/schoolService';
import { School as SchoolType } from '@/types';

const SelectSchool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user, userSchools, switchSchool } = useAuth();

  // Rediriger si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSelectSchool = async (school: SchoolType) => {
    setIsLoading(true);
    try {
      await switchSchool(school);
      toast({
        title: 'École sélectionnée',
        description: `Vous avez sélectionné l'école ${school.name}.`,
      });
      // Rediriger vers le tableau de bord
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'école:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sélectionner cette école.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <School className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Sélectionner une école
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Choisissez une école ou créez-en une nouvelle
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {userSchools && userSchools.length > 0 ? (
              <div className="space-y-3">
                {userSchools.map((school) => (
                  <div 
                    key={school.id} 
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleSelectSchool(school)}
                  >
                    <h3 className="font-medium">{school.name}</h3>
                    {school.address && <p className="text-sm text-muted-foreground">{school.address}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Aucune école disponible</p>
              </div>
            )}
            
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/create-school">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une nouvelle école
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectSchool;