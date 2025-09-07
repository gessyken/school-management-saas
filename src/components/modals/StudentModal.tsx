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
import { Textarea } from '@/components/ui/textarea';
import { Calendar, User, Mail, Phone, MapPin, Users, BookOpen } from 'lucide-react';
import { classesService } from '@/services/classesService';

interface Student {
  id?: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  average?: number;
  status: 'active' | 'inactive' | 'graduated';
  enrollmentDate: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  birthDate?: string;
  avatar?: string;
}

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  student?: Student | null;
  mode: 'create' | 'edit' | 'view';
}

const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  student,
  mode
}) => {
  const [formData, setFormData] = useState<Student>({
    name: '',
    email: '',
    phone: '',
    class: '',
    status: 'active',
    enrollmentDate: new Date().toISOString().split('T')[0],
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    birthDate: '',
  });
  const [availableClasses, setAvailableClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  useEffect(() => {
    // load classes from API
    const loadClasses = async () => {
      try {
        const cls = await classesService.getClasses();
        const items = Array.isArray(cls) ? cls.map((c: any) => ({ id: c.id || c._id, name: c.name || c.classesName || c.className })) : [];
        setAvailableClasses(items);
      } catch {
        setAvailableClasses([]);
      }
    };
    loadClasses();

    if (student) {
      setFormData({ ...student });
      setSelectedClassId('');
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        class: '',
        status: 'active',
        enrollmentDate: new Date().toISOString().split('T')[0],
        address: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        birthDate: '',
      });
      setSelectedClassId('');
    }
  }, [student, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClassName = availableClasses.find(c => c.id === selectedClassId)?.name || '';
    const payload = {
      ...formData,
      class: selectedClassName || formData.class,
      // pass classesId to let caller link the student to a class after creation
      // @ts-ignore
      classesId: selectedClassId || undefined,
    } as any;
    onSave(payload);
    onClose();
  };

  const handleChange = (field: keyof Student, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Ajouter un étudiant';
      case 'edit': return 'Modifier l\'étudiant';
      case 'view': return 'Détails de l\'étudiant';
      default: return 'Étudiant';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success">Actif</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactif</Badge>;
      case 'graduated':
        return <Badge variant="secondary">Diplômé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
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
            <DialogDescription>
              Fiche détaillée de l'étudiant
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
                <p className="text-muted-foreground">{formData.class}</p>
                {getStatusBadge(formData.status)}
              </div>
              {formData.average && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Moyenne générale</p>
                  <p className="text-2xl font-bold text-primary">{formData.average.toFixed(1)}/20</p>
                </div>
              )}
            </div>

            {/* Informations de contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Informations de contact
                </h4>
                <div className="space-y-2 pl-6">
                  <p><span className="font-medium">Email :</span> {formData.email}</p>
                  <p><span className="font-medium">Téléphone :</span> {formData.phone}</p>
                  {formData.address && (
                    <p><span className="font-medium">Adresse :</span> {formData.address}</p>
                  )}
                  {formData.birthDate && (
                    <p><span className="font-medium">Date de naissance :</span> {new Date(formData.birthDate).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Contact des parents
                </h4>
                <div className="space-y-2 pl-6">
                  {formData.parentName && (
                    <p><span className="font-medium">Nom :</span> {formData.parentName}</p>
                  )}
                  {formData.parentEmail && (
                    <p><span className="font-medium">Email :</span> {formData.parentEmail}</p>
                  )}
                  {formData.parentPhone && (
                    <p><span className="font-medium">Téléphone :</span> {formData.parentPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informations scolaires */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Informations scolaires
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <p><span className="font-medium">Classe :</span> {formData.class}</p>
                <p><span className="font-medium">Date d'inscription :</span> {new Date(formData.enrollmentDate).toLocaleDateString('fr-FR')}</p>
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
              ? 'Remplissez les informations pour ajouter un nouvel étudiant'
              : 'Modifiez les informations de l\'étudiant'
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
                <Label htmlFor="birthDate">Date de naissance *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
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
            </div>

            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Adresse complète"
                rows={2}
              />
            </div>
          </div>

          {/* Informations scolaires */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations scolaires</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="class">Classe *</Label>
                <select
                  id="class"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Sélectionner une classe</option>
                  {availableClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="enrollmentDate">Date d'inscription *</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={(e) => handleChange('enrollmentDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive' | 'graduated')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="graduated">Diplômé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact des parents */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact des parents/tuteurs</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="parentName">Nom du parent</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleChange('parentName', e.target.value)}
                  placeholder="Nom Prénom"
                />
              </div>

              <div>
                <Label htmlFor="parentEmail">Email du parent</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleChange('parentEmail', e.target.value)}
                  placeholder="parent@email.fr"
                />
              </div>

              <div>
                <Label htmlFor="parentPhone">Téléphone du parent</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => handleChange('parentPhone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
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

export default StudentModal;