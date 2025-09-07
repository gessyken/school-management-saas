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
import { BookOpen, Clock, Users } from 'lucide-react';
import { usersService, type Teacher as TeacherOption } from '@/services/usersService';

interface Subject {
  id?: string;
  name: string;
  code: string;
  description?: string;
  baseCoefficient?: number;
  coefficient: number;
  coefficientsByLevel?: Record<string, number>;
  weeklyHours: number;
  teacher: string;
  teachers?: string[]; // array of user IDs
  level: string[];
  isActive: boolean;
  color: string;
}

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  subject?: Subject | null;
  mode: 'create' | 'edit' | 'view';
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subject,
  mode
}) => {
  const [formData, setFormData] = useState<Subject>({
    name: '',
    code: '',
    description: '',
    baseCoefficient: 1,
    coefficient: 1,
    coefficientsByLevel: {},
    weeklyHours: 1,
    teacher: '',
    teachers: [],
    level: [],
    isActive: true,
    color: '#3B82F6',
  });

  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);

  const levels = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'];
  const specialtiesFR = ['A', 'C', 'D', 'E', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3', 'TI'];
  const specialtiesEN = ['Arts', 'Commercial', 'Industrial', 'Science', 'GCE A-Level Arts', 'GCE A-Level Science'];
  const colors = [
    { name: 'Bleu', value: '#3B82F6' },
    { name: 'Vert', value: '#10B981' },
    { name: 'Rouge', value: '#EF4444' },
    { name: 'Jaune', value: '#F59E0B' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Rose', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Orange', value: '#F97316' },
  ];

  useEffect(() => {
    if (subject) {
      setFormData({
        ...subject,
        level: Array.isArray((subject as any).level) ? (subject as any).level : [],
        baseCoefficient: (subject as any).baseCoefficient ?? (subject as any).coefficient ?? 1,
        coefficientsByLevel: (subject as any).coefficientsByLevel || {},
        teachers: Array.isArray((subject as any).teachers)
          ? (subject as any).teachers.map((t: any) => typeof t === 'string' ? t : t.id).filter(Boolean)
          : [],
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        baseCoefficient: 1,
        coefficient: 1,
        coefficientsByLevel: {},
        weeklyHours: 1,
        teacher: '',
        teachers: [],
        level: [],
        isActive: true,
        color: '#3B82F6',
      });
    }
  }, [subject, isOpen]);

  // Load teachers when modal opens
  useEffect(() => {
    const loadTeachers = async () => {
      if (!isOpen) return;
      const teachers = await usersService.getTeachers();
      setTeacherOptions(teachers);
    };
    loadTeachers();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof Subject, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLevelToggle = (level: string) => {
    setFormData(prev => ({
      ...prev,
      level: prev.level.includes(level)
        ? prev.level.filter(l => l !== level)
        : [...prev.level, level]
    }));
  };

  const handleLevelCoefficientChange = (levelKey: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      coefficientsByLevel: {
        ...(prev.coefficientsByLevel || {}),
        [levelKey]: value
      }
    }));
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Ajouter une matière';
      case 'edit': return 'Modifier la matière';
      case 'view': return 'Détails de la matière';
      default: return 'Matière';
    }
  };

  if (mode === 'view') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: formData.color }}
              />
              <span>{formData.name}</span>
              <Badge variant={formData.isActive ? "default" : "secondary"}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Code: {formData.code}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{formData.weeklyHours}h</p>
                <p className="text-sm text-muted-foreground">par semaine</p>
              </div>
              <div className="bg-warning/10 p-4 rounded-lg text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold text-warning">{formData.coefficient}</p>
                <p className="text-sm text-muted-foreground">coefficient</p>
              </div>
              <div className="bg-success/10 p-4 rounded-lg text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold text-success">{(formData.level?.length || 0)}</p>
                <p className="text-sm text-muted-foreground">niveaux</p>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Informations générales</h4>
                <div className="space-y-2 pl-4">
                  <p><span className="font-medium">Professeur :</span> {formData.teacher}</p>
                  <p><span className="font-medium">Heures/semaine :</span> {formData.weeklyHours}h</p>
                  <p><span className="font-medium">Coefficient :</span> {formData.coefficient}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Niveaux concernés</h4>
                <div className="pl-4">
                  {(formData.level?.length || 0) > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(formData.level || []).map((level) => (
                        <span 
                          key={level}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucun niveau assigné</p>
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
              ? 'Remplissez les informations pour créer une nouvelle matière'
              : 'Modifiez les informations de la matière'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations de base</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de la matière *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="ex: Mathématiques"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="code">Code matière *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="ex: MATH"
                  required
                />
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

              <div className="md:col-span-2">
                <Label>Professeurs assignés (multi)</Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-auto border rounded-md p-2">
                  {teacherOptions.map((t) => {
                    const checked = (formData.teachers || []).includes(t.id);
                    return (
                      <label key={t.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(formData.teachers || []);
                            if (e.target.checked) next.add(t.id); else next.delete(t.id);
                            handleChange('teachers', Array.from(next));
                          }}
                        />
                        <span>{t.name}</span>
                        {t.email ? <span className="text-xs text-muted-foreground">({t.email})</span> : null}
                      </label>
                    );
                  })}
                  {teacherOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucun professeur trouvé</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="weeklyHours">Heures par semaine *</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.weeklyHours}
                  onChange={(e) => handleChange('weeklyHours', parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="coefficient">Coefficient *</Label>
                <Input
                  id="coefficient"
                  type="number"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={formData.coefficient}
                  onChange={(e) => handleChange('coefficient', parseFloat(e.target.value) || 1)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="baseCoefficient">Coefficient de base</Label>
                <Input
                  id="baseCoefficient"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.baseCoefficient ?? 1}
                  onChange={(e) => handleChange('baseCoefficient', parseFloat(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground mt-1">Utilisé si aucune valeur spécifique n'est définie par niveau.</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="isActive">Matière active</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description de la matière (optionnel)"
                rows={3}
              />
            </div>
          </div>

          {/* Niveaux */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Niveaux concernés *</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {levels.map((level) => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.level.includes(level)}
                    onChange={() => handleLevelToggle(level)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Coefficients par niveau */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Coefficients par niveau</h4>
            {formData.level.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sélectionnez au moins un niveau pour définir des coefficients spécifiques.</p>
            ) : (
              <div className="space-y-3">
                {(formData.level || []).map((lvl) => (
                  <div key={lvl} className="border rounded-md p-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3">
                      <div className="font-medium">{lvl}</div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Coefficient ({lvl})</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={formData.coefficientsByLevel?.[lvl] ?? ''}
                          onChange={(e) => handleLevelCoefficientChange(lvl, parseFloat(e.target.value) || 0)}
                          placeholder={String(formData.baseCoefficient ?? formData.coefficient ?? 1)}
                        />
                      </div>
                    </div>

                    {/* Spécialités pour Terminale / Upper Sixth */}
                    {['Terminale', 'Upper Sixth'].includes(lvl) && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Spécialités ({lvl})</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {(
                            lvl === 'Terminale' ? specialtiesFR : specialtiesEN
                          ).map((sp) => {
                            const key = `${lvl}|${sp}`;
                            return (
                              <div key={key} className="flex items-center space-x-2">
                                <Label className="text-xs w-20 truncate" title={sp}>{sp}</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={0.5}
                                  value={formData.coefficientsByLevel?.[key] ?? ''}
                                  onChange={(e) => handleLevelCoefficientChange(key, parseFloat(e.target.value) || 0)}
                                  placeholder={String(formData.coefficientsByLevel?.[lvl] ?? formData.baseCoefficient ?? formData.coefficient ?? 1)}
                                />
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">Laissez vide pour utiliser le coefficient du niveau ({lvl}) ou le coefficient de base.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Couleur */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Couleur d'identification</h4>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange('color', color.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color.value ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-8 h-8 rounded border border-input"
              />
              <span className="text-sm text-muted-foreground">Couleur personnalisée</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={(formData.level?.length || 0) === 0}>
              {mode === 'create' ? 'Créer' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectModal;