import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StudentModal from '@/components/modals/StudentModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';
import { studentsService } from '@/services/studentsService';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  average: number;
  status: 'active' | 'inactive' | 'graduated';
  enrollmentDate: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  birthDate?: string;
  avatar?: string;
}

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
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
  const { toast } = useToast();
  const classes = ['Toutes les classes'];

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        const data = await studentsService.getStudents();
        setStudents(data || []);
      } catch (e) {
        console.error(e);
        toast({ title: 'Données élèves indisponibles', description: 'Les données seront affichées dès qu\'elles seront disponibles.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, [toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success">Actif</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactif</Badge>;
      case 'graduated':
        return <Badge variant="secondary">Diplômé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getAverageColor = (average: number) => {
    if (average >= 16) return 'text-success';
    if (average >= 14) return 'text-primary';
    if (average >= 12) return 'text-warning';
    return 'text-destructive';
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || selectedClass === 'Toutes les classes' || 
                        student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', student?: Student) => {
    setStudentModal({ isOpen: true, mode, student });
  };

  const handleCloseModal = () => {
    setStudentModal({ isOpen: false, mode: 'create', student: null });
  };

  const handleSaveStudent = async (studentData: Student) => {
    try {
      if (studentModal.mode === 'create') {
        const newStudent = await studentsService.createStudent(studentData);
        setStudents(prev => [...prev, newStudent]);
        toast({
          title: "Élève ajouté",
          description: `${studentData.name} a été ajouté avec succès.`,
        });
      } else if (studentModal.mode === 'edit') {
        const updatedStudent = await studentsService.updateStudent(studentData.id!, studentData);
        setStudents(prev => prev.map(s => 
          s.id === studentData.id ? updatedStudent : s
        ));
        toast({
          title: "Élève modifié",
          description: `Les informations de ${studentData.name} ont été mises à jour.`,
        });
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde.';
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
          <Button variant="outline" size="sm">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {classes.map((className) => (
                <option key={className} value={className === 'Toutes les classes' ? 'all' : className}>
                  {className}
                </option>
              ))}
            </select>

            {/* Actions */}
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des élèves */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="shadow-card hover:shadow-elevated transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  {/* Informations principales */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {student.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {student.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {student.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Classe</p>
                    <p className="font-semibold">{student.class}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Moyenne</p>
                    <p className={`font-bold text-lg ${getAverageColor(student.average)}`}>
                      {student.average.toFixed(1)}/20
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    {getStatusBadge(student.status)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenModal('view', student)}
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenModal('edit', student)}
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteStudent(student)}
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
      {filteredStudents.length === 0 && (
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
        message="Êtes-vous sûr de vouloir supprimer cet élève ?"
        itemName={deleteModal.student?.name}
      />
    </div>
  );
};

export default Students;