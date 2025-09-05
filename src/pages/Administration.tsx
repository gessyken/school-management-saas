import React, { useState } from 'react';
import { Users, UserPlus, Shield, Clock, Check, X, Eye, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'director' | 'teacher' | 'admin' | 'secretary';
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

interface JoinRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  requestedRole: string;
  requestDate: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
}

const Administration: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('members');

  const members: Member[] = [
    {
      id: '1',
      name: 'Marie Directrice',
      email: 'marie.directrice@ecole.fr',
      phone: '01 23 45 67 89',
      role: 'director',
      joinDate: '2020-09-01',
      lastActive: '2024-02-15 14:30',
      status: 'active',
    },
    {
      id: '2',
      name: 'Jean Professeur',
      email: 'jean.prof@ecole.fr',
      phone: '01 23 45 67 90',
      role: 'teacher',
      joinDate: '2021-09-01',
      lastActive: '2024-02-15 12:15',
      status: 'active',
    },
    {
      id: '3',
      name: 'Sophie Admin',
      email: 'sophie.admin@ecole.fr',
      phone: '01 23 45 67 91',
      role: 'admin',
      joinDate: '2022-01-15',
      lastActive: '2024-02-14 18:45',
      status: 'active',
    },
    {
      id: '4',
      name: 'Paul Secrétaire',
      email: 'paul.secretaire@ecole.fr',
      phone: '01 23 45 67 92',
      role: 'secretary',
      joinDate: '2023-03-10',
      lastActive: '2024-02-13 16:20',
      status: 'inactive',
    },
  ];

  const joinRequests: JoinRequest[] = [
    {
      id: '1',
      name: 'Alice Martin',
      email: 'alice.martin@email.fr',
      phone: '06 12 34 56 78',
      requestedRole: 'teacher',
      requestDate: '2024-02-10',
      message: 'Professeure de mathématiques avec 5 ans d\'expérience, souhaite rejoindre votre équipe.',
      status: 'pending',
    },
    {
      id: '2',
      name: 'Thomas Dubois',
      email: 'thomas.dubois@email.fr',
      phone: '06 87 65 43 21',
      requestedRole: 'admin',
      requestDate: '2024-02-08',
      message: 'Administrateur système expérimenté, ancien directeur adjoint.',
      status: 'pending',
    },
  ];

  const activityLogs: ActivityLog[] = [
    {
      id: '1',
      userName: 'Marie Directrice',
      action: 'Création d\'une nouvelle classe',
      timestamp: '2024-02-15 14:30:25',
      details: 'Classe 6ème C créée avec 25 places',
    },
    {
      id: '2',
      userName: 'Jean Professeur',
      action: 'Saisie de notes',
      timestamp: '2024-02-15 12:15:18',
      details: 'Notes de mathématiques saisies pour la 5ème A (28 élèves)',
    },
    {
      id: '3',
      userName: 'Sophie Admin',
      action: 'Modification utilisateur',
      timestamp: '2024-02-14 18:45:32',
      details: 'Droits d\'accès modifiés pour Paul Secrétaire',
    },
    {
      id: '4',
      userName: 'Marie Directrice',
      action: 'Approbation de demande',
      timestamp: '2024-02-14 16:20:45',
      details: 'Demande d\'adhésion approuvée pour Lucas Nouveau',
    },
  ];

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      director: { label: 'Directeur', className: 'bg-primary' },
      teacher: { label: 'Enseignant', className: 'bg-secondary' },
      admin: { label: 'Administrateur', className: 'bg-success' },
      secretary: { label: 'Secrétaire', className: 'bg-warning' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, className: 'bg-muted' };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success">Actif</Badge>
    ) : (
      <Badge variant="secondary">Inactif</Badge>
    );
  };

  const handleApproveRequest = (requestId: string) => {
    console.log('Approving request:', requestId);
    // Ici, on ferait l'appel API pour approuver
  };

  const handleRejectRequest = (requestId: string) => {
    console.log('Rejecting request:', requestId);
    // Ici, on ferait l'appel API pour rejeter
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration de l'école</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des membres, demandes et journaux d'activité
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Inviter un membre
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Membres actifs</p>
                <p className="text-3xl font-bold text-success">
                  {members.filter(m => m.status === 'active').length}
                </p>
              </div>
              <Users className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Demandes en attente</p>
                <p className="text-3xl font-bold text-warning">
                  {joinRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enseignants</p>
                <p className="text-3xl font-bold text-secondary">
                  {members.filter(m => m.role === 'teacher').length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administrateurs</p>
                <p className="text-3xl font-bold text-primary">
                  {members.filter(m => m.role === 'admin' || m.role === 'director').length}
                </p>
              </div>
              <Users className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Membres de l'équipe</TabsTrigger>
          <TabsTrigger value="requests">Demandes d'adhésion</TabsTrigger>
          <TabsTrigger value="logs">Journaux d'activité</TabsTrigger>
        </TabsList>

        {/* Liste des membres */}
        <TabsContent value="members" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Membres de l'établissement</CardTitle>
              <CardDescription>
                {members.length} membres • {members.filter(m => m.status === 'active').length} actifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {member.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {member.phone}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Membre depuis</p>
                        <p className="font-medium">{new Date(member.joinDate).toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-muted-foreground">
                          Dernière connexion : {new Date(member.lastActive).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {getRoleBadge(member.role)}
                        {getStatusBadge(member.status)}
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Shield className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demandes d'adhésion */}
        <TabsContent value="requests" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Demandes d'adhésion en attente</CardTitle>
              <CardDescription>
                {joinRequests.filter(r => r.status === 'pending').length} demandes à examiner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {joinRequests.filter(r => r.status === 'pending').map((request) => (
                  <div key={request.id} className="p-6 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center text-white font-semibold">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{request.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {request.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {request.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className="bg-secondary">
                          {request.requestedRole === 'teacher' ? 'Enseignant' : 'Administrateur'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Demande du {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-muted/50 rounded border">
                      <p className="text-sm"><strong>Message :</strong></p>
                      <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRejectRequest(request.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Refuser
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-success hover:bg-success/90"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approuver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {joinRequests.filter(r => r.status === 'pending').length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune demande en attente</h3>
                  <p className="text-muted-foreground">
                    Toutes les demandes d'adhésion ont été traitées.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journaux d'activité */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Journal des activités</CardTitle>
              <CardDescription>
                Historique des actions effectuées par les membres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log, index) => (
                  <div key={log.id} className="flex items-start space-x-4 pb-4 border-b border-border last:border-b-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{log.action}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleDateString('fr-FR')} à {' '}
                          {new Date(log.timestamp).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Par <strong>{log.userName}</strong>
                      </p>
                      <p className="text-sm">{log.details}</p>
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