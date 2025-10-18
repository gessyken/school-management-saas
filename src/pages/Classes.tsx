import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Users, BookOpen, TrendingUp, Calendar, Eye, Edit,
  Settings, Trash2, Upload, RefreshCw, BarChart3, Filter, Download,
  User,
  MapPin,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClassModal from '@/components/modals/ClassModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';
import { classesService } from '@/services/classesService';
import { mapBackendToFrontend, mapFrontendToBackend } from '@/utils/classMapping';
import BulkClassModal from '@/components/modals/BulkClassModal';
import { AcademicYear } from '@/types/settings';
import settingsService from '@/services/settingsService';
import { Label } from '@/components/ui/label';

interface ClassRoom {
  id: string;
  name: string;
  level: string;
  section: string;
  specialty?: string;
  educationSystem: 'francophone' | 'anglophone' | 'bilingue';
  capacity: number;
  currentStudents: number;
  teacher: string;
  room: string;
  subjects: string[];
  averageGrade?: number;
  attendanceRate?: number;
  schedule?: string;
  isActive?: boolean;
  status?: string;
  year?: string;
  description?: string;
}

interface ClassStatistics {
  totalClasses: number;
  totalStudents: number;
  totalCapacity: number;
  activeClasses: number;
  openClasses: number;
  averageAttendance: number;
  averageGrade: number;
  utilizationRate: number;
  systemBreakdown: Record<string, any>;
  levelBreakdown: Record<string, any>;
}

const Classes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterAcademicYear, setFilterAcademicYear] = useState('all');
  const [filterSystem, setFilterSystem] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [statistics, setStatistics] = useState<ClassStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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

  const [bulkModal, setBulkModal] = useState<{
    isOpen: boolean;
    payload: string;
    isSubmitting: boolean;
    mode: 'simple' | 'json'
  }>({
    isOpen: false,
    payload: '6ème A; 6ème B; 5ème A',
    isSubmitting: false,
    mode: 'simple'
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

  const loadClasses = async (filters = {}) => {
    try {
      setIsLoading(true);

      // Prepare filter parameters including academic year
      const filterParams = {
        search: searchTerm || undefined,
        level: filterLevel !== 'all' ? filterLevel : undefined,
        educationSystem: filterSystem !== 'all' ? filterSystem : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        year: filterAcademicYear !== 'all' ? filterAcademicYear : undefined,
        ...filters
      };

      console.log("Filter params:", filterParams);

      const backendData = await classesService.getClasses(filterParams);
      console.log("backendData", backendData);

      const frontendData = backendData.map(mapBackendToFrontend);
      console.log("frontendData", frontendData);
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

  const loadStatistics = async () => {
    try {
      const stats = await classesService.getClassStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const refreshAllData = async () => {
    setIsRefreshing(true);
    await Promise.all([loadClasses(), loadStatistics()]);
    setIsRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    loadClasses();
    loadStatistics();
  }, []);

  // Debounced search effect with all filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadClasses();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterLevel, filterSystem, filterStatus, filterAcademicYear]);

  const levels = [
    'Tous les niveaux',
    // Francophone
    '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale',
    // Anglophone
    'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'
  ];

  const educationSystems = [
    'Tous les systèmes',
    'francophone', 'anglophone', 'bilingue'
  ];

  const statusOptions = [
    'Tous les statuts',
    'Open', 'Closed', 'Active', 'Inactive'
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
        backendData.year = currentAcademicYears.name
        const response = await classesService.createClass(backendData);
        const newClass = response.class || response;
        const frontendClass = mapBackendToFrontend(newClass);
        setClasses(prev => [...prev, frontendClass]);

        toast({
          title: "Classe créée",
          description: `La classe ${classData.name} a été créée avec succès.`,
        });
      } else if (classModal.mode === 'edit') {
        const response = await classesService.updateClass(classData.id, backendData);
        const updatedClass = response.class || response;
        const frontendClass = mapBackendToFrontend(updatedClass);
        setClasses(prev => prev.map(c =>
          c.id === classData.id ? frontendClass : c
        ));
        toast({
          title: "Classe modifiée",
          description: `La classe ${classData.level}${classData.section} a été mise à jour.`,
        });
      }
      handleCloseModal();
      loadStatistics(); // Refresh statistics
    } catch (error: any) {
      console.error('Error saving class:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la sauvegarde.';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleRefreshSubjects = async (classId: string, className: string) => {
    try {
      await classesService.refreshClassSubjects(classId);
      toast({
        title: "Matières rafraîchies",
        description: `Les matières de la classe ${className} ont été mises à jour.`,
      });
      loadClasses(); // Reload to show updated subject count
    } catch (error: any) {
      console.error('Error refreshing subjects:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Impossible de rafraîchir les matières.';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (classData: ClassRoom) => {
    try {
      const response = await classesService.toggleClassStatus(classData.id);
      const updatedClass = response.class || response;
      const frontendClass = mapBackendToFrontend(updatedClass);

      setClasses(prev => prev.map(c =>
        c.id === classData.id ? frontendClass : c
      ));

      toast({
        title: `Classe ${classData.isActive ? 'désactivée' : 'activée'}`,
        description: `La classe ${classData.name} a été ${classData.isActive ? 'désactivée' : 'activée'}.`,
      });
      loadStatistics(); // Refresh statistics
    } catch (error: any) {
      console.error('Error toggling class status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Impossible de modifier le statut.';
      toast({
        title: "Erreur",
        description: errorMessage,
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
        });
        loadStatistics(); // Refresh statistics
      } catch (error: any) {
        console.error('Error deleting class:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la suppression.';
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
    setDeleteModal({ isOpen: false, classData: null });
  };

  const handleBulkCreate = async (items: any[]) => {
    try {
      setBulkModal(prev => ({ ...prev, isSubmitting: true }));
      console.log('Bulk create items:', items);

      const backendItems = items.map((it) => ({
        name: it.name,
        mainTeacher: it.mainTeacher,
        level: it.level,
        section: it.section,
        specialty: it.specialty,
        educationSystem: it.educationSystem,
        capacity: it.capacity,
        teacher: it.teacher,
        room: it.room,
        description: it.description,
        year: it.year || filterAcademicYear !== 'all' ? filterAcademicYear : '2024-2025',
      }));

      console.log('Backend items:', backendItems);

      const result = await classesService.bulkCreateClasses(backendItems);
      const newClasses = (result.savedClasses || []).map(mapBackendToFrontend);

      setClasses(prev => [...prev, ...newClasses]);

      // Auto-refresh subjects for each created class
      try {
        await Promise.all((result.savedClasses || []).map((c: any) =>
          classesService.refreshClassSubjects(c._id || c.id)
        ));
      } catch (e) {
        console.warn('Failed to auto-refresh subjects for some classes:', e);
      }

      toast({
        title: 'Création en masse terminée',
        description: `${newClasses.length} classes créées, ${result.errors?.length || 0} erreurs.`
      });

      // Close modal after successful creation
      setBulkModal(prev => ({ ...prev, isOpen: false, isSubmitting: false }));
      loadStatistics(); // Refresh statistics
    } catch (err: any) {
      console.error('Error in bulk creation:', err);
      const errorMessage = err?.response?.data?.message || 'Création en masse échouée.';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });
      setBulkModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleExportData = async () => {
    try {
      // This would call an export service when implemented
      toast({
        title: "Export en cours",
        description: "Préparation de l'export des données...",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données.",
        variant: "destructive"
      });
    }
  };

  const handlePurgeClasses = async () => {
    try {
      await classesService.purgeClasses();
      setClasses([]);
      setStatistics(null);
      toast({
        title: "Données supprimées",
        description: "Toutes les classes ont été supprimées.",
        variant: "destructive"
      });
    } catch (error: any) {
      console.error('Error purging classes:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Impossible de supprimer les classes.';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600';
    if (grade >= 14) return 'text-blue-600';
    if (grade >= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (isActive: boolean, status: string) => {
    if (!isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    switch (status) {
      case 'Open':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ouverte</Badge>;
      case 'Closed':
        return <Badge variant="destructive">Fermée</Badge>;
      case 'Active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSystemBadge = (system: string) => {
    const variants = {
      francophone: 'default',
      anglophone: 'secondary',
      bilingue: 'outline'
    } as const;

    const labels = {
      francophone: 'FR',
      anglophone: 'EN',
      bilingue: 'Bilingue'
    };

    return (
      <Badge variant={variants[system as keyof typeof variants] || 'outline'} className="text-xs">
        {labels[system as keyof typeof labels] || system}
      </Badge>
    );
  };

  // Filter classes locally (as fallback if API filtering doesn't work)
  const filteredClasses = classes.filter((classroom) => {
    const matchesSearch = classroom?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      classroom?.teacher?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      classroom?.room?.toLowerCase()?.includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || filterLevel === 'Tous les niveaux' ||
      classroom.level === filterLevel;
    const matchesSystem = filterSystem === 'all' || filterSystem === 'Tous les systèmes' ||
      classroom.educationSystem === filterSystem;
    const matchesStatus = filterStatus === 'all' || filterStatus === 'Tous les statuts' ||
      classroom.status === filterStatus;
    const matchesYear = filterAcademicYear === 'all' ||
      classroom.year === filterAcademicYear;

    return matchesSearch && matchesLevel && matchesSystem && matchesStatus && matchesYear;
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des classes</h1>
          <p className="text-muted-foreground mt-2">
            {statistics?.totalClasses || classes.length} classes • {statistics?.totalStudents || classes.reduce((acc, c) => acc + c.currentStudents, 0)} élèves au total
            {filterAcademicYear !== 'all' && ` • Année: ${filterAcademicYear}`}
            {isLoading && ' • Chargement...'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={refreshAllData} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
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
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-primary">{statistics?.totalClasses || classes.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Élèves</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics?.totalStudents || classes.reduce((acc, c) => acc + c.currentStudents, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne générale</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics?.averageGrade ? statistics.averageGrade.toFixed(1) :
                    classes.length > 0 ? (classes.reduce((acc, c) => acc + (c.averageGrade || 0), 0) / classes.length).toFixed(1) : '0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux présence</p>
                <p className="text-2xl font-bold text-amber-600">
                  {statistics?.averageAttendance ? Math.round(statistics.averageAttendance) + '%' :
                    classes.length > 0 ? Math.round(classes.reduce((acc, c) => acc + (c.attendanceRate || 0), 0) / classes.length) + '%' : '0%'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une classe..."
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

            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level === 'Tous les niveaux' ? 'all' : level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSystem} onValueChange={setFilterSystem}>
              <SelectTrigger>
                <SelectValue placeholder="Système" />
              </SelectTrigger>
              <SelectContent>
                {educationSystems.map((system) => (
                  <SelectItem key={system} value={system === 'Tous les systèmes' ? 'all' : system}>
                    {system}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status === 'Tous les statuts' ? 'all' : status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rest of the component remains the same... */}
      {/* Grille des classes */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map((classRoom) => (
              <Card key={classRoom.id} className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-primary/50 hover:border-l-primary">
                <CardContent className="p-6">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground truncate">
                          {classRoom.name}
                        </h3>
                        <div className="flex gap-1 flex-shrink-0">
                          {getSystemBadge(classRoom.educationSystem)}
                          {classRoom.specialty && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {classRoom.specialty}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <User className="w-4 h-4" />
                        <span>{classRoom.teacher}</span>
                        <span>•</span>
                        <MapPin className="w-4 h-4" />
                        <span>Salle {classRoom.level}{classRoom.section}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(classRoom.isActive ?? true, classRoom.status || 'Open')}
                        {classRoom.year && (
                          <Badge variant="outline" className="text-xs bg-orange-50">
                            {classRoom.year}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal('view', classRoom)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal('edit', classRoom)}
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefreshSubjects(classRoom.id, classRoom.name)}
                        title="Rafraîchir les matières"
                        className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClass(classRoom)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <p className="text-2xl font-bold text-blue-700">
                          {classRoom.currentStudents}
                        </p>
                      </div>
                      <p className="text-sm text-blue-600 font-medium">Élèves inscrits</p>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (classRoom.currentStudents / classRoom.capacity) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Maximize2 className="w-4 h-4 text-gray-600" />
                        <p className="text-2xl font-bold text-gray-700">
                          {classRoom.capacity}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Capacité max</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-3 mb-4">
                    {classRoom.averageGrade > 0 && (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Moyenne générale</span>
                        </div>
                        <span className={`font-bold text-lg ${getGradeColor(classRoom.averageGrade)}`}>
                          {classRoom.averageGrade.toFixed(1)}/20
                        </span>
                      </div>
                    )}

                    {classRoom.attendanceRate > 0 && (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Taux de présence</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-blue-700">
                            {classRoom.attendanceRate}%
                          </span>
                          <div className="w-12 bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${classRoom.attendanceRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subjects Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-foreground">Matières</span>
                      <span className="text-xs text-muted-foreground">
                        {classRoom.subjects.length} matière{classRoom.subjects.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {classRoom.subjects.slice(0, 4).map((subject, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200"
                        >
                          {subject}
                        </Badge>
                      ))}
                      {classRoom.subjects.length > 4 && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          +{classRoom.subjects.length - 4}
                        </Badge>
                      )}
                      {classRoom.subjects.length === 0 && (
                        <div className="text-center w-full py-2">
                          <span className="text-xs text-muted-foreground italic">Aucune matière assignée</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Message si aucun résultat */}
          {filteredClasses.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucune classe trouvée</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterLevel !== 'all' || filterSystem !== 'all' || filterStatus !== 'all' || filterAcademicYear !== 'all'
                    ? "Aucune classe ne correspond à vos critères de recherche."
                    : "Aucune classe n'a été créée pour le moment."
                  }
                </p>
                <Button onClick={() => handleOpenModal('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer la première classe
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modales */}
      <ClassModal
        isOpen={classModal.isOpen}
        currentAcademicYears={currentAcademicYears?.name}
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
        message="Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible."
        itemName={deleteModal.classData?.name}
      />

      <BulkClassModal
        isOpen={bulkModal.isOpen}
        academicYear={currentAcademicYears?.name}
        onClose={() => setBulkModal((s) => ({ ...s, isOpen: false }))}
        onSave={handleBulkCreate}
        isSubmitting={bulkModal.isSubmitting}
      />
    </div>
  );
};

export default Classes;