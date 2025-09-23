import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usersService, User } from '@/services/usersService';
import { UserPlus, Users, Clock, Activity } from 'lucide-react';
import MembersTab from './Administration/MembersTab';
import JoinRequestsTab from './Administration/JoinRequestsTab';
import ActivityTab from './Administration/ActivityTab';
import InviteMemberDialog from './Administration/InviteMemberDialog';
import StatsCards from './Administration/StatsCards';

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
  const { currentSchool } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  
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
  }, [currentSchool]);

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
        <Button 
          className="bg-gradient-primary hover:bg-primary-hover" 
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Inviter un membre
        </Button>
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog 
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={loadData}
        currentSchool={currentSchool}
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

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
        <TabsContent value="members">
          <MembersTab 
            // members={members}
            currentSchool={currentSchool}
            // isLoading={isLoading}
            onRefresh={loadData}
          />
        </TabsContent>

        {/* Join Requests Tab */}
        <TabsContent value="requests">
          <JoinRequestsTab 
          currentSchool={currentSchool}
            onRefresh={loadData}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityTab 
            activityLogs={activityLogs}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Administration;