import React, { useState, useEffect, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, GraduationCap, Globe, Loader2, AlertCircle, User, Plus, X } from 'lucide-react';
import { EDUCATION_SYSTEMS, FRANCOPHONE_LEVELS, ANGLOPHONE_LEVELS, getAvailableSpecialties } from '@/constants/cameroonEducation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { subjectsService } from '@/services/subjectsService';
import { usersService, type Teacher as TeacherOption } from '@/services/usersService';

interface Coefficient {
  level: string;
  value: number;
}

interface SubjectItem {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  description?: string;
  year?: string;
  baseCoefficient?: number;
  coefficient: number;
  coefficients: Coefficient[];
  weeklyHours: number;
  teacher: string;
  teachers?: Array<{ id: string; name: string; email?: string }>;
  levels?: string[];
  level: string[];
  educationSystem?: string;
  specialty?: string[];
  required?: boolean;
  isActive: boolean;
  color: string;
  mainTeacher?: { id: string; name: string; email?: string };
}

interface Class {
  id?: string;
  name: string;
  level: string;
  section: string;
  specialty?: string;
  educationSystem: 'francophone' | 'anglophone' | 'bilingue';
  capacity: number;
  currentStudents: number;
  teacher: string;
  mainTeacher?: string;
  room: string;
  description?: string;
  subjects: string[];
  subjectDetails?: Array<{
    subject: string;
    coefficient: number;
    teacher?: string;
    weeklyHours: number;
    isActive: boolean;
  }>;
  year?: string;
  status?: string;
  amountFee?: number;
}

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Class) => Promise<void> | void;
  classData?: Class | null;
  mode: 'create' | 'edit' | 'view';
  isLoading?: boolean;
}

// Default form data
const defaultFormData: Class = {
  name: '',
  level: '',
  section: 'A',
  specialty: '',
  educationSystem: 'francophone',
  capacity: 30,
  currentStudents: 0,
  teacher: '',
  room: '',
  description: '',
  subjects: [],
  subjectDetails: [],
  year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  status: 'Open',
  amountFee: 0
};

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  classData,
  mode,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Class>(defaultFormData);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectItem[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [autoGenerateName, setAutoGenerateName] = useState(true);
  const [subjectCoefficients, setSubjectCoefficients] = useState<Record<string, number>>({});
  const [subjectTeachers, setSubjectTeachers] = useState<Record<string, string>>({});

  // Niveaux dynamiques selon le système éducatif
  const getCurrentLevels = useCallback(() => {
    return formData.educationSystem === 'francophone' ? FRANCOPHONE_LEVELS : ANGLOPHONE_LEVELS;
  }, [formData.educationSystem]);

  // Sections dynamiques
  const getSections = useCallback(() => {
    switch (formData.educationSystem) {
      case 'francophone':
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      case 'anglophone':
        return ['A', 'B', 'C', 'D'];
      case 'bilingue':
        return ['A', 'B', 'C', 'D', 'E'];
      default:
        return ['A', 'B', 'C'];
    }
  }, [formData.educationSystem]);

  // Spécialités disponibles selon le niveau
  const availableSpecialties = getAvailableSpecialties(formData.educationSystem, formData.level);

  // Charger les matières disponibles
  const loadAvailableSubjects = useCallback(async () => {
    if (!formData.educationSystem || !formData.level) {
      setAvailableSubjects([]);
      return;
    }

    setLoadingSubjects(true);
    try {
      const subjects = await subjectsService.getSubjects({
        educationSystem: formData.educationSystem,
        level: formData.level,
        isActive: true
      });
      setAvailableSubjects(subjects);

      // Initialize coefficients and teachers for existing subject details
      const newCoefficients: Record<string, number> = {};
      const newTeachers: Record<string, string> = {};

      if (formData.subjectDetails) {
        formData.subjectDetails.forEach(detail => {
          const subject = subjects.find(s => s.id === detail.subject || s._id === detail.subject);
          if (subject) {
            newCoefficients[detail.subject] = detail.coefficient;
            if (detail.teacher) {
              newTeachers[detail.subject] = detail.teacher;
            }
          }
        });
      }

      setSubjectCoefficients(newCoefficients);
      setSubjectTeachers(newTeachers);
    } catch (error) {
      console.error('Erreur lors du chargement des matières:', error);
      setAvailableSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }, [formData.educationSystem, formData.level, formData.subjectDetails]);

  // Charger les professeurs
  const loadTeachers = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      const teachers = await usersService.getTeachers();
      setTeacherOptions(teachers);
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs:', error);
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // Générer le nom de la classe automatiquement
  const generateClassName = useCallback(() => {
    if (!autoGenerateName) return formData.name;

    let className = `${formData.level} ${formData.section}`;
    if (formData.specialty) {
      className += ` (${formData.specialty})`;
    }
    return className.trim();
  }, [formData.level, formData.section, formData.specialty, autoGenerateName, formData.name]);

  // Obtenir le coefficient par défaut pour une matière
  const getDefaultCoefficient = useCallback((subject: SubjectItem): number => {
    if (!subject.coefficients || subject.coefficients.length === 0) {
      return subject.coefficient || 1;
    }

    // Chercher un coefficient spécifique au niveau
    const levelCoefficient = subject.coefficients.find(
      (coeff: Coefficient) => coeff.level === formData.level
    );

    return levelCoefficient ? levelCoefficient.value : (subject.coefficient || 1);
  }, [formData.level]);

  // Effet pour charger les données initiales
  useEffect(() => {
    if (isOpen) {
      if (classData) {
        console.log("classData", classData)
        setFormData(classData);
        setAutoGenerateName(false);
      } else {
        setFormData(defaultFormData);
        setAutoGenerateName(true);
      }
      setFormErrors({});
      loadTeachers();
    }
  }, [classData, isOpen, loadTeachers]);

  // Effet pour charger les matières disponibles
  useEffect(() => {
    if (isOpen && formData.educationSystem && formData.level) {
      loadAvailableSubjects();
    }
  }, [isOpen, formData.educationSystem, formData.level, formData.specialty, loadAvailableSubjects]);

  // Effet pour mettre à jour le nom automatiquement
  useEffect(() => {
    if (autoGenerateName && (formData.level || formData.section || formData.specialty)) {
      const newName = generateClassName();
      setFormData(prev => ({ ...prev, name: newName }));
    }
  }, [formData.level, formData.section, formData.specialty, autoGenerateName, generateClassName]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.level) errors.level = 'Le niveau est requis';
    if (!formData.section) errors.section = 'La section est requise';
    if (!formData.teacher) errors.teacher = 'Le professeur principal est requis';
    if (!formData.room) errors.room = 'La salle est requise';
    if (!formData.capacity || formData.capacity < 1) errors.capacity = 'La capacité doit être au moins 1';
    if (!formData.amountFee || formData.capacity < 0) errors.amountFee = 'La frais de schoolar doit être au moins 1';
    if (formData.currentStudents > formData.capacity) {
      errors.currentStudents = `Ne peut pas dépasser la capacité (${formData.capacity})`;
    }

    // Validation spécialité
    const isTerminalLevel = formData.level === 'Terminale' || formData.level === 'Upper Sixth';
    if (formData.specialty && !isTerminalLevel) {
      errors.specialty = 'La spécialité est seulement autorisée pour Terminale ou Upper Sixth';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare subject details with coefficients and teachers
      const subjectDetails = formData.subjects.map(subjectId => {
        const subject = availableSubjects.find(s => s.id === subjectId || s._id === subjectId);
        return {
          subject: subjectId,
          coefficient: subjectCoefficients[subjectId] || getDefaultCoefficient(subject || { coefficient: 1 } as SubjectItem),
          teacher: subjectTeachers[subjectId] || undefined,
          weeklyHours: subject?.weeklyHours || 4,
          isActive: true
        };
      });

      const finalData = {
        ...formData,
        name: formData.name || generateClassName(),
        subjectDetails,
        // S'assurer que les champs requis par le backend sont présents
        year: formData.year || defaultFormData.year,
        status: formData.status || defaultFormData.status,
        amountFee: formData.amountFee || 0,
        mainTeacher: formData.mainTeacher || undefined
      };

      await onSave(finalData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  const handleChange = (field: keyof Class, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Effacer l'erreur du champ quand il est modifié
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSystemChange = (system: 'francophone' | 'anglophone' | 'bilingue') => {
    setFormData(prev => ({
      ...prev,
      educationSystem: system,
      level: '',
      section: getSections()[0] || 'A',
      specialty: '',
      subjects: [],
      subjectDetails: []
    }));
    setSubjectCoefficients({});
    setSubjectTeachers({});
  };

  const handleLevelChange = (level: string) => {
    setFormData(prev => ({
      ...prev,
      level,
      specialty: '',
      subjects: [],
      subjectDetails: []
    }));
    setSubjectCoefficients({});
    setSubjectTeachers({});
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialty,
      subjects: [],
      subjectDetails: []
    }));
    setSubjectCoefficients({});
    setSubjectTeachers({});
  };

  const handleSubjectToggle = (subject: SubjectItem) => {
    const subjectId = subject.id || subject._id;
    if (!subjectId) return;

    setFormData(prev => {
      const isSelected = prev.subjects.includes(subjectId);

      if (isSelected) {
        // Remove subject
        const newCoefficients = { ...subjectCoefficients };
        const newTeachers = { ...subjectTeachers };
        delete newCoefficients[subjectId];
        delete newTeachers[subjectId];
        setSubjectCoefficients(newCoefficients);
        setSubjectTeachers(newTeachers);

        return {
          ...prev,
          subjects: prev.subjects.filter(s => s !== subjectId)
        };
      } else {
        // Add subject with default coefficient
        const defaultCoefficient = getDefaultCoefficient(subject);
        setSubjectCoefficients(prev => ({
          ...prev,
          [subjectId]: defaultCoefficient
        }));

        return {
          ...prev,
          subjects: [...prev.subjects, subjectId]
        };
      }
    });
  };

  const handleCoefficientChange = (subjectId: string, coefficient: number) => {
    setSubjectCoefficients(prev => ({
      ...prev,
      [subjectId]: coefficient
    }));
  };

  const handleSubjectTeacherChange = (subjectId: string, teacherId: string) => {
    setSubjectTeachers(prev => ({
      ...prev,
      [subjectId]: teacherId
    }));
  };

  const addAllSubjects = () => {
    const newCoefficients: Record<string, number> = { ...subjectCoefficients };

    availableSubjects.forEach(subject => {
      const subjectId = subject.id || subject._id;
      if (subjectId && !formData.subjects.includes(subjectId)) {
        newCoefficients[subjectId] = getDefaultCoefficient(subject);
      }
    });

    setSubjectCoefficients(newCoefficients);
    setFormData(prev => ({
      ...prev,
      subjects: availableSubjects.map(subject => subject.id || subject._id).filter(Boolean) as string[]
    }));
  };

  const removeAllSubjects = () => {
    setFormData(prev => ({ ...prev, subjects: [] }));
    setSubjectCoefficients({});
    setSubjectTeachers({});
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Créer une nouvelle classe';
      case 'edit': return `Modifier ${formData.name}`;
      case 'view': return formData.name;
      default: return 'Classe';
    }
  };

  const handleNameFocus = () => {
    setAutoGenerateName(false);
  };

  const handleAutoGenerateToggle = () => {
    setAutoGenerateName(!autoGenerateName);
    if (!autoGenerateName) {
      // Réactiver la génération automatique
      const newName = generateClassName();
      setFormData(prev => ({ ...prev, name: newName }));
    }
  };

  const getTeacherDisplayName = (teacherId: string): string => {
    const teacher = teacherOptions.find(t => t.id === teacherId);
    if (!teacher) return teacherId;

    const name = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
    return name || teacher.email || teacherId;
  };

  // Mode vue seule
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
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{formData.currentStudents}</p>
                <p className="text-sm text-muted-foreground">Élèves inscrits</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{formData.capacity}</p>
                <p className="text-sm text-muted-foreground">Capacité</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{formData.subjects.length}</p>
                <p className="text-sm text-muted-foreground">Matières</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Badge variant={formData.educationSystem === 'francophone' ? 'default' : 'secondary'}>
                  {formData.educationSystem === 'francophone' ? 'FR' :
                    formData.educationSystem === 'anglophone' ? 'EN' : 'Bilingue'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Système</p>
              </div>
            </div>

            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Informations générales
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex justify-between">
                    <span className="font-medium">Système éducatif:</span>
                    <span className="capitalize">{formData.educationSystem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Niveau:</span>
                    <span>{formData.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Section:</span>
                    <span>{formData.section}</span>
                  </div>
                  {formData.specialty && (
                    <div className="flex justify-between">
                      <span className="font-medium">Spécialité:</span>
                      <span>{formData.specialty}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Professeur:</span>
                    <span>{formData.teacher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Salle:</span>
                    <span>{formData.room}</span>
                  </div>
                  {formData.year && (
                    <div className="flex justify-between">
                      <span className="font-medium">Année scolaire:</span>
                      <span>{formData.year}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Matières enseignées</h4>
                <div className="pl-6">
                  {formData.subjects.length > 0 ? (
                    <div className="space-y-2">
                      {formData.subjects.map((subjectId, index) => {
                        const subject = availableSubjects.find(s => s.id === subjectId || s._id === subjectId);
                        const subjectDetail = formData.subjectDetails?.find(d => d.subject === subjectId);
                        const coefficient = subjectDetail?.coefficient || subject?.coefficient || 1;
                        const teacherId = subjectDetail?.teacher;
                        const teacherName = teacherId ? getTeacherDisplayName(teacherId) : undefined;

                        return (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{subject?.name || 'Matière'}</div>
                              <div className="text-xs text-muted-foreground">
                                Coef. {coefficient}
                                {teacherName && ` • ${teacherName}`}
                              </div>
                            </div>
                            {subject?.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: subject.color }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Aucune matière assignée</p>
                  )}
                </div>

                {formData.description && (
                  <>
                    <h4 className="font-semibold">Description</h4>
                    <p className="pl-6 text-muted-foreground">{formData.description}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                // Switch to edit mode
                const event = new CustomEvent('editMode', { detail: { classData: formData } });
                window.dispatchEvent(event);
              }}
            >
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? (
              <><Users className="w-5 h-5" /> {getModalTitle()}</>
            ) : (
              <><BookOpen className="w-5 h-5" /> {getModalTitle()}</>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Configurez une nouvelle classe avec son système éducatif et ses matières'
              : 'Modifiez les informations de la classe'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Affichage des erreurs générales */}
          {Object.keys(formErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Veuillez corriger les erreurs dans le formulaire
              </AlertDescription>
            </Alert>
          )}

          {/* Système éducatif */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Système éducatif
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['francophone', 'anglophone', 'bilingue'] as const).map((system) => (
                <label key={system} className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="educationSystem"
                    value={system}
                    checked={formData.educationSystem === system}
                    onChange={(e) => handleSystemChange(e.target.value as typeof system)}
                    className="sr-only"
                  />
                  <div className={`
                    w-full p-4 border-2 rounded-lg text-center transition-all
                    ${formData.educationSystem === system
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-input bg-background hover:bg-muted/50'
                    }
                  `}>
                    <div className="font-medium capitalize">
                      {system === 'francophone' ? 'Francophone' :
                        system === 'anglophone' ? 'Anglophone' : 'Bilingue'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {system === 'francophone' ? 'Système français' :
                        system === 'anglophone' ? 'Système anglais' : 'Double système'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Informations de base
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom de la classe */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="name">Nom de la classe *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAutoGenerateToggle}
                    className="h-auto p-0 text-xs"
                  >
                    {autoGenerateName ? 'Génération auto ✓' : 'Générer automatiquement'}
                  </Button>
                </div>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onFocus={handleNameFocus}
                  placeholder="Nom de la classe"
                  disabled={autoGenerateName}
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && (
                  <p className="text-destructive text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Niveau */}
              <div>
                <Label htmlFor="level">Niveau *</Label>
                <Select
                  value={formData.level}
                  onValueChange={handleLevelChange}
                >
                  <SelectTrigger className={formErrors.level ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentLevels().map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name} {level.cycle && `(${level.cycle})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.level && (
                  <p className="text-destructive text-xs mt-1">{formErrors.level}</p>
                )}
              </div>

              {/* Spécialité */}
              {availableSpecialties.length > 0 && (
                <div>
                  <Label htmlFor="specialty">Spécialité</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={handleSpecialtyChange}
                  >
                    <SelectTrigger className={formErrors.specialty ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Sélectionner une spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Aucune spécialité</SelectItem>
                      {availableSpecialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.specialty && (
                    <p className="text-destructive text-xs mt-1">{formErrors.specialty}</p>
                  )}
                </div>
              )}

              {/* Section */}
              <div>
                <Label htmlFor="section">Section *</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => handleChange('section', value)}
                >
                  <SelectTrigger className={formErrors.section ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner une section" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSections().map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.section && (
                  <p className="text-destructive text-xs mt-1">{formErrors.section}</p>
                )}
              </div>

              {/* Professeur principal */}
              {/* <div>
                <Label htmlFor="teacher">Professeur principal *</Label>
                <Input
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => handleChange('teacher', e.target.value)}
                  placeholder="Nom du professeur principal"
                  className={formErrors.teacher ? 'border-destructive' : ''}
                />
                {formErrors.teacher && (
                  <p className="text-destructive text-xs mt-1">{formErrors.teacher}</p>
                )}
              </div> */}

              {/* Professeur titulaire */}
              <div>
                <Label htmlFor="mainTeacher">Professeur titulaire</Label>
                <Select
                  value={formData.mainTeacher || ''}
                  onValueChange={(value) => {
                    handleChange('teacher', value)
                    handleChange('mainTeacher', value);
                  }}
                  disabled={loadingTeachers}
                >
                  <SelectTrigger className={loadingTeachers ? "opacity-50" : ""}>
                    <SelectValue placeholder={loadingTeachers ? "Chargement..." : "Sélectionner un professeur"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Aucun professeur titulaire</SelectItem>
                    {teacherOptions.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {`${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                        {teacher.email && ` (${teacher.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Salle */}
              <div>
                <Label htmlFor="room">Salle *</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => handleChange('room', e.target.value)}
                  placeholder="Numéro ou nom de salle"
                  className={formErrors.room ? 'border-destructive' : ''}
                />
                {formErrors.room && (
                  <p className="text-destructive text-xs mt-1">{formErrors.room}</p>
                )}
              </div>

              {/* Capacité */}
              <div>
                <Label htmlFor="capacity">Capacité maximale *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
                  className={formErrors.capacity ? 'border-destructive' : ''}
                />
                {formErrors.capacity && (
                  <p className="text-destructive text-xs mt-1">{formErrors.capacity}</p>
                )}
              </div>

              {/* Étudiants actuels (édition seulement) */}
              {mode === 'edit' && (
                <div>
                  <Label htmlFor="amountFee">Frais schoolar</Label>
                  <Input
                    id="amountFee"
                    type="number"
                    min="0"
                    // max={formData.capacity}
                    value={formData.amountFee}
                    onChange={(e) => handleChange('amountFee', parseInt(e.target.value) || 0)}
                    className={formErrors.amountFee ? 'border-destructive' : ''}
                  />
                  {formErrors.amountFee && (
                    <p className="text-destructive text-xs mt-1">{formErrors.amountFee}</p>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description optionnelle de la classe..."
                rows={3}
              />
            </div>
          </div>

          {/* Matières */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Matières enseignées
              </h4>
              <div className="flex gap-2">
                {availableSubjects.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAllSubjects}
                  >
                    Tout ajouter
                  </Button>
                )}
                {formData.subjects.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeAllSubjects}
                  >
                    Tout retirer
                  </Button>
                )}
              </div>
            </div>

            {loadingSubjects ? (
              <div className="flex items-center justify-center p-8 border rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Chargement des matières...</span>
              </div>
            ) : availableSubjects.length > 0 ? (
              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium mb-3 text-muted-foreground">
                  Matières disponibles pour {formData.level} ({formData.educationSystem})
                </h5>
                <div className="space-y-3 max-h-96 overflow-y-auto p-2">
                  {availableSubjects.map((subject) => {
                    const subjectId = subject.id || subject._id;
                    const isSelected = subjectId ? formData.subjects.includes(subjectId) : false;
                    const coefficient = subjectId ? subjectCoefficients[subjectId] : getDefaultCoefficient(subject);
                    const teacherId = subjectId ? subjectTeachers[subjectId] : '';

                    return (
                      <div
                        key={subjectId}
                        className={`p-3 border rounded-lg transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-input bg-background'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSubjectToggle(subject)}
                            className="mt-1 rounded border-input"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{subject.name}</span>
                                {subject.color && (
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: subject.color }}
                                  />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {subject.code}
                                </Badge>
                                {subject.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Obligatoire
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {subject.description && (
                              <p className="text-xs text-muted-foreground mt-1">{subject.description}</p>
                            )}

                            {isSelected && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 p-3 bg-muted/30 rounded">
                                {/* Coefficient */}
                                <div className="space-y-2">
                                  <Label htmlFor={`coefficient-${subjectId}`} className="text-xs">
                                    Coefficient
                                  </Label>
                                  <Input
                                    id={`coefficient-${subjectId}`}
                                    type="number"
                                    min="0.5"
                                    max="10"
                                    step="0.5"
                                    value={coefficient}
                                    onChange={(e) => handleCoefficientChange(subjectId!, parseFloat(e.target.value) || 1)}
                                    className="h-8 text-sm"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Défaut: {getDefaultCoefficient(subject)}
                                  </p>
                                </div>

                                {/* Professeur pour la matière */}
                                <div className="space-y-2">
                                  <Label htmlFor={`teacher-${subjectId}`} className="text-xs">
                                    Professeur assigné
                                  </Label>
                                  <Select
                                    value={teacherId}
                                    onValueChange={(value) => handleSubjectTeacherChange(subjectId!, value)}
                                    disabled={loadingTeachers}
                                  >
                                    <SelectTrigger className="h-8 text-sm">
                                      <SelectValue placeholder="Sélectionner un professeur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={null}>Aucun professeur spécifique</SelectItem>
                                      {teacherOptions.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                          {`${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                                          {teacher.email && ` (${teacher.email})`}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                Coef. {getDefaultCoefficient(subject)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {subject.weeklyHours}h/semaine
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : formData.level ? (
              <div className="border rounded-lg p-6 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">
                  Aucune matière disponible pour {formData.level} ({formData.educationSystem})
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // You can add logic to create subjects here if needed
                    window.dispatchEvent(new CustomEvent('openSubjectCreation'));
                  }}
                >
                  Créer des matières
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  Sélectionnez un niveau pour voir les matières disponibles
                </p>
              </div>
            )}

            {/* Matières sélectionnées */}
            {formData.subjects.length > 0 && (
              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium mb-3">
                  Matières sélectionnées ({formData.subjects.length})
                </h5>
                <div className="space-y-2">
                  {formData.subjects.map((subjectId) => {
                    const subject = availableSubjects.find(s => s.id === subjectId || s._id === subjectId);
                    const coefficient = subjectCoefficients[subjectId] || getDefaultCoefficient(subject || { coefficient: 1 } as SubjectItem);
                    const teacherId = subjectTeachers[subjectId];
                    const teacherName = teacherId ? getTeacherDisplayName(teacherId) : null;

                    return (
                      <div
                        key={subjectId}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{subject?.name || 'Matière'}</span>
                          <Badge variant="outline" className="text-xs">
                            Coef. {coefficient}
                          </Badge>
                          {teacherName && (
                            <Badge variant="secondary" className="text-xs">
                              {teacherName}
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSubjectToggle(subject || { id: subjectId } as SubjectItem)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {mode === 'create' ? 'Créer la classe' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassModal;