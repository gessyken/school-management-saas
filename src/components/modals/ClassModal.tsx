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
import { Users, BookOpen } from 'lucide-react';

interface Class {
  id?: string;
  name: string;
  level: string;
  section: string;
  capacity: number;
  currentStudents: number;
  teacher: string;
  room: string;
  description?: string;
  subjects: string[];
}

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Class) => void;
  classData?: Class | null;
  mode: 'create' | 'edit' | 'view';
}

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  classData,
  mode
}) => {
  const [formData, setFormData] = useState<Class>({
    name: '',
    level: '',
    section: '',
    capacity: 30,
    currentStudents: 0,
    teacher: '',
    room: '',
    description: '',
    subjects: [],
  });

  const levels = ['6ème', '5ème', '4ème', '3ème'];
  const sections = ['A', 'B', 'C', 'D'];
  const availableSubjects = ['Mathématiques', 'Français', 'Histoire-Géographie', 'Sciences', 'Anglais', 'Espagnol', 'Arts plastiques', 'Musique', 'EPS'];

  useEffect(() => {
    if (classData) {
      setFormData({ ...classData });
    } else {
      setFormData({
        name: '',
        level: '',
        section: '',
        capacity: 30,
        currentStudents: 0,
        teacher: '',
        room: '',
        description: '',
        subjects: [],
      });
    }
  }, [classData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      name: `${formData.level} ${formData.section}`.trim(),
    };
    onSave(finalData);
    onClose();
  };

  const handleChange = (field: keyof Class, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Ajouter une classe';
      case 'edit': return 'Modifier la classe';
      case 'view': return 'Détails de la classe';
      default: return 'Classe';
    }
  };

  if (mode === 'view') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{formData.name}</span>
            </DialogTitle>
            <DialogDescription>
              Informations détaillées de la classe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* En-tête avec statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{formData.currentStudents}</p>
                <p className="text-sm text-muted-foreground">Étudiants inscrits</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{formData.capacity}</p>
                <p className="text-sm text-muted-foreground">Capacité maximale</p>
              </div>
              <div className="bg-success/10 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-success">{formData.subjects.length}</p>
                <p className="text-sm text-muted-foreground">Matières</p>
              </div>
            </div>

            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Informations générales
                </h4>
                <div className="space-y-2 pl-6">
                  <p><span className="font-medium">Niveau :</span> {formData.level}</p>
                  <p><span className="font-medium">Section :</span> {formData.section}</p>
                  <p><span className="font-medium">Professeur principal :</span> {formData.teacher}</p>
                  <p><span className="font-medium">Salle :</span> {formData.room}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Matières enseignées</h4>
                <div className="pl-6">
                  {formData.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.subjects.map((subject) => (
                        <span 
                          key={subject}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune matière assignée</p>
                  )}
                </div>
              </div>
            </div>

            {formData.description && (
              <div className="space-y-3">
                <h4 className="font-semibold">Description</h4>
                <p className="pl-6 text-muted-foreground">{formData.description}</p>
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
              ? 'Remplissez les informations pour créer une nouvelle classe'
              : 'Modifiez les informations de la classe'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations de base</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Niveau *</Label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Sélectionner un niveau</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="section">Section *</Label>
                <select
                  id="section"
                  value={formData.section}
                  onChange={(e) => handleChange('section', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Sélectionner une section</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="teacher">Professeur principal *</Label>
                <Input
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => handleChange('teacher', e.target.value)}
                  placeholder="Nom du professeur"
                  required
                />
              </div>

              <div>
                <Label htmlFor="room">Salle *</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => handleChange('room', e.target.value)}
                  placeholder="Numéro de salle"
                  required
                />
              </div>

              <div>
                <Label htmlFor="capacity">Capacité maximale *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              {mode === 'edit' && (
                <div>
                  <Label htmlFor="currentStudents">Étudiants actuels</Label>
                  <Input
                    id="currentStudents"
                    type="number"
                    min="0"
                    max={formData.capacity}
                    value={formData.currentStudents}
                    onChange={(e) => handleChange('currentStudents', parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description de la classe (optionnel)"
                rows={3}
              />
            </div>
          </div>

          {/* Matières */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Matières enseignées</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSubjects.map((subject) => (
                <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{subject}</span>
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

export default ClassModal;