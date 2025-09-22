import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { School, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { School as SchoolType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { schoolService } from '@/services/schoolService';

const SelectSchool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [isFetchingSchools, setIsFetchingSchools] = useState(true);
  const { isAuthenticated, user, switchSchool, isLoading: authLoading } = useAuth();

  // Load user schools
  useEffect(() => {
    const fetchUserSchools = async () => {
      if (!isAuthenticated) {
        setIsFetchingSchools(false);
        return;
      }

      try {
        setIsFetchingSchools(true);
        const userSchools = await schoolService.getUserSchools();
        setSchools(userSchools);
      } catch (error) {
        console.error('Error fetching user schools:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger vos écoles.',
          variant: 'destructive',
        });
      } finally {
        setIsFetchingSchools(false);
      }
    };

    fetchUserSchools();
  }, [isAuthenticated]);

  // Show loading spinner while auth is initializing or schools are loading
  if (authLoading || isFetchingSchools) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSelectSchool = async (school: SchoolType) => {
    setIsLoading(true);
    try {
      // Ensure the school object has the correct format expected by switchSchool
      const schoolToSwitch = {
        ...school,
        id: school.id || (school as any)._id || '' // Handle both id and _id formats
      };

      await switchSchool(schoolToSwitch);
      toast({
        title: 'École sélectionnée',
        description: `Vous avez sélectionné l'école ${school.name}.`,
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Erreur lors de la sélection de l\'école:', error);

      let errorMessage = 'Impossible de sélectionner cette école.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display loading state during school selection
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span>Sélection de l'école...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {schools.length > 0
                ? 'Choisissez une école ou créez-en une nouvelle'
                : 'Créez votre première école pour commencer'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {schools.length > 0 ? (
              <div className="space-y-3">
                {schools.map((school) => (
                  <div
                    key={school.id || (school as any)._id}
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
                <School className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aucune école disponible</p>
                <p className="text-sm text-muted-foreground">
                  Vous n'êtes pas encore membre d'une école.
                </p>
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

            {/* Option to join an existing school if user has no schools */}
            {schools.length === 0 && (
              <div className="pt-2">
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/join-school">
                    Rejoindre une école existante
                  </Link>
                </Button>
              </div>
            )}

            {/* Refresh button in case schools didn't load properly */}
            <div className="pt-2">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => window.location.reload()}
              >
                Actualiser la liste
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectSchool;