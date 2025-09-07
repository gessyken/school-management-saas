import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, BookOpen, TrendingUp, Calendar, Eye, Edit, Settings, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ClassModal from '@/components/modals/ClassModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';
import { classesService } from '@/services/classesService';
import { mapBackendToFrontend, mapFrontendToBackend } from '@/utils/classMapping';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import BulkClassModal from '@/components/modals/BulkClassModal';

interface ClassRoom {
  id: string;
  name: string;
  level: string;
  section: string;
  specialty?: string;
  educationSystem: 'francophone' | 'anglophone';
  capacity: number;
  currentStudents: number;
  teacher: string;
  room: string;
  subjects: string[];
  averageGrade?: number;
  attendanceRate?: number;
  schedule?: string;
}

const Classes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [classModal, setClassModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    classData?: ClassRoom | null;
  }>({
    isOpen: false,
    mode: 'create',
    classData: null
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    classData?: ClassRoom | null;
  }>({
    isOpen: false,
    classData: null
  });
  const [bulkModal, setBulkModal] = useState<{ isOpen: boolean; payload: string; isSubmitting: boolean; mode: 'simple' | 'json' }>({
    isOpen: false,
    payload: '6ème A; 6ème B; 5ème A',
    isSubmitting: false,
    mode: 'simple'
  });
  const { toast } = useToast();

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const backendData = await classesService.getClasses();
      const frontendData = backendData.map(mapBackendToFrontend);
      setClasses(frontendData);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les classes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [toast]);

  const levels = [
    'Tous les niveaux',
    // Francophone
    '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale',
    // Anglophone
    'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'
  ];

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', classData?: ClassRoom) => {
    setClassModal({ isOpen: true, mode, classData });
  };

  const handleCloseModal = () => {
    setClassModal({ isOpen: false, mode: 'create', classData: null });
  };

  const handleSaveClass = async (classData: ClassRoom) => {
    try {
      const backendData = mapFrontendToBackend(classData);
      
      if (classModal.mode === 'create') {
        const newClass = await classesService.createClass(backendData);
        const frontendClass = mapBackendToFrontend(newClass);
        setClasses(prev => [...prev, frontendClass]);
        
        toast({
          title: "Classe créée",
          description: `La classe ${classData.name} a été créée avec succès.`,
        });
      } else if (classModal.mode === 'edit') {
        const updatedClass = await classesService.updateClass(classData.id, backendData);
        const frontendClass = mapBackendToFrontend(updatedClass);
        setClasses(prev => prev.map(c => 
          c.id === classData.id ? frontendClass : c
        ));
        toast({
          title: "Classe modifiée",
          description: `La classe ${classData.name} a été mise à jour.`,
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

  const handleRefreshSubjects = async (classId: string) => {
    try {
      await classesService.refreshClassSubjects(classId);
      toast({
        title: "Matières rafraîchies",
        description: "Les matières de la classe ont été mises à jour selon le niveau et le système éducatif.",
      });
      // Optionally reload classes to show updated subject count
      loadClasses();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir les matières de cette classe.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClass = (classData: ClassRoom) => {
    setDeleteModal({ isOpen: true, classData });
  };

  const confirmDeleteClass = async () => {
    if (deleteModal.classData) {
      try {
        await classesService.deleteClass(deleteModal.classData.id);
        setClasses(prev => prev.filter(c => c.id !== deleteModal.classData!.id));
        toast({
          title: "Classe supprimée",
          description: `La classe ${deleteModal.classData.name} a été supprimée.`,
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
    setDeleteModal({ isOpen: false, classData: null });
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-success';
    if (grade >= 14) return 'text-primary';
    if (grade >= 12) return 'text-warning';
    return 'text-destructive';
  };

  const getCapacityBadge = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return <Badge variant="destructive">Pleine</Badge>;
    if (percentage >= 75) return <Badge className="bg-warning">Presque pleine</Badge>;
    return <Badge variant="default" className="bg-success">Disponible</Badge>;
  };

  const filteredClasses = classes.filter((classroom) => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classroom.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || filterLevel === 'Tous les niveaux' || 
                        classroom.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des classes</h1>
          <p className="text-muted-foreground mt-2">
            {classes.length} classes • {classes.reduce((acc, c) => acc + c.currentStudents, 0)} élèves au total
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Planning
          </Button>
          <Button 
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={() => handleOpenModal('create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer une classe
          </Button>
          <Button 
            variant="outline"
            onClick={() => setBulkModal((s) => ({ ...s, isOpen: true }))}
          >
            <Upload className="w-4 h-4 mr-2" />
            Créer en masse
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-primary">{classes.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Élèves</p>
                <p className="text-2xl font-bold text-secondary">
                  {classes.reduce((acc, c) => acc + c.currentStudents, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne générale</p>
                <p className="text-2xl font-bold text-success">
                  {classes.length > 0 ? (classes.reduce((acc, c) => acc + (c.averageGrade || 0), 0) / classes.length).toFixed(1) : '0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux présence</p>
                <p className="text-2xl font-bold text-warning">
                  {classes.length > 0 ? Math.round(classes.reduce((acc, c) => acc + (c.attendanceRate || 0), 0) / classes.length) : 0}%
                </p>
              </div>
              <Calendar className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {levels.map((level) => (
                <option key={level} value={level === 'Tous les niveaux' ? 'all' : level}>
                  {level}
                </option>
              ))}
            </select>

            <Button variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grille des classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClasses.map((classRoom) => (
          <Card key={classRoom.id} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-foreground">
                      {classRoom.name}
                    </h3>
                    <Badge variant={classRoom.educationSystem === 'francophone' ? 'default' : 'secondary'} className="text-xs">
                      {classRoom.educationSystem === 'francophone' ? 'FR' : 'EN'}
                    </Badge>
                    {classRoom.specialty && (
                      <Badge variant="outline" className="text-xs">
                        {classRoom.specialty}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {classRoom.teacher} • Salle {classRoom.room}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('view', classRoom)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('edit', classRoom)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRefreshSubjects(classRoom.id)}
                    title="Rafraîchir les matières selon le niveau/système"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(classRoom)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {classRoom.currentStudents}
                  </p>
                  <p className="text-sm text-muted-foreground">Élèves</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">
                    {classRoom.capacity}
                  </p>
                  <p className="text-sm text-muted-foreground">Capacité</p>
                </div>
              </div>

              {classRoom.averageGrade && (
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Moyenne générale</span>
                  <span className={`font-semibold ${getGradeColor(classRoom.averageGrade)}`}>
                    {classRoom.averageGrade.toFixed(1)}/20
                  </span>
                </div>
              )}

              {classRoom.attendanceRate && (
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Taux de présence</span>
                  <span className="font-semibold text-success">
                    {classRoom.attendanceRate}%
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-1 mt-3">
                {classRoom.subjects.slice(0, 3).map((subject) => (
                  <span 
                    key={subject}
                    className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded"
                  >
                    {subject}
                  </span>
                ))}
                {classRoom.subjects.length > 3 && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                    +{classRoom.subjects.length - 3}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredClasses.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune classe trouvée</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou créez une nouvelle classe.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modales */}
      <ClassModal
        isOpen={classModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClass}
        classData={classModal.classData}
        mode={classModal.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, classData: null })}
        onConfirm={confirmDeleteClass}
        title="Supprimer la classe"
        message="Êtes-vous sûr de vouloir supprimer cette classe ?"
        itemName={deleteModal.classData?.name}
      />

      <BulkClassModal
        isOpen={bulkModal.isOpen}
        onClose={() => setBulkModal((s) => ({ ...s, isOpen: false }))}
        onSave={async (items) => {
          try {
            // Resolve level id -> display name as required by backend enum
            const ALL_LEVELS = [...(await import('@/constants/cameroonEducation')).FRANCOPHONE_LEVELS, ...(await import('@/constants/cameroonEducation')).ANGLOPHONE_LEVELS];
            const resolveLevelName = (idOrName: string) => {
              const byId = ALL_LEVELS.find((l: any) => l.id === idOrName);
              if (byId) return byId.name;
              const byName = ALL_LEVELS.find((l: any) => l.name === idOrName);
              return byName ? byName.name : idOrName;
            };

            const backendItems = items.map((it) => {
              const levelName = resolveLevelName(it.level);
              const includeSpecialty = levelName === 'Terminale' || levelName === 'Upper Sixth';
              return {
                classesName: `${levelName} ${it.section}${includeSpecialty && it.specialty ? ` (${it.specialty})` : ''}`.trim(),
                level: levelName,
                section: it.section,
                specialty: includeSpecialty ? it.specialty : undefined,
                educationSystem: it.educationSystem,
                capacity: it.capacity,
                description: it.description,
                status: 'Open',
                amountFee: 0,
                year: '2024-2025',
              };
            });
            const result = await classesService.bulkCreateClasses(backendItems);
            const newOnes = (result.savedClasses || []).map(mapBackendToFrontend);
            setClasses((prev) => [...prev, ...newOnes]);
            // Auto-refresh subjects for each created class
            try {
              await Promise.all((result.savedClasses || []).map((c: any) =>
                classesService.refreshClassSubjects(c._id || c.id)
              ));
            } catch (e) {
              console.warn('Failed to auto-refresh subjects for some classes:', e);
            }
            toast({ title: 'Création en masse terminée', description: `${newOnes.length} créées, ${result.errors?.length || 0} erreurs.` });
            setBulkModal((s) => ({ ...s, isOpen: false }));
          } catch (err: any) {
            toast({ title: 'Erreur', description: err?.response?.data?.message || 'Création en masse échouée.', variant: 'destructive' });
          }
        }}
      />
    </div>
  );
};

export default Classes;