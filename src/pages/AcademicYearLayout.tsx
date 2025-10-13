import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Outlet, Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Filter,
  RefreshCw,
  Calendar,
  School,
  Clock,
  Loader2,
  BarChart3,
  FileText,
  Award,
  TrendingUp,
  CreditCard,
  Globe
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { academicYearService } from "@/services/academicYearService";
import { settingsService } from "@/services/settingsService";
import { classesService } from "@/services/classesService";
import { AcademicYear, ClassAcademicOverview } from "@/types/academicYear";
import { Term, Sequence, AcademicYear as AcademicYearDetail } from "@/types/settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDUCATION_SYSTEMS, FRANCOPHONE_LEVELS, ANGLOPHONE_LEVELS } from "@/constants/cameroonEducation";

// Define URL parameters interface
interface AcademicYearParams {
  academicYear?: string;
  educationSystem?: string;
  level?: string;
  class?: string;
  term?: string;
  sequence?: string;
  subject?: string;
  tab?: string;
}

const AcademicYearLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Extract parameters from URL with defaults
  const selectedAcademicYear = searchParams.get('academicYear') || "";
  const selectedEducationSystem = searchParams.get('educationSystem') || "";
  const selectedLevel = searchParams.get('level') || "";
  const selectedClass = searchParams.get('class') || "";
  const selectedTerm = searchParams.get('term') || "";
  const selectedSequence = searchParams.get('sequence') || "";
  const selectedSubject = searchParams.get('subject') || "";
  const selectedTab = searchParams.get('tab') || "overview";
  console.log("selectedTab", selectedTab)
  // State
  const [academicYears, setAcademicYears] = useState<AcademicYearDetail[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);
  const [currentSequence, setCurrentSequence] = useState<Sequence | null>(null);
  const [classOverview, setClassOverview] = useState<ClassAcademicOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allAcademicYearRecords, setAllAcademicYearRecords] = useState<AcademicYear[]>([]);

  // Education system options
  const educationSystems = [
    { id: EDUCATION_SYSTEMS.FRANCOPHONE, name: 'Francophone' },
    { id: EDUCATION_SYSTEMS.ANGLOPHONE, name: 'Anglophone' },
    { id: 'bilingue', name: 'Bilingue' }
  ];

  // Get levels based on selected education system
  const getLevels = () => {
    switch (selectedEducationSystem) {
      case EDUCATION_SYSTEMS.FRANCOPHONE:
        return FRANCOPHONE_LEVELS;
      case EDUCATION_SYSTEMS.ANGLOPHONE:
        return ANGLOPHONE_LEVELS;
      case 'bilingue':
        return [...FRANCOPHONE_LEVELS, ...ANGLOPHONE_LEVELS];
      default:
        return [];
    }
  };

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'grades', label: 'Notes', icon: FileText },
    { id: 'fees-statis', label: 'Analytiques', icon: TrendingUp },
    { id: 'fees', label: 'Frais', icon: CreditCard },
    { id: 'ranks', label: 'Classements', icon: Award },
    { id: 'promotion', label: 'Promotion', icon: Users },
    { id: 'reports', label: 'Rapports', icon: FileText },
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter classes when education system or level changes
  useEffect(() => {
    filterClasses();
  }, [selectedEducationSystem, selectedLevel, selectedAcademicYear, classes]);

  // Load terms when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      loadTerms();
    } else {
      setTerms([]);
    }
  }, [selectedAcademicYear]);

  // Load sequences when term changes
  useEffect(() => {
    if (selectedTerm) {
      loadSequences();
    } else {
      setSequences([]);
    }
  }, [selectedTerm]);

  useEffect(() => {
    if (selectedClass) {
      extractSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedClass]);

  // Load academic year records when class or academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      loadAcademicYearRecords();
      loadClassOverview();
    } else {
      setAllAcademicYearRecords([]);
      setClassOverview(null);
    }
  }, [selectedAcademicYear]);

  // Update URL parameters
  const updateURLParams = (updates: Partial<AcademicYearParams>) => {
    const newParams = new URLSearchParams(searchParams);

    // Update parameters
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // console.log("newParams.get('tab')",newParams.get('tab'))
    // Ensure tab is always set
    if (!newParams.get('tab')) {
      newParams.set('tab', 'overview');
    }
    // console.log("newParams.get('newParams.toString()') 123",newParams.toString())

    // Update URL
    navigate(`/academic-years/${newParams.get('tab')}?${newParams.toString()}`, { replace: true });
  };

  const filterClasses = () => {
    let filtered = classes;

    // Filter by academic year
    if (selectedAcademicYear) {
      filtered = filtered.filter(c => c.year === selectedAcademicYear);
    }

    // Filter by education system
    if (selectedEducationSystem) {
      filtered = filtered.filter(c => c.educationSystem === selectedEducationSystem);
    }

    // Filter by level
    if (selectedLevel) {
      filtered = filtered.filter(c => c.level === selectedLevel);
    }

    setFilteredClasses(filtered);
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [academicYearsData, classesData] = await Promise.all([
        settingsService.getAcademicYears(),
        classesService.getClasses()
      ]);

      setClasses(classesData);
      setAcademicYears(academicYearsData);

      // Auto-select current academic year if none selected
      if (!selectedAcademicYear) {
        const currentYear = academicYearsData.find(ay => ay.isCurrent) || academicYearsData[0] || null;
        if (currentYear) {
          updateURLParams({ academicYear: currentYear.name });
        }
      } else {
        loadTerms();
        filterClasses();
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les données académiques',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTerms = async () => {
    if (!selectedAcademicYear) return;

    try {
      const selectedAcademicYearDetail = academicYears.find(f => f.name === selectedAcademicYear);
      if (selectedAcademicYearDetail) {
        const termsData = await settingsService.getTermsByAcademicYear(
          selectedAcademicYearDetail._id || selectedAcademicYearDetail.id
        );
        setTerms(termsData);

        // Auto-select current term if available and none selected
        const currentTermData = termsData.find(term => term.isCurrent) || null;
        if (currentTermData && !selectedTerm) {
          setCurrentTerm(currentTermData);
          updateURLParams({ term: currentTermData.id });
        } else if (termsData.length > 0 && !selectedTerm) {
          setCurrentTerm(termsData[0]);
          updateURLParams({ term: termsData[0].id });
        }
      }
    } catch (error) {
      console.error('Error loading terms:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les termes',
        variant: "destructive"
      });
    }
  };

  const loadSequences = async () => {
    if (!selectedTerm) return;

    try {
      const sequencesData = await settingsService.getSequencesByTerm(selectedTerm);
      setSequences(sequencesData);

      // Auto-select current sequence if available and none selected
      const currentSequenceData = sequencesData.find(seq => seq.isCurrent) || null;
      if (currentSequenceData && !selectedSequence) {
        setCurrentSequence(currentSequenceData);
        updateURLParams({ sequence: currentSequenceData._id });
      } else if (sequencesData.length > 0 && !selectedSequence) {
        setCurrentSequence(sequencesData[0]);
        updateURLParams({ sequence: sequencesData[0].id });
      }
    } catch (error) {
      console.error('Error loading sequences:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les séquences',
        variant: "destructive"
      });
    }
  };

  const extractSubjects = async () => {
    if (!selectedClass) {
      setSubjects([]);
      return;
    }

    const classData = classes.find(c => c.id === selectedClass || c._id === selectedClass);
    const subjectData = classData?.subjectDetails;

    if (subjectData) {
      const formattedSubjects = subjectData.map((subject: any) => ({
        id: subject?.subject?._id || subject?.subject?.id,
        name: subject?.subject?.name || subject?.subject?.subjectName || 'Matière inconnue',
        coefficient: subject?.coefficient,
        teacher: subject?.teacher?._id || subject?.teacher?.id,
        teacherName: subject?.teacher?.name || subject?.teacher?.fullName,
      }));
      const absence = [{
        id: "absences",
        name: 'absences',
        coefficient: 5,
        teacher: 'absences',
        teacherName: 'absences',
      }];
      setSubjects([...absence, ...formattedSubjects]);

      // Auto-select first subject if available and none selected
      if (formattedSubjects.length > 0 && !selectedSubject) {
        updateURLParams({ subject: formattedSubjects[0].id });
      }
    } else {
      setSubjects([]);
    }
  };

  const loadAcademicYearRecords = async () => {
    if (!selectedAcademicYear) return;

    try {
      const records = await academicYearService.getAcademicYears({
        // classes: selectedClass,
        year: selectedAcademicYear
      });
      setAllAcademicYearRecords(records);
    } catch (error) {
      console.error('Error loading academic year records:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les enregistrements académiques',
        variant: "destructive"
      });
    }
  };

  const loadClassOverview = async () => {
    if (!selectedClass || !selectedAcademicYear) return;

    try {
      const academicYear = academicYears.find(ay => ay._id === selectedAcademicYear);
      if (!academicYear) return;

      const overview = await academicYearService.getClassAcademicOverview(
        selectedClass,
        academicYear.name
      );
      setClassOverview(overview);
    } catch (error) {
      console.error('Error loading class overview:', error);
    }
  };

  const refreshData = async () => {
    await loadInitialData();
    toast({
      title: 'Données actualisées',
      description: 'Les données ont été mises à jour avec succès'
    });
  };

  const getAcademicYearInfo = () => {
    const academicYear = academicYears.find(ay => ay.name === selectedAcademicYear);
    const term = terms.find(t => t._id === selectedTerm || t.id === selectedTerm);
    const sequence = sequences.find(s => s._id === selectedSequence);
    const subject = subjects.find(s => s.id === selectedSubject);
    const classInfo = filteredClasses.find(c => c._id === selectedClass);
    const educationSystemInfo = educationSystems.find(es => es.id === selectedEducationSystem);
    const levelInfo = getLevels().find(l => l.id === selectedLevel);

    return {
      academicYear: academicYear?.name || 'N/A',
      educationSystem: educationSystemInfo?.name || 'N/A',
      level: levelInfo?.name || 'N/A',
      term: term?.name || 'N/A',
      sequence: sequence?.name || 'N/A',
      subject: subject?.name || 'N/A',
      className: classInfo?.name || 'N/A',
      studentCount: allAcademicYearRecords.length
    };
  };

  const clearFilters = () => {
    updateURLParams({
      academicYear: '',
      educationSystem: '',
      level: '',
      class: '',
      term: '',
      sequence: '',
      subject: ''
    });
  };

  const buildTabLink = (tabId: string) => {
    const params = new URLSearchParams();

    // Add all current filters
    if (selectedAcademicYear) params.set('academicYear', selectedAcademicYear);
    if (selectedEducationSystem) params.set('educationSystem', selectedEducationSystem);
    if (selectedLevel) params.set('level', selectedLevel);
    if (selectedClass) params.set('class', selectedClass);
    if (selectedTerm) params.set('term', selectedTerm);
    if (selectedSequence) params.set('sequence', selectedSequence);
    if (selectedSubject) params.set('subject', selectedSubject);

    // Set the tab
    params.set('tab', tabId);

    return `/academic-years/${tabId}?${params.toString()}`;
  };

  if (isLoading && academicYears.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Chargement des données académiques...</p>
        </div>
      </div>
    );
  }

  const info = getAcademicYearInfo();
  const levels = getLevels();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Années Académiques</h1>
          <p className="text-muted-foreground mt-2">
            Navigation par onglets avec filtres intégrés
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={clearFilters} variant="outline">
            Effacer les filtres
          </Button>
          <Button onClick={refreshData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Academic Structure Info */}
      {(selectedAcademicYear || selectedEducationSystem || selectedLevel || selectedTerm || selectedSequence) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {selectedAcademicYear && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Année:</span>
                    <Badge variant="outline">{info.academicYear}</Badge>
                  </div>
                )}
                {selectedEducationSystem && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Système:</span>
                    <Badge variant="outline">{info.educationSystem}</Badge>
                  </div>
                )}
                {selectedLevel && (
                  <div className="flex items-center space-x-2">
                    <School className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Niveau:</span>
                    <Badge variant="outline">{info.level}</Badge>
                  </div>
                )}
                {selectedClass && (
                  <div className="flex items-center space-x-2">
                    <School className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Classe:</span>
                    <Badge variant="outline">{info.className}</Badge>
                  </div>
                )}
                {selectedTerm && (
                  <div className="flex items-center space-x-2">
                    <School className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Terme:</span>
                    <Badge variant="outline">{info.term}</Badge>
                  </div>
                )}
                {selectedSequence && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Séquence:</span>
                    <Badge variant="outline">{info.sequence}</Badge>
                  </div>
                )}
                {selectedSubject && (
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Matière:</span>
                    <Badge variant="outline">{info.subject}</Badge>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Élèves:</span>
                  <Badge variant="outline">{info.studentCount}</Badge>
                </div>
              </div>
              {currentTerm?.isCurrent && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Terme Actuel
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtres et sélection</span>
          </CardTitle>
          <CardDescription>
            Sélectionnez la structure académique - les paramètres sont partagés entre tous les onglets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* First row: Academic Year, Education System, Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Academic Year Selection */}
            <div className="space-y-2">
              <Label>Année académique</Label>
              <Select
                value={selectedAcademicYear}
                onValueChange={(value) => updateURLParams({
                  academicYear: value,
                  educationSystem: '',
                  level: '',
                  class: '',
                  term: '',
                  sequence: '',
                  subject: ''
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une année" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.name} value={year.name!}>
                      {year.name} {year.isCurrent && '(Actuelle)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Education System Selection */}
            <div className="space-y-2">
              <Label>Système éducatif</Label>
              <Select
                value={selectedEducationSystem}
                onValueChange={(value) => updateURLParams({
                  educationSystem: value,
                  level: '',
                  class: '',
                  term: '',
                  sequence: '',
                  subject: ''
                })}
                disabled={!selectedAcademicYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un système" />
                </SelectTrigger>
                <SelectContent>
                  {/* {(selectedTab === "fees-statis" ||  selectedTab ===  'ranks' ) && ( */}
                  <SelectItem value={null}>
                    all
                  </SelectItem>
                  {/* )} */}
                  {educationSystems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level Selection */}
            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select
                value={selectedLevel}
                onValueChange={(value) => updateURLParams({
                  level: value,
                  class: '',
                  term: '',
                  sequence: '',
                  subject: ''
                })}
                disabled={!selectedEducationSystem}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {/* {(selectedTab === "fees-statis" || selectedTab ===  'ranks' ) && ( */}
                  <SelectItem value={null}>
                    all
                  </SelectItem>
                  {/* )} */}
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} - {level.cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Class Selection */}
            {(selectedTab === "grades" || selectedTab === "fees" || selectedTab === "fees-statis" || selectedTab === 'ranks') && (<div className="space-y-2">
              <Label>Classe</Label>
              <Select
                value={selectedClass}
                onValueChange={(value) => updateURLParams({
                  class: value,
                  term: '',
                  sequence: '',
                  subject: ''
                })}
                disabled={!selectedLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une classe" />
                </SelectTrigger>
                <SelectContent>
                  {/* {(selectedTab === "fees-statis" ||  selectedTab ===  'ranks' ) && ( */}
                  <SelectItem value={null}>
                    all
                  </SelectItem>
                  {/* // )} */}
                  {filteredClasses.map((classItem) => (
                    <SelectItem key={classItem._id} value={classItem._id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>)}
          </div>
          {/* Tabs Navigation */}
          <Card>
            <CardContent className="p-0">
              <Tabs value={selectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto p-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        asChild
                      >
                        <Link
                          to={buildTabLink(tab.id)}
                          className="flex items-center space-x-2"
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </Link>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          {/* Second row: Class, Term, Sequence, Subject */}
          {(selectedTab === "grades" || selectedTab === 'ranks') && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Term Selection */}
              <div className="space-y-2">
                <Label>Terme</Label>
                <Select
                  value={selectedTerm}
                  onValueChange={(value) => updateURLParams({
                    term: value,
                    sequence: '',
                    subject: ''
                  })}
                  disabled={!selectedAcademicYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un terme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>
                      all
                    </SelectItem>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id!}>
                        {term.name} {term.isCurrent && '(Actuel)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sequence Selection */}
              <div className="space-y-2">
                <Label>Séquence</Label>
                <Select
                  value={selectedSequence}
                  onValueChange={(value) => updateURLParams({ sequence: value, subject: '' })}
                  disabled={!selectedTerm}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une séquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>
                      all
                    </SelectItem>
                    {sequences.map((sequence) => (
                      <SelectItem key={sequence._id} value={sequence._id!}>
                        {sequence.name} {sequence.isCurrent && '(Actuelle)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <Label>Matière</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={(value) => updateURLParams({ subject: value })}
                  disabled={!selectedClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une matière" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>
                      all
                    </SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Outlet context={{
        academicYear: selectedAcademicYear,
        academicYearObj: academicYears.find(f => f.name === selectedAcademicYear),
        educationSystem: selectedEducationSystem,
        educationSystemObj: educationSystems.find(es => es.id === selectedEducationSystem),
        level: selectedLevel,
        levelObj: getLevels().find(l => l.id === selectedLevel),
        class: selectedClass,
        classObj: filteredClasses.find(c => c._id === selectedClass),
        term: selectedTerm,
        termObj: terms.find(t => t._id === selectedTerm || t.id === selectedTerm),
        sequence: selectedSequence,
        sequenceObj: sequences.find(s => s._id === selectedSequence),
        subject: selectedSubject,
        subjectObj: subjects.find(s => s.id === selectedSubject),
        tab: selectedTab,
        academicStudents: allAcademicYearRecords,
        loadAcademicYearRecords: loadAcademicYearRecords,
      }} />
    </div>
  );
};

export default AcademicYearLayout;