import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FRANCOPHONE_LEVELS,
  ANGLOPHONE_LEVELS,
  getAvailableSpecialties
} from '@/constants/cameroonEducation';
import {
  Users,
  BookOpen,
  Building,
  User,
  Settings,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usersService, type Teacher as TeacherOption } from '@/services/usersService';
import { subjectsService } from '@/services/subjectsService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface BulkClassItem {
  name?: string;
  level: string;
  section: string;
  specialty?: string;
  educationSystem: 'francophone' | 'anglophone' | 'bilingue';
  capacity: number;
  teacher: string;
  mainTeacher?: string;
  room: string;
  description?: string;
  year?: string;
  subjects?: string[];
  subjectDetails?: Array<{
    subject: string;
    coefficient: number;
    teacher?: string;
    weeklyHours: number;
    isActive: boolean;
  }>;
}

interface BulkClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: BulkClassItem[]) => Promise<void> | void;
  isSubmitting?: boolean;
  academicYear?: string;
}

interface SectionOverride {
  teacher?: string;
  mainTeacher?: string;
  room?: string;
  capacity?: number;
  enabled: boolean;
}

interface SubjectItem {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  coefficient: number;
  coefficients: Array<{ level: string; value: number }>;
  weeklyHours: number;
  teacher: string;
  educationSystem?: string;
  levels?: string[];
  required?: boolean;
  isActive: boolean;
  color: string;
}

const BulkClassModal: React.FC<BulkClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  academicYear,
  isSubmitting = false
}) => {
  // State for form fields
  const [educationSystem, setEducationSystem] = useState<'francophone' | 'anglophone' | 'bilingue'>('francophone');
  const [level, setLevel] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [defaultTeacher, setDefaultTeacher] = useState<string>('');
  const [defaultMainTeacher, setDefaultMainTeacher] = useState<string>('');
  const [defaultRoom, setDefaultRoom] = useState<string>('');
  const [defaultCapacity, setDefaultCapacity] = useState<number>(30);
  const [description, setDescription] = useState<string>('');
  // const [academicYear, setAcademicYear] = useState<string>('');

  // State for section overrides
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, SectionOverride>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // New state for subjects
  const [availableSubjects, setAvailableSubjects] = useState<SubjectItem[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectCoefficients, setSubjectCoefficients] = useState<Record<string, number>>({});
  const [subjectTeachers, setSubjectTeachers] = useState<Record<string, string>>({});
  const [autoAssignSubjects, setAutoAssignSubjects] = useState<boolean>(true);


  // Load teachers when modal opens
  useEffect(() => {
    const loadTeachers = async () => {
      if (!isOpen) return;
      setLoadingTeachers(true);
      try {
        const teachers = await usersService.getTeachers();
        setTeacherOptions(teachers);
      } catch (error) {
        console.error('Error loading teachers:', error);
      } finally {
        setLoadingTeachers(false);
      }
    };
    loadTeachers();
  }, [isOpen]);

  // Load available subjects when level or education system changes
  useEffect(() => {
    const loadAvailableSubjects = async () => {
      if (!level || !educationSystem) {
        setAvailableSubjects([]);
        setSelectedSubjects([]);
        return;
      }

      setLoadingSubjects(true);
      try {
        const subjects = await subjectsService.getSubjects({
          year: academicYear,
          educationSystem: educationSystem,
          level: level,
          isActive: true
        });
        setAvailableSubjects(subjects);

        // Auto-select all subjects by default
        if (autoAssignSubjects && subjects.length > 0) {
          const subjectIds = subjects.map(subject => subject.id || subject._id).filter(Boolean) as string[];
          setSelectedSubjects(subjectIds);

          // Initialize default coefficients
          const newCoefficients: Record<string, number> = {};
          subjects.forEach(subject => {
            const subjectId = subject.id || subject._id;
            if (subjectId) {
              newCoefficients[subjectId] = getDefaultCoefficient(subject);
            }
          });
          setSubjectCoefficients(newCoefficients);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des matières:', error);
        setAvailableSubjects([]);
        setSelectedSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    if (isOpen && level && educationSystem) {
      loadAvailableSubjects();
    }
  }, [isOpen, level, educationSystem, academicYear, autoAssignSubjects]);

  // Get available levels based on education system
  const getAvailableLevels = useCallback(() => {
    switch (educationSystem) {
      case 'francophone':
        return FRANCOPHONE_LEVELS;
      case 'anglophone':
        return ANGLOPHONE_LEVELS;
      case 'bilingue':
        return [...new Set([...FRANCOPHONE_LEVELS, ...ANGLOPHONE_LEVELS])];
      default:
        return FRANCOPHONE_LEVELS;
    }
  }, [educationSystem]);

  // Get available sections based on education system
  const getAvailableSections = useCallback(() => {
    switch (educationSystem) {
      case 'francophone':
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      case 'anglophone':
        return ['A', 'B', 'C', 'D'];
      case 'bilingue':
        return ['A', 'B', 'C', 'D', 'E'];
      default:
        return ['A', 'B', 'C'];
    }
  }, [educationSystem]);

  // Get default coefficient for a subject
  const getDefaultCoefficient = (subject: SubjectItem): number => {
    if (!subject.coefficients || subject.coefficients.length === 0) {
      return subject.coefficient || 1;
    }

    // Find coefficient for the current level
    const levelCoefficient = subject.coefficients.find(
      (coeff) => coeff.level === level
    );

    return levelCoefficient ? levelCoefficient.value : (subject.coefficient || 1);
  };

  const levels = getAvailableLevels();
  const availableSections = getAvailableSections();
  const specialties = getAvailableSpecialties(educationSystem, level);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLevel('');
      setSpecialty('');
      setSelectedSections([]);
      setDefaultTeacher('');
      setDefaultMainTeacher('');
      setDefaultRoom('');
      setDefaultCapacity(30);
      setDescription('');
      setSectionOverrides({});
      setFormErrors({});
      setSelectedSubjects([]);
      setSubjectCoefficients({});
      setSubjectTeachers({});
    }
  }, [isOpen]);

  // Update section overrides when selected sections change
  useEffect(() => {
    const newOverrides: Record<string, SectionOverride> = {};
    selectedSections.forEach(section => {
      newOverrides[section] = sectionOverrides[section] || { enabled: false };
    });
    setSectionOverrides(newOverrides);
  }, [selectedSections]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle section selection
  const toggleSection = (section: string) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Select all sections
  const selectAllSections = () => {
    setSelectedSections([...availableSections]);
  };

  // Clear all sections
  const clearAllSections = () => {
    setSelectedSections([]);
  };

  // Update section override
  const updateSectionOverride = (section: string, field: keyof SectionOverride, value: any) => {
    setSectionOverrides(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Toggle override for a section
  const toggleOverride = (section: string) => {
    setSectionOverrides(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        enabled: !prev[section]?.enabled
      }
    }));
  };

  // Toggle subject selection
  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Select all subjects
  const selectAllSubjects = () => {
    const allSubjectIds = availableSubjects.map(subject => subject.id || subject._id).filter(Boolean) as string[];
    setSelectedSubjects(allSubjectIds);

    // Initialize coefficients for all subjects
    const newCoefficients: Record<string, number> = {};
    availableSubjects.forEach(subject => {
      const subjectId = subject.id || subject._id;
      if (subjectId) {
        newCoefficients[subjectId] = getDefaultCoefficient(subject);
      }
    });
    setSubjectCoefficients(newCoefficients);
  };

  // Clear all subjects
  const clearAllSubjects = () => {
    setSelectedSubjects([]);
    setSubjectCoefficients({});
    setSubjectTeachers({});
  };

  // Update subject coefficient
  const updateSubjectCoefficient = (subjectId: string, coefficient: number) => {
    setSubjectCoefficients(prev => ({
      ...prev,
      [subjectId]: coefficient
    }));
  };

  // Update subject teacher
  const updateSubjectTeacher = (subjectId: string, teacherId: string) => {
    setSubjectTeachers(prev => ({
      ...prev,
      [subjectId]: teacherId
    }));
  };

  // Get teacher display name
  const getTeacherDisplayName = (teacherId: string): string => {
    const teacher = teacherOptions.find(t => t.id === teacherId);
    if (!teacher) return teacherId;

    const name = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
    return name || teacher.email || teacherId;
  };

  // Get teacher name for display (combines both teacher and mainTeacher)
  const getTeacherNameForDisplay = (teacherId: string, mainTeacherId?: string): string => {
    const teacherName = getTeacherDisplayName(teacherId);
    if (mainTeacherId && mainTeacherId !== teacherId) {
      const mainTeacherName = getTeacherDisplayName(mainTeacherId);
      return `${teacherName} (Titulaire: ${mainTeacherName})`;
    }
    return teacherName;
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!level) errors.level = 'Le niveau est requis';
    if (selectedSections.length === 0) errors.sections = 'Au moins une section doit être sélectionnée';
    if (!defaultTeacher) errors.defaultTeacher = 'Le professeur principal est requis';
    if (!defaultRoom) errors.defaultRoom = 'La salle par défaut est requise';
    if (defaultCapacity < 1 || defaultCapacity > 100) errors.defaultCapacity = 'La capacité doit être entre 1 et 100';

    // Validate overrides
    selectedSections.forEach(section => {
      const override = sectionOverrides[section];
      if (override?.enabled) {
        if (!override.teacher) errors[`teacher_${section}`] = 'Le professeur principal est requis';
        if (!override.room) errors[`room_${section}`] = 'La salle est requise';
        if (override.capacity && (override.capacity < 1 || override.capacity > 100)) {
          errors[`capacity_${section}`] = 'La capacité doit être entre 1 et 100';
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const items: BulkClassItem[] = selectedSections.map(section => {
        const override = sectionOverrides[section];
        const useOverride = override?.enabled;

        // Generate class name
        let className = `${level} ${section}`;
        if (specialty) {
          className += ` (${specialty})`;
        }

        // Get teacher name for the class
        const teacherId = useOverride ? override.teacher! : defaultTeacher;
        const teacherName = getTeacherDisplayName(teacherId);

        // Prepare subject details
        const subjectDetails = selectedSubjects.map(subjectId => {
          const subject = availableSubjects.find(s => s.id === subjectId || s._id === subjectId);
          return {
            subject: subjectId,
            coefficient: subjectCoefficients[subjectId] || getDefaultCoefficient(subject || { coefficient: 1 } as SubjectItem),
            teacher: subjectTeachers[subjectId] || undefined,
            weeklyHours: subject?.weeklyHours || 4,
            isActive: true
          };
        });

        return {
          educationSystem,
          level,
          section,
          specialty: specialties.length > 0 ? specialty : undefined,
          teacher: teacherName, // Store the teacher's name as string
          mainTeacher: useOverride ? override.mainTeacher : defaultMainTeacher || undefined,
          room: useOverride ? override.room! : defaultRoom,
          capacity: useOverride ? (override.capacity || defaultCapacity) : defaultCapacity,
          description: description || undefined,
          year: academicYear,
          name: className.trim(),
          subjects: selectedSubjects,
          subjectDetails
        };
      });

      await onSave(items);
    } catch (error) {
      console.error('Error in bulk creation:', error);
    }
  };

  // Check if form can be submitted
  const canSubmit = level &&
    selectedSections.length > 0 &&
    defaultTeacher &&
    defaultRoom &&
    defaultCapacity >= 1 &&
    defaultCapacity <= 100;

  return (
    <Dialog open={isOpen} onOpenChange={isSubmitting ? undefined : onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Création de classes en masse
          </DialogTitle>
          <DialogDescription>
            Créez plusieurs classes simultanément en sélectionnant un niveau et les sections souhaitées.
            Définissez des valeurs par défaut et personnalisez individuellement si nécessaire.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* System Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Système éducatif
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['francophone', 'anglophone', 'bilingue'] as const).map((system) => (
                <label key={system} className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="educationSystem"
                    value={system}
                    checked={educationSystem === system}
                    onChange={(e) => {
                      setEducationSystem(e.target.value as any);
                      setLevel('');
                      setSpecialty('');
                      setSelectedSections([]);
                      setSelectedSubjects([]);
                    }}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-full p-4 border-2 rounded-lg text-center transition-all",
                    educationSystem === system
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-input bg-background hover:bg-muted/50'
                  )}>
                    <div className="font-medium capitalize">
                      {system === 'francophone' ? 'Francophone' :
                        system === 'anglophone' ? 'Anglophone' : 'Bilingue'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Level and Specialty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Niveau *
              </Label>
              <select
                id="level"
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value);
                  setSpecialty('');
                  setSelectedSubjects([]);
                }}
                className={cn(
                  "w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                  formErrors.level ? 'border-destructive' : 'border-input'
                )}
                required
              >
                <option value="">Sélectionner un niveau</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name} {lvl.cycle && `(${lvl.cycle})`}
                  </option>
                ))}
              </select>
              {formErrors.level && (
                <p className="text-destructive text-sm">{formErrors.level}</p>
              )}
            </div>

            {specialties.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="specialty">Spécialité</Label>
                <select
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Aucune spécialité</option>
                  {specialties.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sections Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Sections à créer *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllSections}
                >
                  Tout sélectionner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllSections}
                >
                  Tout désélectionner
                </Button>
              </div>
            </div>

            {formErrors.sections && (
              <Alert variant="destructive" className="py-3">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{formErrors.sections}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableSections.map((section) => (
                <label
                  key={section}
                  className={cn(
                    "relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all",
                    selectedSections.includes(section)
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-input bg-background hover:bg-muted/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section)}
                    onChange={() => toggleSection(section)}
                    className="sr-only"
                  />
                  <div className="text-lg font-semibold mb-1">Section {section}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedSections.includes(section) ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border border-muted-foreground rounded" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Subjects Selection */}
          {level && educationSystem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Matières à assigner
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoAssignSubjects"
                      checked={autoAssignSubjects}
                      onChange={(e) => setAutoAssignSubjects(e.target.checked)}
                      className="rounded border-input"
                    />
                    <Label htmlFor="autoAssignSubjects" className="text-sm">
                      Auto-assigner
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllSubjects}
                    >
                      Tout sélectionner
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllSubjects}
                    >
                      Tout désélectionner
                    </Button>
                  </div>
                </div>
              </div>

              {loadingSubjects ? (
                <div className="flex items-center justify-center p-8 border rounded-lg">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Chargement des matières...</span>
                </div>
              ) : availableSubjects.length > 0 ? (
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {availableSubjects.map((subject) => {
                      const subjectId = subject.id || subject._id;
                      const isSelected = subjectId ? selectedSubjects.includes(subjectId) : false;
                      const coefficient = subjectId ? subjectCoefficients[subjectId] : getDefaultCoefficient(subject);
                      const teacherId = subjectId ? subjectTeachers[subjectId] : '';

                      return (
                        <div
                          key={subjectId}
                          className={cn(
                            "p-3 border rounded-lg transition-all cursor-pointer",
                            isSelected ? 'border-primary bg-primary/5' : 'border-input bg-background hover:bg-muted/50'
                          )}
                          onClick={() => subjectId && toggleSubject(subjectId)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{subject.name}</span>
                                {subject.color && (
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: subject.color }}
                                  />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Badge variant="outline">{subject.code}</Badge>
                                <span>Coef. {getDefaultCoefficient(subject)}</span>
                                <span>{subject.weeklyHours}h/semaine</span>
                              </div>

                              {isSelected && (
                                <div className="space-y-2 mt-2 p-2 bg-muted/30 rounded">
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`coef-${subjectId}`} className="text-xs w-20">
                                      Coefficient:
                                    </Label>
                                    <Input
                                      id={`coef-${subjectId}`}
                                      type="number"
                                      min="0.5"
                                      max="10"
                                      step="0.5"
                                      value={coefficient}
                                      onChange={(e) => subjectId && updateSubjectCoefficient(subjectId, parseFloat(e.target.value) || 1)}
                                      className="h-6 text-xs"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`teacher-${subjectId}`} className="text-xs w-20">
                                      Professeur:
                                    </Label>
                                    <Select
                                      value={teacherId}
                                      onValueChange={(value) => subjectId && updateSubjectTeacher(subjectId, value)}
                                      disabled={loadingTeachers}
                                    >
                                      <SelectTrigger className="h-6 text-xs" onClick={(e) => e.stopPropagation()}>
                                        <SelectValue placeholder="Par défaut" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={null}>Professeur par défaut</SelectItem>
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
                            </div>
                            <div className={cn(
                              "w-4 h-4 border rounded mt-1 flex-shrink-0",
                              isSelected ? "bg-primary border-primary" : "border-input"
                            )}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {selectedSubjects.length} matière{selectedSubjects.length !== 1 ? 's' : ''} sélectionnée{selectedSubjects.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Aucune matière disponible pour {level} ({educationSystem}).
                    Les classes seront créées sans matières assignées.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Default Values */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Valeurs par défaut
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultTeacher" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Professeur principal *
                </Label>
                <Select
                  value={defaultTeacher}
                  onValueChange={setDefaultTeacher}
                  disabled={loadingTeachers}
                >
                  <SelectTrigger className={cn(
                    formErrors.defaultTeacher ? 'border-destructive' : '',
                    loadingTeachers ? "opacity-50" : ""
                  )}>
                    <SelectValue placeholder={loadingTeachers ? "Chargement..." : "Sélectionner un professeur"} />
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
                {formErrors.defaultTeacher && (
                  <p className="text-destructive text-sm">{formErrors.defaultTeacher}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultMainTeacher" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Professeur titulaire
                </Label>
                <Select
                  value={defaultMainTeacher}
                  onValueChange={setDefaultMainTeacher}
                  disabled={loadingTeachers}
                >
                  <SelectTrigger className={cn(
                    "w-full",
                    loadingTeachers ? "opacity-50" : ""
                  )}>
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

              <div className="space-y-2">
                <Label htmlFor="defaultRoom" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Salle *
                </Label>
                <Input
                  id="defaultRoom"
                  value={defaultRoom}
                  onChange={(e) => setDefaultRoom(e.target.value)}
                  placeholder="Numéro de salle"
                  className={formErrors.defaultRoom ? 'border-destructive' : ''}
                />
                {formErrors.defaultRoom && (
                  <p className="text-destructive text-sm">{formErrors.defaultRoom}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCapacity">Capacité maximale *</Label>
                <Input
                  id="defaultCapacity"
                  type="number"
                  min="1"
                  max="100"
                  value={defaultCapacity}
                  onChange={(e) => setDefaultCapacity(parseInt(e.target.value) || 1)}
                  className={formErrors.defaultCapacity ? 'border-destructive' : ''}
                />
                {formErrors.defaultCapacity && (
                  <p className="text-destructive text-sm">{formErrors.defaultCapacity}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description commune pour toutes les classes..."
              />
            </div>
          </div>

          {/* Section Overrides */}
          {selectedSections.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Personnalisation par section (optionnel)
              </Label>
              <Alert className="bg-muted/50">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Activez la personnalisation pour une section si vous souhaitez lui attribuer des valeurs différentes des valeurs par défaut.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSections.map((section) => (
                  <div
                    key={section}
                    className={cn(
                      "border rounded-lg p-4 space-y-3 transition-all",
                      sectionOverrides[section]?.enabled
                        ? "border-primary bg-primary/5"
                        : "border-input bg-background"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center gap-2">
                        Section {section}
                        {sectionOverrides[section]?.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Personnalisée
                          </Badge>
                        )}
                      </h4>
                      <Button
                        type="button"
                        variant={sectionOverrides[section]?.enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleOverride(section)}
                      >
                        {sectionOverrides[section]?.enabled ? (
                          <><Check className="w-3 h-3 mr-1" /> Activée</>
                        ) : (
                          <><Settings className="w-3 h-3 mr-1" /> Personnaliser</>
                        )}
                      </Button>
                    </div>

                    {sectionOverrides[section]?.enabled && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Professeur principal *</Label>
                          <Select
                            value={sectionOverrides[section]?.teacher || ''}
                            onValueChange={(value) => updateSectionOverride(section, 'teacher', value)}
                            disabled={loadingTeachers}
                          >
                            <SelectTrigger className={cn(
                              formErrors[`teacher_${section}`] ? 'border-destructive' : '',
                              loadingTeachers ? "opacity-50" : ""
                            )}>
                              <SelectValue placeholder={defaultTeacher ? getTeacherDisplayName(defaultTeacher) : "Sélectionner un professeur"} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>{defaultTeacher ? "Utiliser la valeur par défaut" : "Sélectionner un professeur"}</SelectItem>
                              {teacherOptions.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {`${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                                  {teacher.email && ` (${teacher.email})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors[`teacher_${section}`] && (
                            <p className="text-destructive text-xs">{formErrors[`teacher_${section}`]}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Professeur titulaire</Label>
                          <Select
                            value={sectionOverrides[section]?.mainTeacher || ''}
                            onValueChange={(value) => updateSectionOverride(section, 'mainTeacher', value)}
                            disabled={loadingTeachers}
                          >
                            <SelectTrigger className={cn(
                              "w-full",
                              loadingTeachers ? "opacity-50" : ""
                            )}>
                              <SelectValue placeholder={defaultMainTeacher ? getTeacherDisplayName(defaultMainTeacher) : "Sélectionner un professeur"} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>{defaultMainTeacher ? "Utiliser la valeur par défaut" : "Aucun professeur titulaire"}</SelectItem>
                              {teacherOptions.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {`${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                                  {teacher.email && ` (${teacher.email})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Salle *</Label>
                          <Input
                            placeholder={defaultRoom || "Numéro de salle"}
                            value={sectionOverrides[section]?.room || ''}
                            onChange={(e) => updateSectionOverride(section, 'room', e.target.value)}
                            className={formErrors[`room_${section}`] ? 'border-destructive' : ''}
                          />
                          {formErrors[`room_${section}`] && (
                            <p className="text-destructive text-xs">{formErrors[`room_${section}`]}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Capacité</Label>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            placeholder={defaultCapacity.toString()}
                            value={sectionOverrides[section]?.capacity?.toString() || ''}
                            onChange={(e) => updateSectionOverride(section, 'capacity', parseInt(e.target.value) || undefined)}
                            className={formErrors[`capacity_${section}`] ? 'border-destructive' : ''}
                          />
                          {formErrors[`capacity_${section}`] && (
                            <p className="text-destructive text-xs">{formErrors[`capacity_${section}`]}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedSections.length > 0 && level && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Aperçu des classes à créer</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {selectedSections.map((section) => {
                  const override = sectionOverrides[section];
                  const useOverride = override?.enabled;
                  const teacherId = useOverride ? override.teacher! : defaultTeacher;
                  const mainTeacherId = useOverride ? override.mainTeacher : defaultMainTeacher;
                  const teacherName = getTeacherNameForDisplay(teacherId, mainTeacherId);

                  return (
                    <div
                      key={section}
                      className="flex items-center justify-between p-2 border rounded text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {level} {section}
                          {specialty && ` (${specialty})`}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Prof: {teacherName}</div>
                          <div>Salle: {useOverride ? override.room : defaultRoom}</div>
                          <div>Matières: {selectedSubjects.length}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        {useOverride ? (override.capacity || defaultCapacity) : defaultCapacity} places
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <div className="text-sm text-muted-foreground flex-1">
            {selectedSections.length > 0 ? (
              <>
                <strong>{selectedSections.length}</strong> classe{selectedSections.length > 1 ? 's' : ''} seront créée{selectedSections.length > 1 ? 's' : ''}
                {specialty && ` avec la spécialité ${specialty}`}
                {selectedSubjects.length > 0 && ` et ${selectedSubjects.length} matière${selectedSubjects.length > 1 ? 's' : ''}`}
              </>
            ) : (
              "Sélectionnez au moins une section pour continuer"
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Création...
                </>
              ) : (
                `Créer ${selectedSections.length} classe${selectedSections.length > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkClassModal;