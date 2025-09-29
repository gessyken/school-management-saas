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

  const loadSubjects = async (filters = {}) => {
    try {
      setIsLoading(true);
      const data = await subjectsService.getSubjects({
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        system: filterSystem !== 'all' ? filterSystem : undefined,
        ...filters
      });
      console.log("data",data)
      const normalized: SubjectItem[] = (data || []).map((s: any) => ({
        id: s._id || s.id,
        name: s.name,
        code: s.code,
        description: s.description || '',
        year: s.year,
        baseCoefficient: s.baseCoefficient ?? s.coefficient ?? 1,
        coefficient: Number(s.coefficient ?? s.baseCoefficient ?? 1),
        coefficients: s.coefficients,
        coefficientsByLevel: s.coefficientsByLevel || {},
        weeklyHours: Number(s.weeklyHours ?? 0),
        teacher:  s.mainTeacher?.firstName || 'Non assigné',
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
      console.log("normalized",normalized)
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

  useEffect(() => {
    loadSubjects();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSubjects();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus, filterSystem]);

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', subject?: SubjectItem) => {
    setSubjectModal({ isOpen: true, mode, subject });
  };

  const handleCloseModal = () => {
    setSubjectModal({ isOpen: false, mode: 'create', subject: null });
  };

  const handleSaveSubject = async (subjectData: any) => {
        console.log("update",subjectModal.mode,subjectData)
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
        console.log("update")
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
      // This would call an import service when implemented
      toast({
        title: "Import en cours",
        description: "Import des matières depuis le fichier...",
      });
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer les matières.",
        variant: "destructive"
      });
    }
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
    return matchesSearch && matchesStatus && matchesSystem;
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des matières</h1>
          <p className="text-muted-foreground mt-2">
            {subjects.length} matières • {filteredSubjects.length} affichées
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                  {/* <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Coefficient:</span>
                    <span className="font-semibold text-primary">{subject.coefficient}</span>
                  </div> */}
                  
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
                  {searchTerm || filterStatus !== 'all' || filterSystem !== 'all' 
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