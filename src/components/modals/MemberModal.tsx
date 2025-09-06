import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

interface Member {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'teacher' | 'staff' | 'parent';
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  avatar?: string;
  permissions: string[];
}

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
  member?: Member | null;
  mode: 'create' | 'edit' | 'view';
}

const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  member,
  mode
}) => {
  const [formData, setFormData] = useState<Member>({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    permissions: [],
  });

  const roles = [
    { value: 'admin', label: 'Administrateur', color: 'destructive' },
    { value: 'teacher', label: 'Professeur', color: 'default' },
    { value: 'staff', label: 'Personnel', color: 'secondary' },
    { value: 'parent', label: 'Parent', color: 'outline' },
  ];

  const allPermissions = [
    { id: 'students', label: 'Gérer les étudiants' },
    { id: 'classes', label: 'Gérer les classes' },
    { id: 'grades', label: 'Gérer les notes' },
    { id: 'finances', label: 'Gérer les finances' },
    { id: 'reports', label: 'Voir les rapports' },
    { id: 'settings', label: 'Modifier les paramètres' },
    { id: 'users', label: 'Gérer les utilisateurs' },
  ];

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        permissions: [],
      });
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getRoleBadge = (role: string) => {
    const roleInfo = roles.find(r => r.value === role);
    return (
      <Badge variant={roleInfo?.color as any}>
        {roleInfo?.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success">Actif</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactif</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Ajouter un membre';
      case 'edit': return 'Modifier le membre';
      case 'view': return 'Détails du membre';
      default: return 'Membre';
    }
  };

  if (mode === 'view') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{formData.name}</span>
            </DialogTitle>
            <DialogDescription className="flex items-center space-x-2">
              {getRoleBadge(formData.role)}
              {getStatusBadge(formData.status)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* En-tête avec avatar */}
            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {formData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{formData.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {getRoleBadge(formData.role)}
                  {getStatusBadge(formData.status)}
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Informations de contact
                </h4>
                <div className="space-y-2 pl-6">
                  <p><span className="font-medium">Email :</span> {formData.email}</p>
                  <p><span className="font-medium">Téléphone :</span> {formData.phone}</p>
                  <p>
                    <span className="font-medium">Date d'adhésion :</span> {' '}
                    {new Date(formData.joinDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Permissions
                </h4>
                <div className="pl-6">
                  {formData.permissions.length > 0 ? (
                    <div className="space-y-2">
                      {formData.permissions.map((permissionId) => {
                        const permission = allPermissions.find(p => p.id === permissionId);
                        return permission ? (
                          <div key={permissionId} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-success rounded-full" />
                            <span className="text-sm">{permission.label}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune permission spécifique</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={() => {/* Ouvrir mode édition */}}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Remplissez les informations pour ajouter un nouveau membre'
              : 'Modifiez les informations du membre'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations personnelles</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Prénom Nom"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@exemple.fr"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="06 12 34 56 78"
                  required
                />
              </div>

              <div>
                <Label htmlFor="joinDate">Date d'adhésion</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleChange('joinDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Rôle et statut */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Rôle et statut</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Rôle *</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value as Member['role'])}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as Member['status'])}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allPermissions.map((permission) => (
                <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{permission.label}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Ajouter' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberModal;