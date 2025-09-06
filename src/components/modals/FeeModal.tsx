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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Euro, Calendar, Users, AlertCircle } from 'lucide-react';

interface Fee {
  id?: string;
  name: string;
  type: 'tuition' | 'registration' | 'activity' | 'transport' | 'meal' | 'other';
  amount: number;
  dueDate: string;
  description?: string;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'annual';
  classes: string[];
  isActive: boolean;
}

interface FeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fee: Fee) => void;
  fee?: Fee | null;
  mode: 'create' | 'edit' | 'view';
}

const FeeModal: React.FC<FeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fee,
  mode
}) => {
  const [formData, setFormData] = useState<Fee>({
    name: '',
    type: 'tuition',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    frequency: 'monthly',
    classes: [],
    isActive: true,
  });

  const feeTypes = [
    { value: 'tuition', label: 'Frais de scolarité', icon: '🎓' },
    { value: 'registration', label: 'Frais d\'inscription', icon: '📝' },
    { value: 'activity', label: 'Frais d\'activité', icon: '🎨' },
    { value: 'transport', label: 'Transport scolaire', icon: '🚌' },
    { value: 'meal', label: 'Restauration', icon: '🍽️' },
    { value: 'other', label: 'Autres frais', icon: '💼' },
  ];

  const frequencies = [
    { value: 'monthly', label: 'Mensuel' },
    { value: 'quarterly', label: 'Trimestriel' },
    { value: 'annual', label: 'Annuel' },
  ];

  const availableClasses = ['6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B', '3ème A', '3ème B', '3ème C'];

  useEffect(() => {
    if (fee) {
      setFormData({ ...fee });
    } else {
      setFormData({
        name: '',
        type: 'tuition',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        description: '',
        isRecurring: false,
        frequency: 'monthly',
        classes: [],
        isActive: true,
      });
    }
  }, [fee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof Fee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClassToggle = (className: string) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter(c => c !== className)
        : [...prev.classes, className]
    }));
  };

  const getTypeInfo = (type: string) => {
    return feeTypes.find(t => t.value === type) || feeTypes[0];
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Créer des frais';
      case 'edit': return 'Modifier les frais';
      case 'view': return 'Détails des frais';
      default: return 'Frais';
    }
  };

  if (mode === 'view') {
    const typeInfo = getTypeInfo(formData.type);
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-xl">{typeInfo.icon}</span>
              <span>{formData.name}</span>
              <Badge variant={formData.isActive ? "default" : "secondary"}>
                {formData.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {typeInfo.label}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <Euro className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{formData.amount.toFixed(2)}€</p>
                <p className="text-sm text-muted-foreground">Montant</p>
              </div>
              <div className="bg-warning/10 p-4 rounded-lg text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-warning" />
                <p className="text-lg font-bold text-warning">
                  {new Date(formData.dueDate).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm text-muted-foreground">Date d'échéance</p>
              </div>
              <div className="bg-success/10 p-4 rounded-lg text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold text-success">{formData.classes.length}</p>
                <p className="text-sm text-muted-foreground">Classes concernées</p>
              </div>
            </div>

            {/* Détails */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Configuration</h4>
                <div className="space-y-2 pl-4">
                  <p><span className="font-medium">Type :</span> {typeInfo.label}</p>
                  <p><span className="font-medium">Récurrent :</span> {formData.isRecurring ? 'Oui' : 'Non'}</p>
                  {formData.isRecurring && (
                    <p><span className="font-medium">Fréquence :</span> {
                      frequencies.find(f => f.value === formData.frequency)?.label
                    }</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Classes concernées</h4>
                <div className="pl-4">
                  {formData.classes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.classes.map((className) => (
                        <span 
                          key={className}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                        >
                          {className}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Toutes les classes</p>
                  )}
                </div>
              </div>
            </div>

            {formData.description && (
              <div className="space-y-3">
                <h4 className="font-semibold">Description</h4>
                <p className="pl-4 text-muted-foreground">{formData.description}</p>
              </div>
            )}
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
              ? 'Configurez les nouveaux frais pour les étudiants'
              : 'Modifiez la configuration des frais'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations de base</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom des frais *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="ex: Frais de scolarité Q1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type de frais *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value as Fee['type'])}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  {feeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="amount">Montant (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Date d'échéance *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description des frais (optionnel)"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="isActive">Frais actifs</Label>
            </div>
          </div>

          {/* Configuration récurrence */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => handleChange('isRecurring', e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="isRecurring">Frais récurrents</Label>
            </div>

            {formData.isRecurring && (
              <div>
                <Label htmlFor="frequency">Fréquence</Label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => handleChange('frequency', e.target.value as Fee['frequency'])}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {frequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Classes concernées */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Classes concernées</h4>
            <p className="text-sm text-muted-foreground">
              Laissez vide pour appliquer à toutes les classes
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {availableClasses.map((className) => (
                <label key={className} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.classes.includes(className)}
                    onChange={() => handleClassToggle(className)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{className}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Créer' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeeModal;