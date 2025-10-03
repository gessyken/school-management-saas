import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, Mail, Phone, Users, BookOpen } from 'lucide-react';
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
        ]; const uniqueLevels = ['Tous les niveaux', ...new Set(data.map(s => s.level).filter(Boolean))] as string[];
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
      // console.log("studentData", studentData)
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
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des élèves</h1>
          <p className="text-muted-foreground mt-2">
            {students.length} élèves inscrits • {filteredStudents.length} affichés
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={() => handleOpenModal('create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un élève
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="grid gap-3">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20">
            <CardContent className="p-4">
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
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun élève trouvé</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou ajoutez un nouvel élève.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des élèves...</p>
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