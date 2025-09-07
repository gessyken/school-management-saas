import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Shield, 
  Clock, 
  Check, 
  X, 
  Eye, 
  Mail, 
  Phone,
  Search,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usersService } from '@/services/usersService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const Users: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement real API calls
      // const [allUsers, teachersList] = await Promise.all([
      //   usersService.getUsers(),
      //   usersService.getTeachers()
      // ]);
      // setUsers(allUsers);
      // setTeachers(teachersList);
      
      // For now, set empty arrays to avoid fake data
      setUsers([]);
      setTeachers([]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (roles: string[]) => {
    const roleConfig: Record<string, { label: string; className: string }> = {
      ADMIN: { label: 'Administrateur', className: 'bg-red-100 text-red-800' },
      TEACHER: { label: 'Enseignant', className: 'bg-blue-100 text-blue-800' },
      FINANCE: { label: 'Finance', className: 'bg-green-100 text-green-800' },
      SECRETARY: { label: 'Secrétaire', className: 'bg-yellow-100 text-yellow-800' },
    };

    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => {
          const config = roleConfig[role] || { label: role, className: 'bg-gray-100 text-gray-800' };
          return (
            <Badge key={role} className={config.className}>
              {config.label}
            </Badge>
          );
        })}
      </div>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactif</Badge>
    );
  };

  const handleCreateUser = () => {
    // TODO: Implement user creation modal
    toast({
      title: "Fonctionnalité à venir",
      description: "La création d'utilisateur sera bientôt disponible.",
    });
  };

  const handleEditUser = (userId: string) => {
    // TODO: Implement user editing
    toast({
      title: "Fonctionnalité à venir",
      description: "L'édition d'utilisateur sera bientôt disponible.",
    });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // TODO: Implement user deletion
      // await usersService.deleteUser(userId);
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    teachers: teachers.length,
    admins: users.filter(u => u.roles.includes('ADMIN')).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-16 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérer les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Inviter un utilisateur
          </Button>
          <Button onClick={handleCreateUser}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total utilisateurs</p>
                <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
              </div>
              <UsersIcon className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <Check className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enseignants</p>
                <p className="text-3xl font-bold text-blue-600">{stats.teachers}</p>
              </div>
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administrateurs</p>
                <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <Shield className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateur(s) • {stats.activeUsers} actif(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {users.length === 0 ? 'Aucun utilisateur' : 'Aucun résultat'}
              </h3>
              <p className="text-muted-foreground">
                {users.length === 0 
                  ? 'Commencez par créer votre premier utilisateur.' 
                  : 'Essayez de modifier vos critères de recherche.'
                }
              </p>
              {users.length === 0 && (
                <Button onClick={handleCreateUser} className="mt-4">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer le premier utilisateur
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Créé le</p>
                      <p className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      {user.lastLogin && (
                        <p className="text-xs text-muted-foreground">
                          Dernière connexion : {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {getRoleBadge(user.roles)}
                      {getStatusBadge(user.isActive)}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer {user.firstName} {user.lastName} ? 
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
