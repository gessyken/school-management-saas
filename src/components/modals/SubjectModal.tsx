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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, Users, Palette, Plus, Trash2 } from 'lucide-react';
import { usersService, type Teacher as TeacherOption } from '@/services/usersService';

interface Coefficient {
  level: string;
  value: number;
}

interface Subject {
  id?: string;
  name: string;
  code: string;
  description?: string;
  year?: string;
  coefficient: number;
  coefficients: Coefficient[];
  weeklyHours: number;
  teacher: string;
  mainTeacher?: any; // teacher ID for backend
  teachers?: string[]; // array of teacher IDs
  levels: string[];
  educationSystem?: string;
  specialty?: string[];
  specialties?: string[];
  required?: boolean;
  isActive: boolean;
  color: string;
}

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => any;
  onSave: (subject: Subject | any) => any;
  subject?: Subject | null | any;
  mode: 'create' | 'edit' | 'view';
  coefData?: any;
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subject,
  mode,
  coefData

}) => {
  const [formData, setFormData] = useState<Subject>({
    id: '',
    name: '',
    code: '',
    description: '',
    year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    coefficient: 1,
    coefficients: [],
    weeklyHours: 4,
    teacher: '',
    mainTeacher: '',
    teachers: [],
    levels: [],
    educationSystem: 'bilingue',
    specialties: [],
    required: false,
    isActive: true,
    color: '#3B82F6',
  });

  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);

  const levels = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'];
  const specialtiesFR = ['A', 'B', 'C', 'D', 'E', 'F', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3', 'TI'];
  const specialtiesEN = ['Arts', 'Commercial', 'Industrial', 'Science', 'GCE A-Level Arts', 'GCE A-Level Science'];
  const educationSystems = [
    { value: 'francophone', label: 'Francophone' },
    { value: 'anglophone', label: 'Anglophone' },
    { value: 'bilingue', label: 'Bilingue' }
  ];
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
        id: subject.id,
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        year: subject.year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        coefficient: subject.coefficient || 1,
        coefficients: Array.isArray(subject.coefficients) ? subject.coefficients : [],
        weeklyHours: subject.weeklyHours || 4,
        teacher: subject.teacher || '',
        mainTeacher: subject.mainTeacher.id || '',
        teachers: Array.isArray(subject.teachers) ? subject.teachers : [],
        levels: Array.isArray(subject.levels) ? subject.levels : [],
        educationSystem: subject.educationSystem || 'bilingue',
        specialties: Array.isArray(subject.specialties) ? subject.specialties : Array.isArray(subject.specialty) ? subject.specialty : [],
        required: subject.required || false,
        isActive: subject.isActive !== undefined ? subject.isActive : true,
        color: subject.color || '#3B82F6',
      });
    } else {
      setFormData({
        id: '',
        name: '',
        code: '',
        description: '',
        year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        coefficient: 1,
        coefficients: [],
        weeklyHours: 4,
        teacher: '',
        mainTeacher: '',
        teachers: [],
        levels: [],
        educationSystem: 'bilingue',
        specialties: [],
        required: false,
        isActive: true,
        color: '#3B82F6',
      });
    }
  }, [subject, isOpen]);

  // Load teachers when modal opens
  useEffect(() => {
    const loadTeachers = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const teachers = await usersService.getTeachers();
        setTeacherOptions(teachers);
      } catch (error) {
        console.error('Error loading teachers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTeachers();
  }, [isOpen]);

  // Auto-generate coefficients when levels change
  useEffect(() => {
    if (formData.levels.length > 0 && mode !== 'view') {
      const newCoefficients: Coefficient[] = formData.levels.map(level => {
        const existingCoefficient = formData.coefficients.find(c => c.level === level);
        return {
          level,
          value: existingCoefficient ? existingCoefficient.value : formData.coefficient
        };
      });

      // Only update if coefficients have changed
      if (JSON.stringify(newCoefficients) !== JSON.stringify(formData.coefficients)) {
        setFormData(prev => ({ ...prev, coefficients: newCoefficients }));
      }
    } else if (formData.levels.length === 0) {
      setFormData(prev => ({ ...prev, coefficients: [] }));
    }
  }, [formData.levels, formData.coefficient, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("subjectData", formData)

    // Validate required fields
    if (!formData.name || !formData.code || !formData.mainTeacher || formData.levels.length === 0) {
      return;
    }

    // Prepare data for backend
    const submitData: Subject = {
      ...formData,
      // Ensure teacher name is set for display
      teacher: formData.teacher || teacherOptions.find(t => t.id === formData.mainTeacher)?.firstName || 'Non assigné',
    };

    onSave(submitData);
  };

  const handleChange = (field: keyof Subject, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLevelToggle = (level: string) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter(l => l !== level)
        : [...prev.levels, level]
    }));
  };

  const handleMainTeacherChange = (teacherId: string) => {
    const teacher = teacherOptions.find(t => t.id === teacherId);
    setFormData(prev => ({
      ...prev,
      mainTeacher: teacherId,
      teacher: teacher ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : ''
    }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties?.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...(prev.specialties || []), specialty]
    }));
  };

  const handleCoefficientChange = (level: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      coefficients: prev.coefficients.map(coeff =>
        coeff.level === level ? { ...coeff, value } : coeff
      )
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
  const getSystemLabel = (system: string) => {
    return educationSystems.find(s => s.value === system)?.label || system;
  };

  if (mode === 'view') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
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
              Code: {formData.code} • Système: {getSystemLabel(formData.educationSystem || 'bilingue')}
              {formData.year && ` • Année: ${formData.year}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center border">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">{formData.weeklyHours}h</p>
                <p className="text-sm text-muted-foreground">par semaine</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg text-center border">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <p className="text-2xl font-bold text-amber-600">{formData.specialties?.length}</p>
                <p className="text-sm text-muted-foreground">Spécialities</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center border">
                <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{(formData.levels?.length || 0)}</p>
                <p className="text-sm text-muted-foreground">niveaux</p>
              </div>
            </div>

            {/* Coefficients par niveau */}
            {coefData?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Coefficients par niveau</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {coefData.map((coeff) => (
                    <div key={coeff.level} className="bg-muted/30 p-3 rounded-lg border">
                      <div className="text-sm font-medium text-center">{coeff.level}</div>
                      <div className="text-2xl font-bold text-primary text-center mt-1">{coeff.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Informations générales</h4>
                  <div className="space-y-2 pl-4">
                    <p><span className="font-medium">Professeur :</span> {formData.teacher || 'Non assigné'}</p>
                    <p><span className="font-medium">Heures/semaine :</span> {formData.weeklyHours}h</p>
                    {/* <p><span className="font-medium">Coefficient :</span> {formData.coefficient}</p> */}
                    <p><span className="font-medium">Système :</span> {getSystemLabel(formData.educationSystem || 'bilingue')}</p>
                    {formData.year && <p><span className="font-medium">Année :</span> {formData.year}</p>}
                  </div>
                </div>

                {formData.specialties && formData.specialties.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Spécialités</h4>
                    <div className="pl-4">
                      <div className="flex flex-wrap gap-1">
                        {formData.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* <div>
                  <h4 className="font-semibold mb-2">Niveaux concernés</h4>
                  <div className="pl-4">
                    {(formData.levels?.length || 0) > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(formData.levels || []).map((level) => (
                          <Badge key={level} variant="secondary" className="text-xs">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucun niveau assigné</p>
                    )}
                  </div>
                </div> */}

                <div>
                  <h4 className="font-semibold mb-2">Statut</h4>
                  <div className="pl-4">
                    <Badge variant={formData.isActive ? "default" : "secondary"}>
                      {formData.isActive ? 'Matière active' : 'Matière inactive'}
                    </Badge>
                    {formData.required && (
                      <Badge variant="outline" className="ml-2">
                        Obligatoire
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {formData.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="pl-4 text-muted-foreground bg-muted/50 p-3 rounded-md">{formData.description}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={() => {/* Switch to edit mode would be handled by parent */ }}>
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
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" style={{ color: formData.color }} />
            {getModalTitle()}
          </DialogTitle>
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
                <Label htmlFor="year">Année scolaire</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  placeholder="ex: 2024-2025"
                />
              </div>

              <div>
                <Label htmlFor="educationSystem">Système éducatif</Label>
                <Select value={formData.educationSystem} onValueChange={(value) => handleChange('educationSystem', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {educationSystems.map((system) => (
                      <SelectItem key={system.value} value={system.value}>
                        {system.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mainTeacher">Professeur principal *</Label>
                <Select
                  value={formData.mainTeacher}
                  onValueChange={handleMainTeacherChange}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Chargement..." : "Sélectionner un professeur"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherOptions.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {`${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                        {teacher.email && ` (${teacher.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weeklyHours">Heures par semaine *</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.weeklyHours}
                  onChange={(e) => handleChange('weeklyHours', parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="coefficient">Coefficient général *</Label>
                <Input
                  id="coefficient"
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={formData.coefficient}
                  onChange={(e) => handleChange('coefficient', parseFloat(e.target.value) || 1)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Coefficient utilisé pour les niveaux sans valeur spécifique
                </p>
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) => handleChange('required', e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="required">Matière obligatoire</Label>
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
                <label key={level} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md border hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={formData.levels.includes(level)}
                    onChange={() => handleLevelToggle(level)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{level}</span>
                </label>
              ))}
            </div>
            {formData.levels.length === 0 && (
              <p className="text-sm text-destructive">Veuillez sélectionner au moins un niveau</p>
            )}
          </div>

          {/* Coefficients par niveau */}
          {formData.levels.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Coefficients par niveau</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.coefficients.map((coeff) => (
                  <div key={coeff.level} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Label className="w-20 font-medium text-sm">{coeff.level}</Label>
                    <Input
                      type="number"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={coeff.value}
                      onChange={(e) => handleCoefficientChange(coeff.level, parseFloat(e.target.value) || 0.5)}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs">
                      {coeff.value}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Les coefficients spécifiques remplacent le coefficient général pour chaque niveau
              </p>
            </div>
          )}

          {/* Spécialités */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Spécialités</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {specialtiesFR.map((specialty) => (
                  <label key={specialty} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md border hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={formData.specialties?.includes(specialty) || false}
                      onChange={() => handleSpecialtyToggle(specialty)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{specialty}</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {specialtiesEN.map((specialty) => (
                  <label key={specialty} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md border hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={formData.specialties?.includes(specialty) || false}
                      onChange={() => handleSpecialtyToggle(specialty)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>
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
                  className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.value ? 'border-foreground scale-110' : 'border-border hover:scale-105'
                    }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-8 h-8 rounded border border-input cursor-pointer"
              />
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="text-sm text-muted-foreground">{formData.color}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={formData.levels.length === 0 || !formData.name || !formData.code || !formData.mainTeacher}
            >
              {mode === 'create' ? 'Créer' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectModal;