import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Mail, Phone, Eye, Users, Loader2, Shield, UserX } from 'lucide-react';
import { School } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { memberService, Member } from '@/services/memberService';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MembersTabProps {
  currentSchool: School | null;
  onRefresh: () => void;
}

// Role options for multi-select
const possibleRoles = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'DIRECTOR', label: 'Directeur' },
  { value: 'TEACHER', label: 'Enseignant' },
  { value: 'FINANCE', label: 'Responsable financier' }
];

const MembersTab: React.FC<MembersTabProps> = ({ 
  currentSchool, 
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Load members when school changes
  useEffect(() => {
    if (!currentSchool?.id) return;

    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const membersData = await memberService.getSchoolMembers(currentSchool.id);
        setMembers(membersData);
      } catch (error) {
        console.error('Error loading members:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la liste des membres.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, [currentSchool, toast]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'DIRECTOR': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SECRETARY': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TEACHER': return 'bg-green-100 text-green-800 border-green-200';
      case 'FINANCE': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoles = (member: Member) =>
    member.memberships?.find((m) => m.school === currentSchool?.id)?.roles || [];

  const handleRoleChange = async (memberId: string, newRoles: string[]) => {
    if (!currentSchool?.id) return;

    setUpdatingMember(memberId);
    try {
      await memberService.updateMemberRoles(currentSchool.id, memberId, newRoles);

      toast({
        title: 'Rôles mis à jour',
        description: 'Les rôles du membre ont été modifiés avec succès.',
      });

      // Update local state
      setMembers(prev =>
        prev.map(member =>
          member._id === memberId
            ? {
                ...member,
                memberships: member.memberships.map(mem =>
                  mem.school === currentSchool.id 
                    ? { ...mem, roles: newRoles } 
                    : mem
                ),
              }
            : member
        )
      );
    } catch (error) {
      console.error('Error updating roles:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les rôles.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!currentSchool?.id || !selectedMember) return;

    setRemovingMember(selectedMember._id);
    try {
      await memberService.removeMember(currentSchool.id, selectedMember._id);

      toast({
        title: 'Membre retiré',
        description: 'Le membre a été retiré de l\'établissement.',
      });

      // Update local state
      setMembers(prev => prev.filter(member => member._id !== selectedMember._id));
      setRemoveDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le membre.',
        variant: 'destructive',
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const openRemoveDialog = (member: Member) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const filteredMembers = members.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
            <span>Chargement des membres...</span>
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
              <Users className="w-5 h-5" />
              <span>Membres de l'établissement ({members.length})</span>
            </div>
            <Button variant="outline" onClick={onRefresh} size="sm">
              Actualiser
            </Button>
          </CardTitle>
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
              const isCurrentUser = member._id === currentUser._id;
              const memberRoles = getRoles(member);

              return (
                <div key={member._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar>
                      <AvatarImage  />
                      <AvatarFallback>
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{member.firstName} {member.lastName}</h3>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            Vous
                          </Badge>
                        )}
                      </div>
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
                      <div className="flex flex-wrap gap-1 mt-2">
                        {memberRoles.map((role) => (
                          <Badge key={role} variant="outline" className={getRoleBadgeColor(role)}>
                            {role}
                          </Badge>
                        ))}
                        <Badge variant={isMemberActive ? "default" : "secondary"}>
                          {isMemberActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Role Management */}
                    <div className="w-48">
                      <Label className="text-xs text-muted-foreground mb-1 block">Rôles</Label>
                      <MultiSelect
                        options={possibleRoles}
                        value={memberRoles}
                        disabled={updatingMember === member._id || isCurrentUser}
                        onChange={(newRoles) => handleRoleChange(member._id, newRoles)}
                        // placeholder="Sélectionner les rôles"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/admin/users?user=${member._id}`)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Voir</span>
                      </Button>
                      
                      {!isCurrentUser && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openRemoveDialog(member)}
                          disabled={removingMember === member._id}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {removingMember === member._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          <span>Retirer</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun membre trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Aucun membre ne correspond à votre recherche.' 
                  : 'Aucun membre dans cet établissement.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-red-600" />
              <span>Retirer un membre</span>
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir retirer {selectedMember?.firstName} {selectedMember?.lastName} de cet établissement ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveMember}
              disabled={removingMember !== null}
            >
              {removingMember ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Retrait...
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Confirmer le retrait
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MembersTab;