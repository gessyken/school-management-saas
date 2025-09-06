import React, { useEffect, useState } from 'react';
import { Plus, Search, BookOpen, Users, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SubjectModal from '@/components/modals/SubjectModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';
import { subjectsService } from '@/services/subjectsService';

interface Subject {
  id?: string;
  name: string;
  code: string;
  description?: string;
  coefficient: number;
  weeklyHours: number;
  teacher: string;
  level: string[];
  isActive: boolean;
  color: string;
}

const Subjects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subjectModal, setSubjectModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    subject?: Subject | null;
  }>({
    isOpen: false,
    mode: 'create',
    subject: null
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subject?: Subject | null;
  }>({
    isOpen: false,
    subject: null
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setIsLoading(true);
        const data = await subjectsService.getSubjects();
        setSubjects(data || []);
      } catch (e) {
        console.error(e);
        toast({ title: 'Données matières indisponibles', description: 'Les données seront affichées dès qu\'elles seront disponibles.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadSubjects();
  }, [toast]);

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', subject?: Subject) => {
    setSubjectModal({ isOpen: true, mode, subject });
  };

  const handleCloseModal = () => {
    setSubjectModal({ isOpen: false, mode: 'create', subject: null });
  };

  const handleSaveSubject = async (subjectData: Subject) => {
    try {
      if (subjectModal.mode === 'create') {
        const newSubject = await subjectsService.createSubject(subjectData);
        setSubjects(prev => [...prev, newSubject]);
        toast({
          title: "Matière créée",
          description: `La matière ${subjectData.name} a été créée avec succès.`,
        });
      } else if (subjectModal.mode === 'edit') {
        const updatedSubject = await subjectsService.updateSubject(subjectData.id!, subjectData);
        setSubjects(prev => prev.map(s => 
          s.id === subjectData.id ? updatedSubject : s
        ));
        toast({
          title: "Matière modifiée",
          description: `La matière ${subjectData.name} a été mise à jour.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubject = (subject: Subject) => {
    setDeleteModal({ isOpen: true, subject });
  };

  const confirmDeleteSubject = async () => {
    if (deleteModal.subject) {
      try {
        await subjectsService.deleteSubject(deleteModal.subject.id!);
        setSubjects(prev => prev.filter(s => s.id !== deleteModal.subject!.id));
        toast({
          title: "Matière supprimée",
          description: `La matière ${deleteModal.subject.name} a été supprimée.`,
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
    setDeleteModal({ isOpen: false, subject: null });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-success">Actif</Badge>
    ) : (
      <Badge variant="destructive">Inactif</Badge>
    );
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && subject.isActive) ||
                         (filterStatus === 'inactive' && !subject.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des matières</h1>
          <p className="text-muted-foreground mt-2">
            {subjects.length} matières • {filteredSubjects.length} affichées
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            Import CSV
          </Button>
          <Button 
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={() => handleOpenModal('create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle matière
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>

            <Button variant="outline" className="w-full">
              Statistiques par matière
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grille des matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="shadow-card hover:shadow-elevated transition-all duration-200 group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: subject.color }}
                >
                  {subject.code}
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenModal('view', subject)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenModal('edit', subject)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteSubject(subject)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                <CardDescription className="mt-1">
                  {subject.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{subject.level.length} niveaux</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{subject.weeklyHours}h/semaine</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Enseignant :</span>
                  <span className="font-medium">{subject.teacher}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coefficient :</span>
                  <span className="font-bold text-primary">{subject.coefficient}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Statut :</span>
                  {getStatusBadge(subject.isActive)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredSubjects.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune matière trouvée</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou ajoutez une nouvelle matière.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modales */}
      <SubjectModal
        isOpen={subjectModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSubject}
        subject={subjectModal.subject}
        mode={subjectModal.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, subject: null })}
        onConfirm={confirmDeleteSubject}
        title="Supprimer la matière"
        message="Êtes-vous sûr de vouloir supprimer cette matière ?"
        itemName={deleteModal.subject?.name}
      />
    </div>
  );
};

export default Subjects;