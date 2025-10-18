import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserCheck, X, Check, Search, Send, Loader2, UserPlus, Mail, Clock, UserX,
  Users, MailCheck, Calendar, UserCog
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  joinRequestService,
  JoinRequest,
  SearchUserResult,
  // Invitation,
  // SendInvitationRequest 
} from '@/services/joinRequestService';
import { School } from '@/types';
import schoolService from '@/services/schoolService';
import InviteMemberDialog from './InviteMemberDialog';

interface JoinRequestsTabProps {
  currentSchool: School | null;
  onRefresh: () => void;
}

// Available roles for invitations
const AVAILABLE_ROLES = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'DIRECTOR', label: 'Directeur' },
  { value: 'SECRETARY', label: 'Secrétaire' },
  { value: 'TEACHER', label: 'Enseignant' },
  { value: 'FINANCE', label: 'Responsable financier' }
];

const JoinRequestsTab: React.FC<JoinRequestsTabProps> = ({
  currentSchool,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'invitations'>('requests');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);

  // New invitation form
  const [invitationForm, setInvitationForm] = useState<any>({
    email: '',
    firstName: '',
    lastName: '',
    roles: ['TEACHER'],
    message: ''
  });

  const { toast } = useToast();

  // Load data based on active tab
  useEffect(() => {
    if (!currentSchool?.id) return;
    loadData();
  }, [currentSchool, activeTab, toast]);
  const loadData = async () => {
    setIsLoading(true);
    try {
      // if (activeTab === 'requests') {
        const requests = await joinRequestService.getJoinRequests(currentSchool.id);
        setJoinRequests(requests);
      // } else {
        const invites = await joinRequestService.getInvitationsBySchool(currentSchool.id);
        setInvitations(invites);
      // }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de charger les ${activeTab === 'requests' ? 'demandes' : 'invitations'}.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Search users by email
  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) return;

    setSearchLoading(true);
    try {
      const results = await joinRequestService.searchUsers(searchEmail);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rechercher des utilisateurs.',
        variant: 'destructive',
      });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Send invitation to existing user
  const handleSendInvitationToUser = async (userId: string) => {
    if (!currentSchool?.id) return;

    setSendingInvite(userId);
    try {
      // For existing users, we might want to use a different endpoint
      // This would send a notification rather than creating an invitation
      // await joinRequestService.sendInvitation(currentSchool.id, {
      //   email: searchResults.find(u => u._id === userId)?.email || '',
      //   roles: ['TEACHER'] // Default role for existing users
      // });
      await schoolService.inviteMember(currentSchool.id, {
        email: searchResults.find(u => u._id === userId)?.email || '',
        roles: ['TEACHER'],
        // message: formData.message || undefined
      });

      toast({
        title: 'Invitation envoyée',
        description: 'L\'invitation a été envoyée avec succès.',
      });
      setIsInviteModalOpen(false);
      resetModal();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer l\'invitation.',
        variant: 'destructive',
      });
    } finally {
      setSendingInvite(null);
    }
  };

  // Send new invitation
  const handleSendNewInvitation = async () => {
    if (!currentSchool?.id || !invitationForm.email.trim()) return;

    setSendingInvite('new');
    try {
      await joinRequestService.sendInvitation(currentSchool.id, invitationForm);
      toast({
        title: 'Invitation envoyée',
        description: `L'invitation a été envoyée à ${invitationForm.email}.`,
      });
      setIsInviteModalOpen(false);
      resetModal();
      // Refresh invitations list
      if (activeTab === 'invitations') {
        const invites = await joinRequestService.getInvitationsBySchool(currentSchool.id);
        setInvitations(invites);
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible d\'envoyer l\'invitation.',
        variant: 'destructive',
      });
    } finally {
      setSendingInvite(null);
    }
  };

  // Cancel invitation
  const handleCancelInvitation = async (invitationId: string) => {
    if (!currentSchool?.id) return;

    setActionLoadingId(invitationId);
    try {
      await joinRequestService.cancelInvitation(currentSchool.id, invitationId);
      toast({
        title: 'Invitation annulée',
        description: 'L\'invitation a été annulée avec succès.',
      });
      setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler l\'invitation.',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Approve join request
  const handleApproveRequest = async (requestId: string, userId: string) => {
    if (!currentSchool?.id) return;

    setActionLoadingId(requestId);
    try {
      await joinRequestService.approveJoinRequest(currentSchool.id, userId);
      toast({
        title: 'Demande approuvée',
        description: 'L\'utilisateur a été ajouté à l\'établissement.',
      });
      setJoinRequests(prev => prev.filter(req => req._id !== requestId));
      onRefresh(); // Refresh parent data
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver la demande.',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject join request
  const handleRejectRequest = async (requestId: string, userId: string) => {
    if (!currentSchool?.id) return;

    setActionLoadingId(requestId);
    try {
      await joinRequestService.rejectJoinRequest(currentSchool.id, userId);
      toast({
        title: 'Demande rejetée',
        description: 'La demande a été rejetée.',
      });
      setJoinRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la demande.',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reset modal state
  const resetModal = () => {
    setSearchEmail('');
    setSearchResults([]);
    setSearchLoading(false);
    setSendingInvite(null);
    setInvitationForm({
      email: '',
      firstName: '',
      lastName: '',
      roles: ['TEACHER'],
      message: ''
    });
  };

  // Get badge color for invitation status
  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
            <span>Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCog className="w-5 h-5" />
              <span>Gestion des membres</span>
            </div>

            <Button
              className="bg-gradient-primary hover:bg-primary-hover"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Inviter un membre
            </Button>
          </CardTitle>
          <InviteMemberDialog
            open={isInviteModalOpen}
            onOpenChange={(open) => {
              setIsInviteModalOpen(open);
              if (!open) resetModal();
            }}
            onSuccess={loadData}
            currentSchool={currentSchool}
          />
          <CardDescription>
            Gérez les demandes d'adhésion et les invitations en attente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests" className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span>Demandes ({joinRequests.length})</span>
              </TabsTrigger>
              <TabsTrigger value="invitations" className="flex items-center space-x-2">
                <MailCheck className="w-4 h-4" />
                <span>Invitations ({invitations.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Join Requests Tab */}
            <TabsContent value="requests" className="space-y-4 mt-4">
              {joinRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune demande en attente</h3>
                  <p className="text-muted-foreground">
                    Toutes les demandes d'adhésion ont été traitées.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {joinRequests.map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar>
                          <AvatarImage />
                          <AvatarFallback>
                            {request.user.firstName?.[0]}{request.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {request.user.firstName} {request.user.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{request.user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">Rôles demandés:</span>
                            {request.requestedRoles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                          {request.message && (
                            <p className="text-xs text-muted-foreground mt-1">
                              "{request.message}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Demandé le {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectRequest(request._id, request.user._id)}
                          disabled={actionLoadingId === request._id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {actionLoadingId === request._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-1" />
                          )}
                          Rejeter
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request._id, request.user._id)}
                          disabled={actionLoadingId === request._id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoadingId === request._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-1" />
                          )}
                          Approuver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Invitations Tab */}
            <TabsContent value="invitations" className="space-y-4 mt-4">
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <MailCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune invitation en attente</h3>
                  <p className="text-muted-foreground">
                    Toutes les invitations ont été traitées ou acceptées.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar>
                          <AvatarFallback>
                            <Mail className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{invitation.email}</h3>
                            <Badge className={getInvitationStatusColor(invitation.status)}>
                              {invitation.status === 'pending' && 'En attente'}
                              {invitation.status === 'accepted' && 'Acceptée'}
                              {invitation.status === 'expired' && 'Expirée'}
                              {invitation.status === 'cancelled' && 'Annulée'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {invitation.firstName} {invitation.lastName}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">Rôles:</span>
                            {invitation.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Envoyée le {formatDate(invitation.invitedAt)}</span>
                            </span>
                            {invitation.status === 'pending' && (
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Expire le {formatDate(invitation.expiredAt)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {invitation.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation._id)}
                          disabled={actionLoadingId === invitation._id}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          {actionLoadingId === invitation._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4 mr-1" />
                          )}
                          Annuler
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default JoinRequestsTab;