import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { schoolService } from '@/services/schoolService';
import { School } from '@/types';
import { AlertCircle, Loader2, Mail, Send, UserPlus } from 'lucide-react';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentSchool: School | null;
}

// Available roles for invitation
const AVAILABLE_ROLES = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'DIRECTOR', label: 'Directeur' },
  { value: 'SECRETARY', label: 'Secrétaire' },
  { value: 'TEACHER', label: 'Enseignant' },
  { value: 'FINANCE', label: 'Responsable financier' }
];

const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  currentSchool
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    message: '',
    roles: ['TEACHER'] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'Au moins un rôle doit être sélectionné';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle role selection
  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));

    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: '' }));
    }
  };

  // Handle form submission
  const handleInvite = async () => {
    if (!validateForm()) return;

    if (!currentSchool?.id) {
      toast({
        title: 'Erreur',
        description: "Aucun établissement sélectionné.",
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Since your backend doesn't have a direct invite endpoint,
      // we'll use the join request flow or create a user directly

      // Option 1: If you want to create a direct invitation system:
      // This would require a new backend endpoint like POST /schools/:schoolId/invitations

      // For now, let's simulate the invitation process
      // In a real implementation, you would call your invitation API
      // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // If you have a proper invitation endpoint, it would look like:
      await schoolService.inviteMember(currentSchool.id, {
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        roles: formData.roles,
        message: formData.message || undefined
      });

      toast({
        title: 'Invitation envoyée',
        description: `L'invitation a été envoyée à ${formData.email}.`
      });

      // Close dialog and reset form
      onOpenChange(false);
      resetForm();
      onSuccess();

    } catch (error: any) {
      console.error('Invitation error:', error);

      let errorMessage = "Impossible d'envoyer l'invitation.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      message: '',
      roles: ['TEACHER']
    });
    setErrors({});
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Inviter un membre</span>
          </DialogTitle>
          <DialogDescription>
            Envoyez une invitation par email à rejoindre votre établissement.
            L'utilisateur pourra accepter l'invitation et sera automatiquement ajouté avec les rôles spécifiés.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Email Section */}
          <div className="space-y-3">
            <Label htmlFor="inviteEmail" className="flex items-center space-x-2 text-sm font-medium">
              <Mail className="w-4 h-4" />
              <span>Email *</span>
            </Label>
            <Input
              id="inviteEmail"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemple.com"
              className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Personal Information Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Informations personnelles (optionnel)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  id="inviteFirstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="inviteLastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Nom"
                />
              </div>
            </div>
          </div>

          {/* Roles Selection Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rôles *</Label>
            <div className={`p-4 border-2 rounded-lg space-y-3 ${errors.roles ? 'border-red-500 bg-red-50' : 'border-border bg-muted/20'
              }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_ROLES.map((role) => (
                  <label key={role.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
                    <Checkbox
                      checked={formData.roles.includes(role.value)}
                      onCheckedChange={(checked) =>
                        handleRoleChange(role.value, checked as boolean)
                      }
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className="text-sm font-medium">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {errors.roles && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.roles}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Sélectionnez les rôles que cet utilisateur aura dans l'établissement
            </p>
          </div>

          {/* Message Section */}
          <div className="space-y-3">
            <Label htmlFor="inviteMessage" className="text-sm font-medium">
              Message personnalisé (optionnel)
            </Label>
            <Textarea
              id="inviteMessage"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Ajoutez un message personnalisé pour l'invitation..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Ce message sera inclus dans l'email d'invitation pour personnaliser la demande
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-shrink-0 pt-6 border-t">
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Annuler
            </Button>
            <Button
              onClick={handleInvite}
              disabled={isLoading || !formData.email}
              className="flex-1 bg-gradient-primary hover:bg-primary-hover transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer l'invitation
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;