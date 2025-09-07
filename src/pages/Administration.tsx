import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Clock, 
  Check, 
  X, 
  Eye, 
  Mail, 
  Phone,
  Search,
  Activity,
  AlertCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usersService, User } from '@/services/usersService';


interface JoinRequest {
  _id: string;
  user: User;
  school: string;
  requestedRoles: string[];
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: string;
}

interface ActivityLog {
  _id: string;
  user: User;
  action: string;
  details: string;
  timestamp: string;
  type: 'user_action' | 'system' | 'admin_action';
}

const Administration: React.FC = () => {
  const { user, currentSchool } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteRoles, setInviteRoles] = useState<string[]>(['TEACHER']);
  
  // States for real data
  const [members, setMembers] = useState<User[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingRequests: 0,
    recentActivity: 0
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!currentSchool?.id) return;
    
    setIsLoading(true);
    try {
      // Load members
      const membersData = await usersService.getUsers();
      const schoolMembers = membersData.filter((u: User) => 
        u.memberships?.some(m => m.school === currentSchool.id && m.status === 'active')
      );
      setMembers(schoolMembers);

      // Load join requests (mock for now - would need backend endpoint)
      const pendingMembers = membersData.filter((u: User) => 
        u.memberships?.some(m => m.school === currentSchool.id && m.status === 'pending')
      );
      const mockRequests: JoinRequest[] = pendingMembers.map(u => ({
        _id: u._id + '_request',
        user: u,
        school: currentSchool.id,
        requestedRoles: ['TEACHER'],
        status: 'pending',
        message: 'Demande d\'adhésion à l\'établissement',
        createdAt: new Date().toISOString()
      }));
      setJoinRequests(mockRequests);

      // Mock activity logs
      const mockActivity: ActivityLog[] = schoolMembers.slice(0, 10).map((u, i) => ({
        _id: `activity_${i}`,
        user: u,
        action: ['Connexion', 'Mise à jour profil', 'Création classe', 'Ajout étudiant'][i % 4],
        details: `Action effectuée par ${u.firstName} ${u.lastName}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        type: 'user_action' as const
      }));
      setActivityLogs(mockActivity);

      // Update stats
      setStats({
        totalMembers: schoolMembers.length,
        activeMembers: schoolMembers.filter(u =>
          u.memberships?.some(m => m.school === currentSchool.id && m.status === 'active')
        ).length,
        pendingRequests: mockRequests.length,
        recentActivity: mockActivity.length
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données d\'administration.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      // Mock approval - would call backend API
      setJoinRequests(prev => prev.filter(r => r._id !== requestId));
      toast({
        title: 'Demande approuvée',
        description: 'L\'utilisateur a été ajouté à l\'établissement.',
      });
      loadData(); // Reload to update stats
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver la demande.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // Mock rejection - would call backend API
      setJoinRequests(prev => prev.filter(r => r._id !== requestId));
      toast({
        title: 'Demande rejetée',
        description: 'La demande d\'adhésion a été rejetée.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la demande.',
        variant: 'destructive',
      });
    }
  };

  const filteredMembers = members.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'TEACHER': return 'bg-blue-100 text-blue-800';
      case 'FINANCE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des membres et des demandes d'adhésion
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover" onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Inviter un membre
        </Button>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un membre</DialogTitle>
            <DialogDescription>
              Envoyez une invitation par email et attribuez des rôles pour cet établissement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email</Label>
                <Input id="inviteEmail" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@exemple.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteFirstName">Prénom</Label>
                <Input id="inviteFirstName" value={inviteFirstName} onChange={(e) => setInviteFirstName(e.target.value)} placeholder="Prénom (optionnel)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteLastName">Nom</Label>
                <Input id="inviteLastName" value={inviteLastName} onChange={(e) => setInviteLastName(e.target.value)} placeholder="Nom (optionnel)" />
              </div>
              <div className="space-y-2">
                <Label>Rôles</Label>
                <div className="flex flex-wrap gap-4">
                  {['ADMIN', 'TEACHER', 'FINANCE'].map(role => (
                    <label key={role} className="flex items-center space-x-2 text-sm">
                      <Checkbox
                        checked={inviteRoles.includes(role)}
                        onCheckedChange={(checked) => {
                          setInviteRoles(prev => checked ? Array.from(new Set([...prev, role])) : prev.filter(r => r !== role));
                        }}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteMessage">Message</Label>
              <Textarea id="inviteMessage" value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} placeholder="Message d'invitation (optionnel)" rows={3} />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Annuler</Button>
            <Button
              onClick={async () => {
                if (!currentSchool?.id) {
                  toast({ title: 'Aucune école', description: "Sélectionnez d'abord un établissement.", variant: 'destructive' });
                  return;
                }
                if (!inviteEmail) {
                  toast({ title: 'Email requis', description: "Veuillez renseigner l'email.", variant: 'destructive' });
                  return;
                }
                setInviteLoading(true);
                try {
                  await usersService.inviteMember({
                    email: inviteEmail,
                    firstName: inviteFirstName || undefined,
                    lastName: inviteLastName || undefined,
                    roles: inviteRoles.length ? inviteRoles : ['TEACHER'],
                    message: inviteMessage || undefined,
                    schoolId: currentSchool.id,
                  });
                  toast({ title: 'Invitation envoyée', description: `Invitation envoyée à ${inviteEmail}.` });
                  setInviteOpen(false);
                  setInviteEmail('');
                  setInviteFirstName('');
                  setInviteLastName('');
                  setInviteMessage('');
                  setInviteRoles(['TEACHER']);
                  loadData();
                } catch (e: any) {
                  toast({ title: 'Erreur', description: e?.response?.data?.message || "Impossible d'envoyer l'invitation.", variant: 'destructive' });
                } finally {
                  setInviteLoading(false);
                }
              }}
              disabled={inviteLoading}
              className="bg-gradient-primary hover:bg-primary-hover"
            >
              {inviteLoading ? 'Envoi...' : 'Envoyer l\'invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total membres</p>
                <p className="text-3xl font-bold text-primary">{stats.totalMembers}</p>
              </div>
              <Users className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Membres actifs</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeMembers}</p>
              </div>
              <UserCheck className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Demandes en attente</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activité récente</p>
                <p className="text-3xl font-bold text-blue-600">{stats.recentActivity}</p>
              </div>
              <Activity className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Membres ({stats.totalMembers})</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Demandes ({stats.pendingRequests})</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Activité</span>
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Membres de l'établissement</CardTitle>
              <CardDescription>
                Liste des utilisateurs ayant accès à votre établissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-4">
                {filteredMembers.map((member) => {
                  const membership = member.memberships?.find(m => m.school === currentSchool?.id);
                  const isMemberActive = membership?.status === 'active';
                  return (
                    <div key={member._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.firstName} {member.lastName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {member.email}
                            </span>
                            {member.phone && (
                              <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {member.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-wrap gap-1">
                          {membership?.roles.map((role) => (
                            <Badge key={role} className={getRoleBadgeColor(role)}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                        <Badge variant={isMemberActive ? "default" : "secondary"}>
                          {isMemberActive ? "Actif" : "Inactif"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users?user=${member._id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Join Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demandes d'adhésion</CardTitle>
              <CardDescription>
                Demandes en attente d'approbation pour rejoindre l'établissement
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    <div key={request._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {request.user.firstName[0]}{request.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{request.user.firstName} {request.user.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{request.user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">Rôles demandés:</span>
                            {request.requestedRoles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectRequest(request._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Rejeter
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'activité</CardTitle>
              <CardDescription>
                Historique des actions effectuées dans l'établissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log._id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{log.action}</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {log.user.firstName[0]}{log.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {log.user.firstName} {log.user.lastName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Administration;
