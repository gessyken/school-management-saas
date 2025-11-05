import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, Mail, Phone, Users, BookOpen, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentModal from '@/components/modals/StudentModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';
import { studentsService } from '@/services/studentsService';

interface Student {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  class: string;
  classesId?: string;
  average: number;
  status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'suspended' | 'withdrawn';
  enrollmentDate: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  birthDate?: string;
  avatar?: string;
  level?: string;
  matricule?: string;
  gender?: string;
  city?: string;
  nationality?: string;
  academicStatus?: string;
  attendanceRate?: number;
  isActive?: boolean;
}

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [studentModal, setStudentModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    student?: Student | null;
  }>({
    isOpen: false,
    mode: 'create',
    student: null
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    student?: Student | null;
  }>({
    isOpen: false,
    student: null
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>(['Toutes les classes']);
  const [availableLevels, setAvailableLevels] = useState<string[]>(['Tous les niveaux']);
  const { toast } = useToast();

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      console.log("selectedClass", selectedClass);
      const filters = {
        search: searchTerm,
        class: selectedClass !== 'all' ? selectedClass : '',
        status: selectedStatus !== 'all' ? selectedStatus : '',
        level: selectedLevel !== 'all' ? selectedLevel : '',
        page: 1,
        limit: 100
      };

      const data = await studentsService.getStudents(filters);
      console.log("data", data)
      setStudents(data || []);

      // Extract unique classes and levels for filters
      const uniqueClasses = [
        { label: 'Toutes les classes', value: 'Toutes les classes' },
        ...Array.from(
          data
            .map(s => s.classesId ? { label: s.class, value: s.classesId } : null)
            .filter(Boolean)
            .reduce((map, item) => {
              if (!map.has(item.value)) {
                map.set(item.value, item);
              }
              return map;
            }, new Map())
            .values()
        )
      ];
      const uniqueLevels = ['Tous les niveaux', ...new Set(data.map(s => s.level).filter(Boolean))] as string[];
      console.log("uniqueClasses", uniqueClasses)
      setAvailableClasses(uniqueClasses);
      setAvailableLevels(uniqueLevels);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Données élèves indisponibles',
        description: 'Les données seront affichées dès qu\'elles seront disponibles.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [searchTerm, selectedClass, selectedStatus, selectedLevel, toast]);

  // CSV Import functionality
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
          // Read and parse the file
          const text = await file.text();
          const studentsArray = parseCSVToStudents(text);

          if (studentsArray.length === 0) {
            toast({
              title: "Aucune donnée valide",
              description: "Le fichier ne contient aucun élève valide.",
              variant: "destructive"
            });
            return;
          }

          console.log("Students to import:", studentsArray);

          // Send to backend bulk endpoint
          const response = await studentsService.createManyStudents(studentsArray);

          // Show success message
          toast({
            title: "Import réussi",
            description: `${response.createdCount || studentsArray.length} élèves importés avec succès.`,
          });

          // Reload the students list
          loadStudents();

        } catch (error: any) {
          console.error('Import error:', error);

          // Handle partial success (207 status)
          if (error.response?.status === 207) {
            const errorData = error.response.data;
            toast({
              title: "Import partiellement réussi",
              description: `${errorData.createdCount} élèves créés, ${errorData.errors?.length || 0} erreurs.`,
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
  const parseCSVToStudents = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length <= 1) {
      return [];
    }

    const headers = lines[0].split(',').map(header =>
      header.trim().toLowerCase().replace(/\s+/g, '')
    );

    const students = [];
    const errors: string[] = [];

    // Valid values from student modal
    const validGenders = ['male', 'female', 'other'];
    const validStatuses = ['active', 'inactive', 'graduated', 'transferred', 'suspended', 'withdrawn'];
    const validAcademicStatuses = ['regular', 'repeating', 'advanced'];
    const validEducationSystems = ['francophone', 'anglophone', 'bilingue'];
    const validLevels = [
      '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale',
      'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'
    ];
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const studentData: any = {};
      const rowErrors: string[] = [];

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';

        switch (header) {
          case 'firstname':
          case 'prenom':
            studentData.firstName = value;
            if (!value) {
              rowErrors.push(`Le prénom est requis (ligne ${i + 1})`);
            }
            break;
          case 'lastname':
          case 'nom':
            studentData.lastName = value;
            if (!value) {
              rowErrors.push(`Le nom est requis (ligne ${i + 1})`);
            }
            break;
          case 'email':
            studentData.email = value;
            if (!value) {
              rowErrors.push(`L'email est requis (ligne ${i + 1})`);
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              rowErrors.push(`Email invalide: ${value} (ligne ${i + 1})`);
            }
            break;
          case 'phone':
          case 'telephone':
            studentData.phone = value;
            if (!value) {
              rowErrors.push(`Le téléphone est requis (ligne ${i + 1})`);
            }
            break;
          case 'gender':
          case 'genre':
            studentData.gender = value.toLowerCase();
            if (value && !validGenders.includes(value.toLowerCase())) {
              rowErrors.push(`Genre invalide: ${value}. Valides: ${validGenders.join(', ')} (ligne ${i + 1})`);
            }
            break;
          case 'birthdate':
          case 'datenaissance':
            if (value) {
              const date = new Date(value);
              if (isNaN(date.getTime())) {
                rowErrors.push(`Date de naissance invalide: ${value} (ligne ${i + 1})`);
              } else {
                studentData.birthDate = date.toISOString().split('T')[0];
              }
            }
            break;
          case 'birthplace':
          case 'lieunaissance':
            studentData.birthPlace = value;
            break;
          case 'nationality':
          case 'nationalite':
            studentData.nationality = value || 'Cameroonian';
            break;
          case 'address':
          case 'adresse':
            studentData.address = value;
            break;
          case 'city':
          case 'ville':
            studentData.city = value;
            break;
          case 'level':
          case 'niveau':
            studentData.level = value;
            if (value && !validLevels.includes(value)) {
              rowErrors.push(`Niveau invalide: ${value}. Valides: ${validLevels.join(', ')} (ligne ${i + 1})`);
            }
            break;
          case 'class':
          case 'classe':
            studentData.class = value;
            break;
          case 'classesid':
          case 'classid':
            studentData.classesId = value;
            break;
          case 'status':
          case 'statut':
            studentData.status = value.toLowerCase() || 'active';
            if (!validStatuses.includes(value.toLowerCase())) {
              rowErrors.push(`Statut invalide: ${value}. Valides: ${validStatuses.join(', ')} (ligne ${i + 1})`);
            }
            break;
          case 'academicstatus':
          case 'statutacademique':
            studentData.academicStatus = value.toLowerCase() || 'regular';
            if (value && !validAcademicStatuses.includes(value.toLowerCase())) {
              rowErrors.push(`Statut académique invalide: ${value}. Valides: ${validAcademicStatuses.join(', ')} (ligne ${i + 1})`);
            }
            break;
          case 'enrollmentdate':
          case 'dateinscription':
            if (value) {
              const date = new Date(value);
              if (isNaN(date.getTime())) {
                rowErrors.push(`Date d'inscription invalide: ${value} (ligne ${i + 1})`);
              } else {
                studentData.enrollmentDate = date.toISOString().split('T')[0];
              }
            } else {
              studentData.enrollmentDate = new Date().toISOString().split('T')[0];
            }
            break;
          case 'matricule':
          case 'matricule':
            studentData.matricule = value;
            break;
          case 'parentname':
          case 'nomparent':
            studentData.parentName = value;
            break;
          case 'parentemail':
          case 'emailparent':
            studentData.parentEmail = value;
            break;
          case 'parentphone':
          case 'telephoneparent':
            studentData.parentPhone = value;
            break;
          case 'parentoccupation':
          case 'professionparent':
            studentData.parentOccupation = value;
            break;
          case 'parentaddress':
          case 'adresseparent':
            studentData.parentAddress = value;
            break;
          case 'bloodgroup':
          case 'groupesanguin':
            studentData.bloodGroup = value;
            if (value && !validBloodGroups.includes(value)) {
              rowErrors.push(`Groupe sanguin invalide: ${value}. Valides: ${validBloodGroups.join(', ')} (ligne ${i + 1})`);
            }
            break;
          case 'allergies':
          case 'allergies':
            if (value) {
              studentData.allergies = value.split(';').map((a: string) => a.trim()).filter(Boolean);
            } else {
              studentData.allergies = [];
            }
            break;
          case 'medicalconditions':
          case 'conditionsmedicales':
            if (value) {
              studentData.medicalConditions = value.split(';').map((m: string) => m.trim()).filter(Boolean);
            } else {
              studentData.medicalConditions = [];
            }
            break;
          case 'emergencycontactname':
          case 'nomcontacturgence':
            if (!studentData.emergencyContact) studentData.emergencyContact = {};
            studentData.emergencyContact.name = value;
            break;
          case 'emergencycontactrelationship':
          case 'relationcontacturgence':
            if (!studentData.emergencyContact) studentData.emergencyContact = {};
            studentData.emergencyContact.relationship = value;
            break;
          case 'emergencycontactphone':
          case 'telephonecontacturgence':
            if (!studentData.emergencyContact) studentData.emergencyContact = {};
            studentData.emergencyContact.phone = value;
            break;
        }
      });

      // Validate required fields
      if (!studentData.firstName) {
        rowErrors.push(`Le prénom est requis (ligne ${i + 1})`);
      }
      if (!studentData.lastName) {
        rowErrors.push(`Le nom est requis (ligne ${i + 1})`);
      }
      if (!studentData.email) {
        rowErrors.push(`L'email est requis (ligne ${i + 1})`);
      }
      if (!studentData.phone) {
        rowErrors.push(`Le téléphone est requis (ligne ${i + 1})`);
      }

      if (rowErrors.length === 0) {
        // Set default values
        studentData.name = `${studentData.firstName} ${studentData.lastName}`.trim();
        studentData.status = studentData.status || 'active';
        studentData.academicStatus = studentData.academicStatus || 'regular';
        studentData.enrollmentDate = studentData.enrollmentDate || new Date().toISOString().split('T')[0];
        studentData.nationality = studentData.nationality || 'Cameroonian';
        studentData.isActive = studentData.isActive !== undefined ? studentData.isActive : true;
        studentData.allergies = studentData.allergies || [];
        studentData.medicalConditions = studentData.medicalConditions || [];
        studentData.emergencyContact = studentData.emergencyContact || { name: '', relationship: '', phone: '' };
        if (!studentData.matricule) {
          const timestamp = Date.now().toString().slice(-6);
          const counter = ((i + 1) % 1000).toString().padStart(3, '0');
          studentData.matricule = `MAT-${timestamp}${counter}`;
        }
        students.push(studentData);
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

    return students;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Actif</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactif</Badge>;
      case 'graduated':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Diplômé</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Suspendu</Badge>;
      case 'transferred':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Transféré</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Retiré</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getAverageColor = (average: number) => {
    if (average >= 16) return 'text-green-600';
    if (average >= 14) return 'text-blue-600';
    if (average >= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAcademicStatusBadge = (status: string) => {
    switch (status) {
      case 'regular':
        return <Badge variant="outline" className="text-xs">Régulier</Badge>;
      case 'repeating':
        return <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Redoublant</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Avancé</Badge>;
      default:
        return null;
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || selectedClass === 'Toutes les classes' ||
      student.classesId === selectedClass;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    const matchesLevel = selectedLevel === 'all' || selectedLevel === 'Tous les niveaux' ||
      student.level === selectedLevel;

    return matchesSearch && matchesClass && matchesStatus && matchesLevel;
  });

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', student?: Student) => {
    setStudentModal({ isOpen: true, mode, student });
  };

  const handleCloseModal = () => {
    setStudentModal({ isOpen: false, mode: 'create', student: null });
  };

  const handleSaveStudent = async (studentData: any) => {
    try {
      if (studentModal.mode === 'create') {
        const newStudent = await studentsService.createStudent(studentData);
        setStudents(prev => [...prev, newStudent]);
        toast({
          title: "Élève ajouté",
          description: `${studentData.name || `${studentData.firstName} ${studentData.lastName}`} a été ajouté avec succès.`,
        });
      } else if (studentModal.mode === 'edit') {
        const updatedStudent = await studentsService.updateStudent(studentData._id, studentData);
        setStudents(prev => prev.map(s =>
          s.id === studentData.id ? updatedStudent : s
        ));
        toast({
          title: "Élève modifié",
          description: `Les informations de ${studentData.name || `${studentData.firstName} ${studentData.lastName}`} ont été mises à jour.`,
        });
      }
      loadStudents()
      handleCloseModal();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Une erreur est survenue lors de la sauvegarde.';
      const missing = error?.response?.data?.missingFields;
      const details = Array.isArray(missing) && missing.length
        ? `Champs requis manquants: ${missing.join(', ')}`
        : undefined;
      toast({
        title: "Erreur",
        description: details ? `${msg}. ${details}` : msg,
        variant: "destructive"
      });
    }
  };

  const handleDeleteStudent = (student: Student) => {
    setDeleteModal({ isOpen: true, student });
  };

  const confirmDeleteStudent = async () => {
    if (deleteModal.student) {
      try {
        await studentsService.deleteStudent(deleteModal.student.id);
        setStudents(prev => prev.filter(s => s.id !== deleteModal.student!.id));
        toast({
          title: "Élève supprimé",
          description: `${deleteModal.student.name} a été supprimé.`,
          variant: "destructive"
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression.",
          variant: "destructive"
        });
      }
    }
    setDeleteModal({ isOpen: false, student: null });
  };

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    try {
      await studentsService.changeStudentStatus(studentId, newStatus);
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, status: newStatus as any } : s
      ));
      toast({
        title: "Statut modifié",
        description: "Le statut de l'élève a été mis à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut.",
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    try {
      // Implementation for export functionality
      toast({
        title: "Export en cours",
        description: "La fonction d'export sera bientôt disponible.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gestion des élèves
          </h1>
          <p className="text-muted-foreground text-lg">
            <span className="font-semibold text-foreground">{students.length}</span> élèves inscrits • <span className="font-semibold text-foreground">{filteredStudents.length}</span> affichés
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleExport}
            className="hover:bg-muted/50 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Importer CSV
          </Button>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
            onClick={() => handleOpenModal('create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un élève
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par classe */}
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les classes" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((className) => (
                  <SelectItem key={className.value} value={className.value === 'Toutes les classes' ? 'all' : className.value}>
                    {className.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par statut */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="graduated">Diplômé</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
                <SelectItem value="transferred">Transféré</SelectItem>
                <SelectItem value="withdrawn">Retiré</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre par niveau */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les niveaux" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((level) => (
                  <SelectItem key={level} value={level === 'Tous les niveaux' ? 'all' : level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des élèves */}
      <div className="grid gap-4">
        {filteredStudents.map((student, index) => (
          <Card 
            key={student.id} 
            className="shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary hover:scale-[1.01] animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  {/* Avatar avec statut */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background ${student.status === 'active' ? 'bg-green-500' :
                      student.status === 'inactive' ? 'bg-gray-400' :
                        'bg-yellow-500'
                      }`} />
                  </div>

                  {/* Informations principales */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {student.academicStatus && getAcademicStatusBadge(student.academicStatus)}
                        {getStatusBadge(student.status)}
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-32">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{student.phone || 'Non renseigné'}</span>
                      </div>
                      {student.matricule && (
                        <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{student.matricule}</span>
                        </div>
                      )}
                    </div>

                    {/* Niveau et classe */}
                    <div className="flex items-center gap-3">
                      {student.level && (
                        <Badge variant="secondary" className="px-2 py-1 text-xs font-medium">
                          {student.level}
                        </Badge>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Classe: <span className="font-medium text-foreground">{student.class || 'Non assigné'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('view', student)}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('edit', student)}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteStudent(student)}
                    className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredStudents.length === 0 && !isLoading && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Aucun élève trouvé</h3>
                <p className="text-muted-foreground max-w-md">
                  {searchTerm || selectedClass !== 'all' || selectedStatus !== 'all' || selectedLevel !== 'all'
                    ? "Essayez de modifier vos critères de recherche pour trouver des élèves."
                    : "Commencez par ajouter votre premier élève à la liste."
                  }
                </p>
              </div>
              {(!searchTerm && selectedClass === 'all' && selectedStatus === 'all' && selectedLevel === 'all') && (
                <Button
                  className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground mt-4"
                  onClick={() => handleOpenModal('create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter le premier élève
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
                <Users className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-1">
                <p className="text-foreground font-medium">Chargement des élèves...</p>
                <p className="text-sm text-muted-foreground">Veuillez patienter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modales */}
      <StudentModal
        isOpen={studentModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStudent}
        student={studentModal.student}
        mode={studentModal.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, student: null })}
        onConfirm={confirmDeleteStudent}
        title="Supprimer l'élève"
        message="Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible."
        itemName={deleteModal.student?.name}
      />
    </div>
  );
};

export default Students;