import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { School, Plus, Mail, Clock, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { School as SchoolType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { schoolService } from '@/services/schoolService';
import { joinRequestService } from '@/services/joinRequestService';

const SelectSchool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { isAuthenticated, user, switchSchool, isLoading: authLoading } = useAuth();

  // Load user schools and invitations
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setIsFetchingData(false);
        return;
      }

      try {
        setIsFetchingData(true);
        
        // Fetch user's schools
        const userSchools = await schoolService.getUserSchools();
        setSchools(userSchools);

        // Fetch pending invitations
        try {
          // This would need to be implemented in your service
          // For now, we'll use a mock or you can implement an endpoint to get user's invitations
          const userInvitations = await joinRequestService.getUserInvitations();
          console.log(userInvitations)
          setInvitations(userInvitations);
        } catch (error) {
          console.error('Error fetching invitations:', error);
          // If the endpoint doesn't exist yet, we'll show a message
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger vos données.',
          variant: 'destructive',
        });
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Show loading spinner while auth is initializing or data is loading
  if (authLoading || isFetchingData) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
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
      const schoolToSwitch = {
        ...school,
        id: school.id || (school as any)._id || ''
      };

      await switchSchool(schoolToSwitch);
      toast({
        title: 'École sélectionnée',
        description: `Vous avez sélectionné l'école ${school.name}.`,
      });

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

  const handleAcceptInvitation = async (invitation: any) => {
    setActionLoadingId(invitation._id);
    try {
      // Accept the invitation
      await joinRequestService.acceptInvitation(invitation?.school?._id);
      
      toast({
        title: 'Invitation acceptée',
        description: `Vous avez rejoint l'école ${invitation.school.name}.`,
      });

      // Remove the invitation from the list
      setInvitations(prev => prev.filter(inv => inv._id !== invitation._id));
      
      // Refresh schools list to show the newly joined school
      const userSchools = await schoolService.getUserSchools();
      setSchools(userSchools);

    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      
      let errorMessage = 'Impossible d\'accepter l\'invitation.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineInvitation = async (invitation: any) => {
    setActionLoadingId(invitation._id);
    try {
      // Decline the invitation
      await joinRequestService.cancelInvitation(invitation?.school?._id,invitation?._id);
      
      toast({
        title: 'Invitation déclinée',
        description: 'Vous avez décliné l\'invitation.',
      });

      // Remove the invitation from the list
      setInvitations(prev => prev.filter(inv => inv._id !== invitation._id));

    } catch (error: any) {
      console.error('Error declining invitation:', error);
      
      let errorMessage = 'Impossible de décliner l\'invitation.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Display loading state during school selection
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
            <span>Sélection de l'école...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasSchools = schools.length > 0;
  const hasInvitations = invitations.length > 0;

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
              {hasSchools 
                ? 'Choisissez une école ou créez-en une nouvelle'
                : hasInvitations
                ? 'Vous avez des invitations en attente'
                : 'Créez votre première école pour commencer'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Pending Invitations Section */}
            {hasInvitations && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium text-sm text-blue-900">Invitations en attente</h3>
                  <Badge variant="outline" className="ml-auto">{invitations.length}</Badge>
                </div>
                
                {invitations.map((invitation) => (
                  <div key={invitation._id} className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{invitation.school.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Invité par {invitation.invitedBy?.firstName} {invitation.invitedBy?.lastName}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {invitation.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>Expire le {formatDate(invitation.expiredAt)}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleAcceptInvitation(invitation)}
                        disabled={actionLoadingId === invitation._id}
                      >
                        {actionLoadingId === invitation._id ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        Accepter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleDeclineInvitation(invitation)}
                        disabled={actionLoadingId === invitation._id}
                      >
                        {actionLoadingId === invitation._id ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <X className="w-3 h-3 mr-1" />
                        )}
                        Décliner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Schools Section */}
            {hasSchools && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <School className="w-4 h-4 text-green-600" />
                  <h3 className="font-medium text-sm text-green-900">Vos écoles</h3>
                  <Badge variant="outline" className="ml-auto">{schools.length}</Badge>
                </div>
                
                {schools.map((school) => (
                  <div
                    key={school.id || (school as any)._id}
                    className="p-4 border border-green-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectSchool(school)}
                  >
                    <h3 className="font-medium">{school.name}</h3>
                    {school.address && (
                      <p className="text-sm text-muted-foreground">{school.address}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Membre
                      </Badge>
                      {school.system_type && (
                        <Badge variant="outline" className="text-xs">
                          {school.system_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!hasSchools && !hasInvitations && (
              <div className="text-center py-4">
                <School className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Aucune école disponible</p>
                <p className="text-sm text-muted-foreground">
                  Vous n'êtes pas encore membre d'une école et n'avez pas d'invitations en attente.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/create-school">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une nouvelle école
                </Link>
              </Button>

              {!hasSchools && (
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/join-school">
                    Rejoindre une école existante
                  </Link>
                </Button>
              )}

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