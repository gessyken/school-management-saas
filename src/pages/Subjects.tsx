import React, { useEffect, useState } from 'react';
import { Plus, Search, BookOpen, Users, Clock, Edit, Trash2, Eye, Filter, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SubjectModal from '@/components/modals/SubjectModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';
import { subjectsService } from '@/services/subjectsService';
import settingsService from '@/services/settingsService';
import { AcademicYear } from '@/types/settings';
import { Label } from '@/components/ui/label';

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
  coefficients: Coefficient[]; // Array of coefficient objects
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

const Subjects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSystem, setFilterSystem] = useState('all');
  const [filterAcademicYear, setFilterAcademicYear] = useState('all');
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subjectModal, setSubjectModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    subject?: SubjectItem | null;
  }>({
    isOpen: false,
    mode: 'create',
    subject: null
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subject?: SubjectItem | null;
  }>({
    isOpen: false,
    subject: null
  });
  const { toast } = useToast();
  const [currentAcademicYears, setCurrentAcademicYears] = useState<AcademicYear>();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  // Load academic years on component mount
  useEffect(() => {
    getCurrentAcademicYear();
  }, []);

  const getCurrentAcademicYear = async () => {
    try {
      const academicYearsData = await settingsService.getAcademicYears();
      console.log("academicYearsData", academicYearsData);
      setAcademicYears(academicYearsData);
      const currentYear = academicYearsData.find(t => t.isCurrent);
      setCurrentAcademicYears(currentYear);

      // Set the current academic year as default filter
      if (currentYear) {
        setFilterAcademicYear(currentYear.name);
      } else if (academicYearsData.length > 0) {
        // Fallback to first available year
        setFilterAcademicYear(academicYearsData[0].name);
      }
    } catch (error) {
      console.error('Error loading Annee:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les années académiques',
        variant: "destructive"
      });
    }
  };

  const loadSubjects = async (filters = {}) => {
    try {
      setIsLoading(true);

      // Prepare filter parameters including academic year
      const filterParams = {
        search: searchTerm || undefined,
        year: filterAcademicYear !== 'all' ? filterAcademicYear : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        system: filterSystem !== 'all' ? filterSystem : undefined,
        ...filters
      };

      console.log("Loading subjects with filters:", filterParams);

      const data = await subjectsService.getSubjects(filterParams);
      console.log("API response data:", data);

      const normalized: SubjectItem[] = (data || []).map((s: any) => ({
        id: s._id || s.id,
        name: s.name,
        code: s.code,
        description: s.description || '',
        year: s.year,
        baseCoefficient: s.baseCoefficient ?? s.coefficient ?? 1,
        coefficient: Number(s.coefficient ?? s.baseCoefficient ?? 1),
        coefficients: s.coefficients || [],
        coefficientsByLevel: s.coefficientsByLevel || {},
        weeklyHours: Number(s.weeklyHours ?? 0),
        teacher: s.mainTeacher?.firstName || s.teacher || 'Non assigné',
        teachers: Array.isArray(s.teachers) ? s.teachers.map((t: any) => ({
          id: t._id || t.id,
          name: `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || 'Inconnu',
          email: t.email
        })) : [],
        levels: Array.isArray(s.levels) ? s.levels : [],
        level: Array.isArray(s.levels) ? s.levels : Array.isArray(s.level) ? s.level : [],
        educationSystem: s.educationSystem || 'bilingue',
        specialty: Array.isArray(s.specialty) ? s.specialty : Array.isArray(s.specialties) ? s.specialties : [],
        required: !!s.required,
        isActive: s.isActive !== undefined ? !!s.isActive : true,
        color: s.color || '#3B82F6',
        mainTeacher: s.mainTeacher ? {
          id: s.mainTeacher._id || s.mainTeacher.id,
          name: `${s.mainTeacher.firstName || ''} ${s.mainTeacher.lastName || ''}`.trim() || s.mainTeacher.name,
          email: s.mainTeacher.email
        } : undefined
      }));

      console.log("Normalized subjects:", normalized);
      setSubjects(normalized);
    } catch (error: any) {
      console.error('Error loading subjects:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les matières. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load subjects when component mounts
  useEffect(() => {
    loadSubjects();
  }, []);

  // Debounced search effect with all filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSubjects();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterAcademicYear, filterStatus, filterSystem]);

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', subject?: SubjectItem) => {
    setSubjectModal({ isOpen: true, mode, subject });
  };

  const handleCloseModal = () => {
    setSubjectModal({ isOpen: false, mode: 'create', subject: null });
  };

  const handleSaveSubject = async (subjectData: any) => {
    console.log("Saving subject:", subjectModal.mode, subjectData);
    try {
      if (subjectModal.mode === 'create') {
        const response = await subjectsService.createSubject(subjectData);
        const newSubject = response.subject || response;
        setSubjects(prev => [...prev, { ...subjectData, id: newSubject.id || newSubject._id }]);
        toast({
          title: "Matière créée",
          description: `La matière ${subjectData.name} a été créée avec succès.`,
        });
        loadSubjects(); // Reload to get fresh data with populated fields
      } else if (subjectModal.mode === 'edit' && subjectData.id) {
        console.log("Updating subject");
        const response = await subjectsService.updateSubject(subjectData.id, subjectData);
        const updatedSubject = response.subject || response;
        setSubjects(prev => prev.map(s =>
          s.id === subjectData.id ? { ...subjectData, ...updatedSubject } : s
        ));
        toast({
          title: "Matière modifiée",
          description: `La matière ${subjectData.name} a été mise à jour.`,
        });
      }
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la sauvegarde.';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubject = (subject: SubjectItem) => {
    setDeleteModal({ isOpen: true, subject });
  };

  const confirmDeleteSubject = async () => {
    if (deleteModal.subject?.id) {
      try {
        await subjectsService.deleteSubject(deleteModal.subject.id);
        setSubjects(prev => prev.filter(s => s.id !== deleteModal.subject!.id));
        toast({
          title: "Matière supprimée",
          description: `La matière ${deleteModal.subject.name} a été supprimée.`,
        });
      } catch (error: any) {
        console.error('Error deleting subject:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la suppression.';
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
    setDeleteModal({ isOpen: false, subject: null });
  };

  const handleToggleStatus = async (subject: SubjectItem) => {
    if (!subject.id) return;

    try {
      const response = await subjectsService.toggleActiveStatus(subject.id);
      const updatedSubject = response.subject || response;
      setSubjects(prev => prev.map(s =>
        s.id === subject.id ? { ...s, isActive: !s.isActive } : s
      ));
      toast({
        title: `Matière ${!subject.isActive ? 'activée' : 'désactivée'}`,
        description: `La matière ${subject.name} a été ${!subject.isActive ? 'activée' : 'désactivée'}.`,
      });
    } catch (error: any) {
      console.error('Error toggling subject status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la matière.",
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    try {
      // This would call an export service when implemented
      toast({
        title: "Export en cours",
        description: "Préparation de l'export des matières...",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les matières.",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.xlsx,.xls';
      input.style.display = 'none';

      input.onchange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          toast({
            title: "Aucun fichier sélectionné",
            description: "Veuillez sélectionner un fichier CSV à importer.",
            variant: "destructive"
          });
          return;
        }

        // Validate file type
        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
          toast({
            title: "Format de fichier non supporté",
            description: "Veuillez sélectionner un fichier CSV ou Excel.",
            variant: "destructive"
          });
          return;
        }

        // Show loading toast
        const loadingToast = toast({
          title: "Import en cours",
          description: "Traitement du fichier...",
        });

        try {
          // Read and parse the CSV file
          const text = await file.text();
          const subjectsArray = parseCSVToSubjects(text);

          if (subjectsArray.length === 0) {
            toast({
              title: "Aucune donnée valide",
              description: "Le fichier ne contient aucune matière valide.",
              variant: "destructive"
            });
            return;
          }
          console.log("subjectsArray", subjectsArray)
          // Send to backend bulk endpoint
          const response = await subjectsService.createManySubjects(subjectsArray);

          // Show success message
          toast({
            title: "Import réussi",
            description: `${response.subjects?.length || response.createdCount || subjectsArray.length} matières importées avec succès.`,
          });

          // Reload the subjects list
          loadSubjects();

        } catch (error: any) {
          console.error('Import error:', error);

          // Handle partial success (207 status)
          if (error.response?.status === 207) {
            const errorData = error.response.data;
            toast({
              title: "Import partiellement réussi",
              description: `${errorData.createdCount} matières créées, ${errorData.errors?.length || 0} erreurs.`,
              variant: "default"
            });
          } else {
            const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'import du fichier.';
            toast({
              title: "Erreur d'import",
              description: errorMessage,
              variant: "destructive"
            });
          }
        } finally {
          // Clean up
          document.body.removeChild(input);
        }
      };

      // Add to DOM and trigger click
      document.body.appendChild(input);
      input.click();

    } catch (error) {
      console.error('Error in handleImport:', error);
      toast({
        title: "Erreur d'import",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive"
      });
    }
  };

  // CSV parsing function
  const parseCSVToSubjects = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length <= 1) {
      return [];
    }

    const headers = lines[0].split(',').map(header =>
      header.trim().toLowerCase().replace(/\s+/g, '')
    );

    const subjects = [];
    const errors: string[] = [];

    // Valid enums from schema
    const validLevels = [
      '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale',
      'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'
    ];

    const validSystems = ['francophone', 'anglophone', 'bilingue', 'both'];

    const validSpecialties = [
      'A', 'B', 'C', 'D', 'E', 'F', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3', 'TI',
      'Arts', 'Commercial', 'Industrial', 'Science', 'GCE A-Level Arts', 'GCE A-Level Science'
    ];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const subjectData: any = {};
      const rowErrors: string[] = [];

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';

        switch (header) {
          case 'name':
            subjectData.name = value;
            if (!value || value.length > 100) {
              rowErrors.push(`Name is required and must be ≤100 characters (row ${i + 1})`);
            }
            break;
          case 'code':
            subjectData.code = value.toUpperCase();
            if (!value || value.length > 10) {
              rowErrors.push(`Code is required and must be ≤10 characters (row ${i + 1})`);
            }
            break;
          case 'year':
            subjectData.year = value;
            if (!value || !/^\d{4}-\d{4}$/.test(value)) {
              rowErrors.push(`Year must be in format YYYY-YYYY (row ${i + 1})`);
            }
            break;
          case 'description':
            subjectData.description = value;
            if (value.length > 500) {
              rowErrors.push(`Description must be ≤500 characters (row ${i + 1})`);
            }
            break;
          case 'weeklyhours':
            const weeklyHours = Number(value);
            if (isNaN(weeklyHours) || weeklyHours < 1 || weeklyHours > 20) {
              rowErrors.push(`Weekly hours must be between 1-20 (row ${i + 1})`);
            } else {
              subjectData.weeklyHours = weeklyHours;
            }
            break;
          case 'maintteacher':
          case 'maintteacherid':
          case 'mainTeacher':
            if (value) {
              console.log("value T", value)
              subjectData.mainTeacher = value;
            }
            break;
          case 'teachers':
            if (value) {
              const teacherIds = value.split(';').map((id: string) => id.trim()).filter((id: string) => id);
              subjectData.teachers = teacherIds;
            } else {
              subjectData.teachers = [];
            }
            break;
          case 'levels':
            if (value) {
              const levels = value.split(';').map((level: string) => level.trim()).filter((level: string) => level);
              const invalidLevels = levels.filter((level: string) => !validLevels.includes(level));
              if (invalidLevels.length > 0) {
                rowErrors.push(`Invalid levels: ${invalidLevels.join(', ')}. Valid: ${validLevels.join(', ')} (row ${i + 1})`);
              } else {
                subjectData.levels = levels;
              }
            } else {
              subjectData.levels = [];
            }
            break;
          case 'coefficients':
            if (value) {
              try {
                subjectData.coefficients = value.split(';').map((coef: string) => {
                  const [level, coefValue] = coef.split(':');
                  const numericValue = Number(coefValue?.trim());

                  if (!level?.trim() || isNaN(numericValue) || numericValue < 0.5 || numericValue > 10) {
                    rowErrors.push(`Invalid coefficient format or value: ${coef}. Must be Level:Value (0.5-10) (row ${i + 1})`);
                    return null;
                  }

                  return {
                    level: level.trim(),
                    value: numericValue
                  };
                }).filter((coef: any) => coef !== null);
              } catch (e) {
                rowErrors.push(`Invalid coefficients format (row ${i + 1})`);
                subjectData.coefficients = [];
              }
            } else {
              subjectData.coefficients = [];
            }
            break;
          case 'educationsystem':
            subjectData.educationSystem = value.toLowerCase();
            if (value && !validSystems.includes(value.toLowerCase())) {
              rowErrors.push(`Invalid education system: ${value}. Valid: ${validSystems.join(', ')} (row ${i + 1})`);
            } else {
              subjectData.educationSystem = value || 'bilingue';
            }
            break;
          case 'specialties':
            if (value) {
              const specialties = value.split(';').map((spec: string) => spec.trim()).filter((spec: string) => spec);
              const invalidSpecialties = specialties.filter((spec: string) => !validSpecialties.includes(spec));
              if (invalidSpecialties.length > 0) {
                rowErrors.push(`Invalid specialties: ${invalidSpecialties.join(', ')} (row ${i + 1})`);
              } else {
                subjectData.specialties = specialties;
              }
            } else {
              subjectData.specialties = [];
            }
            break;
          case 'isrequired':
          case 'required':
            subjectData.isRequired = value.toLowerCase() === 'true' || value === '1';
            break;
          case 'isactive':
          case 'active':
            subjectData.isActive = value.toLowerCase() !== 'false' && value !== '0';
            break;
          case 'color':
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) {
              rowErrors.push(`Invalid color format: ${value}. Must be #RRGGBB (row ${i + 1})`);
            } else {
              subjectData.color = value || '#3B82F6';
            }
            break;
        }
      });

      // Validate level-system compatibility
      if (subjectData.levels && subjectData.levels.length > 0 && subjectData.educationSystem) {
        const incompatibleLevels = subjectData.levels.filter((level: string) => {
          const francophoneLevels = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'];
          const anglophoneLevels = ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'];

          if (subjectData.educationSystem === 'francophone' && !francophoneLevels.includes(level)) {
            return true;
          }
          if (subjectData.educationSystem === 'anglophone' && !anglophoneLevels.includes(level)) {
            return true;
          }
          return false;
        });

        if (incompatibleLevels.length > 0) {
          rowErrors.push(`Levels ${incompatibleLevels.join(', ')} are incompatible with ${subjectData.educationSystem} system (row ${i + 1})`);
        }
      }

      // Validate required fields
      if (!subjectData.name) {
        rowErrors.push(`Name is required (row ${i + 1})`);
      }
      if (!subjectData.code) {
        rowErrors.push(`Code is required (row ${i + 1})`);
      }
      if (!subjectData.year) {
        rowErrors.push(`Year is required (row ${i + 1})`);
      }
      console.log("subjectData", i + 1, " Test ", subjectData)
      if (!subjectData.mainTeacher) {
        rowErrors.push(`Main teacher is required (row ${i + 1})`);
      }

      if (rowErrors.length === 0) {
        // Set default values
        subjectData.weeklyHours = subjectData.weeklyHours || 4;
        subjectData.isActive = subjectData.isActive !== undefined ? subjectData.isActive : true;
        subjectData.isRequired = subjectData.isRequired || false;
        subjectData.educationSystem = subjectData.educationSystem || 'bilingue';
        subjectData.color = subjectData.color || '#3B82F6';
        subjectData.teachers = subjectData.teachers || [];
        subjectData.levels = subjectData.levels || [];
        subjectData.specialties = subjectData.specialties || [];
        subjectData.coefficients = subjectData.coefficients || [];

        subjects.push(subjectData);
      } else {
        errors.push(...rowErrors);
      }
    }

    // Show validation errors
    if (errors.length > 0) {
      toast({
        title: "Erreurs de validation",
        description: `${errors.length} erreur(s) trouvée(s) dans le fichier CSV`,
        variant: "destructive"
      });
      console.error('CSV Validation errors:', errors);
    }

    return subjects;
  };

  // Helper function to parse CSV lines with quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">Inactif</Badge>
    );
  };

  const getSystemBadge = (system: string) => {
    const variants = {
      francophone: 'default',
      anglophone: 'secondary',
      bilingue: 'outline',
      both: 'outline'
    } as const;

    const labels = {
      francophone: 'FR',
      anglophone: 'EN',
      bilingue: 'Bilingue',
      both: 'Les deux'
    };

    return (
      <Badge variant={variants[system as keyof typeof variants] || 'outline'} className="text-xs">
        {labels[system as keyof typeof labels] || system}
      </Badge>
    );
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = (subject.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.teacher || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && subject.isActive) ||
      (filterStatus === 'inactive' && !subject.isActive);
    const matchesSystem = filterSystem === 'all' ||
      subject.educationSystem === filterSystem;
    const matchesYear = filterAcademicYear === 'all' ||
      subject.year === filterAcademicYear;

    return matchesSearch && matchesStatus && matchesSystem && matchesYear;
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des matières</h1>
          <p className="text-muted-foreground mt-2">
            {subjects.length} matières • {filteredSubjects.length} affichées
            {filterAcademicYear !== 'all' && ` • Année: ${filterAcademicYear}`}
            {isLoading && ' • Chargement...'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Importer CSV
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => handleOpenModal('create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle matière
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Academic Year Filter */}
            <div className="space-y-2">
              <Label>Année académique</Label>
              <Select
                value={filterAcademicYear}
                onValueChange={setFilterAcademicYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {academicYears?.map((year) => (
                    <SelectItem key={year.name} value={year.name}>
                      {year.name} {year.isCurrent && '(Actuelle)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSystem} onValueChange={setFilterSystem}>
              <SelectTrigger>
                <SelectValue placeholder="Système éducatif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les systèmes</SelectItem>
                <SelectItem value="francophone">Francophone</SelectItem>
                <SelectItem value="anglophone">Anglophone</SelectItem>
                <SelectItem value="bilingue">Bilingue</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full" onClick={() => loadSubjects()}>
              <Filter className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grille des matières */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
            {filteredSubjects.map((subject: SubjectItem) => (
              <Card key={subject.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-40 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.code}
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal('view', subject)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal('edit', subject)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSubject(subject)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-base font-semibold leading-tight">{subject.name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {getSystemBadge(subject.educationSystem || 'bilingue')}
                      {subject.year && (
                        <Badge variant="outline" className="text-xs">
                          {subject.year}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Heures/semaine:</span>
                    <span>{subject.weeklyHours}h</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Professeur principal:</div>
                    <div className="text-sm font-medium truncate" title={subject.teacher}>
                      {subject.teacher}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Niveaux:</span>
                    <span>{subject.levels?.length || 0}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(subject)}
                      className="text-xs h-7"
                    >
                      {subject.isActive ? 'Désactiver' : 'Activer'}
                    </Button>
                    {getStatusBadge(subject.isActive)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Message si aucun résultat */}
          {filteredSubjects.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucune matière trouvée</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' || filterSystem !== 'all' || filterAcademicYear !== 'all'
                    ? "Aucune matière ne correspond à vos critères de recherche."
                    : "Aucune matière n'a été créée pour le moment."
                  }
                </p>
                <Button onClick={() => handleOpenModal('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer la première matière
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modales */}
      <SubjectModal
        isOpen={subjectModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSubject}
        subject={subjectModal.subject}
        academicYear={academicYears?.find(a => a.isCurrent)?.name}
        mode={subjectModal.mode}
        coefData={subjectModal?.subject?.coefficients}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, subject: null })}
        onConfirm={confirmDeleteSubject}
        title="Supprimer la matière"
        message="Êtes-vous sûr de vouloir supprimer cette matière ? Cette action est irréversible."
        itemName={deleteModal.subject?.name}
      />
    </div>
  );
};

export default Subjects;