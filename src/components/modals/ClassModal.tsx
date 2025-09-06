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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, GraduationCap, Globe } from 'lucide-react';
import { EDUCATION_SYSTEMS, FRANCOPHONE_LEVELS, ANGLOPHONE_LEVELS, getAvailableSpecialties } from '@/constants/cameroonEducation';
import { subjectSeedService } from '@/services/subjectSeedService';

interface Class {
  id?: string;
  name: string;
  level: string;
  section: string;
  specialty?: string;
  educationSystem: 'francophone' | 'anglophone';
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
    specialty: '',
    educationSystem: 'francophone',
    capacity: 30,
    currentStudents: 0,
    teacher: '',
    room: '',
    description: '',
    subjects: [],
  });

  // Niveaux dynamiques selon le système éducatif
  const getCurrentLevels = () => {
    return formData.educationSystem === 'francophone' ? FRANCOPHONE_LEVELS : ANGLOPHONE_LEVELS;
  };

  // Sections dynamiques
  const getSections = () => {
    if (formData.educationSystem === 'francophone') {
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    } else {
      return ['A', 'B', 'C', 'D'];
    }
  };

  // Spécialités disponibles selon le niveau
  const availableSpecialties = getAvailableSpecialties(formData.educationSystem, formData.level);
  
  // Matières suggérées depuis la base de données
  const [suggestedSubjects, setSuggestedSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Charger les matières suggérées quand le système, niveau ou spécialité change
  useEffect(() => {
    const loadSuggestedSubjects = async () => {
      if (!formData.educationSystem || !formData.level) return;
      
      setLoadingSubjects(true);
      try {
        const subjects = await subjectSeedService.getSuggestedSubjects({
          educationSystem: formData.educationSystem,
          level: formData.level,
          specialty: formData.specialty
        });
        setSuggestedSubjects(subjects);
      } catch (error) {
        console.error('Erreur lors du chargement des matières suggérées:', error);
        setSuggestedSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSuggestedSubjects();
  }, [formData.educationSystem, formData.level, formData.specialty]);

  useEffect(() => {
    if (classData) {
      setFormData({ ...classData });
    } else {
      setFormData({
        name: '',
        level: '',
        section: '',
        specialty: '',
        educationSystem: 'francophone',
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
    let className = `${formData.level} ${formData.section}`;
    if (formData.specialty) {
      className += ` (${formData.specialty})`;
    }
    
    const finalData = {
      ...formData,
      name: className.trim(),
      // Ajouter les champs requis par le backend
      year: '2024-2025', // Année académique par défaut
      status: 'Open',
      amountFee: 0
    };
    onSave(finalData);
  };

  const handleChange = (field: keyof Class, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subject: any) => {
    const subjectName = typeof subject === 'string' ? subject : subject.name;
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectName)
        ? prev.subjects.filter(s => s !== subjectName)
        : [...prev.subjects, subjectName]
    }));
  };

  const handleSystemChange = (system: 'francophone' | 'anglophone') => {
    setFormData(prev => ({
      ...prev,
      educationSystem: system,
      level: '',
      section: '',
      specialty: '',
      subjects: []
    }));
  };

  const handleLevelChange = (level: string) => {
    setFormData(prev => ({
      ...prev,
      level,
      specialty: '',
      subjects: []
    }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialty,
      subjects: []
    }));
  };

  const addAllSuggestedSubjects = () => {
    const subjectNames = suggestedSubjects.map(s => s.name);
    setFormData(prev => ({
      ...prev,
      subjects: [...new Set([...prev.subjects, ...subjectNames])]
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
                  <p><span className="font-medium">Système :</span> 
                    <Badge variant={formData.educationSystem === 'francophone' ? 'default' : 'secondary'} className="ml-2">
                      {formData.educationSystem === 'francophone' ? 'Francophone' : 'Anglophone'}
                    </Badge>
                  </p>
                  <p><span className="font-medium">Niveau :</span> {formData.level}</p>
                  <p><span className="font-medium">Section :</span> {formData.section}</p>
                  {formData.specialty && (
                    <p><span className="font-medium">Spécialité :</span> {formData.specialty}</p>
                  )}
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
          {/* Système éducatif */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Système éducatif
            </h4>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="educationSystem"
                  value="francophone"
                  checked={formData.educationSystem === 'francophone'}
                  onChange={(e) => handleSystemChange(e.target.value as 'francophone')}
                  className="rounded border-input"
                />
                <span>Système Francophone</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="educationSystem"
                  value="anglophone"
                  checked={formData.educationSystem === 'anglophone'}
                  onChange={(e) => handleSystemChange(e.target.value as 'anglophone')}
                  className="rounded border-input"
                />
                <span>Système Anglophone</span>
              </label>
            </div>
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Informations de base
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Niveau *</Label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Sélectionner un niveau</option>
                  {getCurrentLevels().map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name} ({level.cycle})
                    </option>
                  ))}
                </select>
              </div>
              
              {availableSpecialties.length > 0 && (
                <div>
                  <Label htmlFor="specialty">Spécialité *</Label>
                  <select
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => handleSpecialtyChange(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Sélectionner une spécialité</option>
                    {availableSpecialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  {getSections().map((section) => (
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
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Matières enseignées
              </h4>
              {suggestedSubjects.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAllSuggestedSubjects}
                >
                  Ajouter matières suggérées
                </Button>
              )}
            </div>
            
            {loadingSubjects ? (
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Chargement des matières...</p>
              </div>
            ) : suggestedSubjects.length > 0 ? (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h5 className="text-sm font-medium mb-3 text-muted-foreground">
                  Matières disponibles pour {formData.educationSystem === 'francophone' ? 'le système francophone' : 'le système anglophone'}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedSubjects.map((subject) => (
                    <label key={subject.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject.name)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="rounded border-input"
                      />
                      <span className="text-sm flex-1">{subject.name}</span>
                      <Badge variant={subject.required ? 'default' : 'secondary'} className="text-xs">
                        Coef. {subject.coefficient}
                      </Badge>
                      {subject.required && (
                        <Badge variant="destructive" className="text-xs">
                          Obligatoire
                        </Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Aucune matière disponible pour ce niveau.
                  <br />
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm" 
                    className="mt-2"
                    onClick={async () => {
                      try {
                        await subjectSeedService.seedCameroonianSubjects();
                        // Recharger les matières après création
                        const subjects = await subjectSeedService.getSuggestedSubjects({
                          educationSystem: formData.educationSystem,
                          level: formData.level,
                          specialty: formData.specialty
                        });
                        setSuggestedSubjects(subjects);
                      } catch (error) {
                        console.error('Erreur lors de la création des matières:', error);
                      }
                    }}
                  >
                    Créer les matières du système camerounais
                  </Button>
                </p>
              </div>
            )}
            
            {formData.subjects.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Matières sélectionnées ({formData.subjects.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject) => (
                    <Badge key={subject} variant="outline" className="cursor-pointer" onClick={() => handleSubjectToggle(subject)}>
                      {subject} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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