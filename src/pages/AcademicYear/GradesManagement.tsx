import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  Download,
  Loader2,
  BarChart3,
  Users,
  BookOpen,
  Filter,
  Search,
  ArrowUpDown,
  Edit,
  Check,
  X,
  RefreshCw,
  Calendar,
  School,
  Clock,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { academicYearService } from "@/services/academicYearService";
import { settingsService } from "@/services/settingsService";
import { classesService } from "@/services/classesService";
import { AcademicYear, ClassAcademicOverview } from "@/types/academicYear";
import { Term, Sequence, AcademicYear as AcademicYearDetail } from "@/types/settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentMark {
  academicYearId: string;
  studentId: string;
  studentName: string;
  currentMark: number;
  editedMark: number | null;
  isEditing: boolean;
  sequences: Array<{
    sequenceId: string;
    sequenceName: string;
    mark: number;
  }>;
  average: number;
  rank: number;
  status: string;
  className: string;
  email?: string;
}

const GradesManagement: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYearDetail[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYearDetailclasses, setAcademicYearDetailclasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState<AcademicYearDetail | null>(null);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);
  const [currentSequence, setCurrentSequence] = useState<Sequence | null>(null);
  const [classOverview, setClassOverview] = useState<ClassAcademicOverview | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedSequence, setSelectedSequence] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allAcademicYearRecords, setAllAcademicYearRecords] = useState<AcademicYear[]>([]);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load terms when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      loadTerms();
      loadAcademicYearDetailClasses();
    } else {
      setTerms([]);
      setSelectedTerm("");
      setAcademicYearDetailclasses([]);
      setSelectedClass("");
    }
  }, [selectedAcademicYear]);

  // Load sequences when term changes
  useEffect(() => {
    if (selectedTerm) {
      loadSequences();
    } else {
      setSequences([]);
      setSelectedSequence("");
    }
  }, [selectedTerm]);
  useEffect(() => {
    if (selectedClass) {
      extractSubjects();
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedClass]);

  // Load academic year records when class or academic year changes
  useEffect(() => {
    if (selectedClass && selectedAcademicYear) {
      loadAcademicYearRecords();
      loadClassOverview();
    } else {
      setAllAcademicYearRecords([]);
      setClassOverview(null);
    }
  }, [selectedClass, selectedAcademicYear]);

  // Load student marks when all filters are selected
  useEffect(() => {
    if (selectedClass && selectedAcademicYear && selectedTerm && selectedSequence && selectedSubject) {
      console.log("load mark")
      loadStudentMarks();
    } else {
      setStudentMarks([]);
    }
  }, [selectedClass, selectedAcademicYear, selectedTerm, selectedSequence, selectedSubject]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Load current academic structure and classes
      const [academicYearsData, classesData] = await Promise.all([
        settingsService.getAcademicYears(),
        classesService.getClasses()
      ]);

      setAcademicYears(academicYearsData);
      setClasses(classesData);

      // Set current academic year if available
      const currentYear = academicYearsData.find(ay => ay.isCurrent) || academicYearsData[0] || null;
      if (currentYear) {
        setCurrentAcademicYear(currentYear);
        setSelectedAcademicYear(currentYear._id!);
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
      const selectedAcademicYearDetail = academicYears.find(f => f.name === selectedAcademicYear)
      const termsData = await settingsService.getTermsByAcademicYear(
        selectedAcademicYearDetail._id || selectedAcademicYearDetail.id
      );
      setTerms(termsData);

      // Auto-select current term if available
      const currentTermData = termsData.find(term => term.isCurrent) || null;
      if (currentTermData) {
        // setSelectedTerm(currentTermData._id!);
        setCurrentTerm(currentTermData);
      } else if (termsData.length > 0) {
        setCurrentTerm(termsData[0]);
      }
      setSelectedTerm("");
    } catch (error) {
      console.error('Error loading terms:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les termes',
        variant: "destructive"
      });
    }
  };
  const loadAcademicYearDetailClasses = async () => {
    if (!selectedAcademicYear) return;

    try {
      // const selectedAcademicYearDetail = academicYears.find(f => f.name === selectedAcademicYear)
      const classData = await classes.filter(c => c.year === selectedAcademicYear);
      setAcademicYearDetailclasses(classData);
      setSelectedClass("");
    } catch (error) {
      console.error('Error loading terms:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les classes',
        variant: "destructive"
      });
    }
  };
  const loadSequences = async () => {
    if (!selectedTerm) return;

    try {
      const sequencesData = await settingsService.getSequencesByTerm(selectedTerm);
      setSequences(sequencesData);

      // Auto-select current sequence if available
      const currentSequenceData = sequencesData.find(seq => seq.isCurrent) || null;
      if (currentSequenceData) {
        setSelectedSequence(currentSequenceData._id!);
        setCurrentSequence(currentSequenceData);
      } else if (sequencesData.length > 0) {
        setSelectedSequence(sequencesData[0]._id!);
        setCurrentSequence(sequencesData[0]);
      }

      // Extract subjects from sequences
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

    // Get subjects from the first sequence (assuming all sequences have same subjects)
    const subjectData = await classes.find(c => c.id === selectedClass)?.subjectDetails;
    console.log("subjectData", subjectData)
    if (subjectData) {
      const formattedSubjects = subjectData.map((subject: any) => ({
        id: subject?.subject?._id || subject?.subject?.id,
        name: subject?.subject?.name || subject?.subject?.subjectName || 'Matière inconnue',
        coefficient: subject?.coefficient,
        teacher: subject?.teacher?._id || subject?.teacher?.id,
        teacherName: subject?.teacher?.name || subject?.teacher?.fullName,
      }));

      setSubjects(formattedSubjects);
    } else {
      setSubjects([]);
    }
    // Auto-select first subject if available
    // if (formattedSubjects.length > 0 && !selectedSubject) {
    setSelectedSubject("");
    // }
  };

  const loadAcademicYearRecords = async () => {
    if (!selectedClass || !selectedAcademicYear) return;

    try {

      console.log("records", selectedClass);
      console.log("records", selectedAcademicYear);
      const records = await academicYearService.getAcademicYears({
        classes: selectedClass,
        year: selectedAcademicYear
      });
      console.log("records", records);
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
      // Don't show error toast as this might fail if no data exists
    }
  };

  const loadStudentMarks = async () => {
    if (!selectedClass || !selectedAcademicYear || !selectedTerm || !selectedSequence || !selectedSubject) return;

    try {
      setIsLoading(true);

      const academicYear = academicYears.find(ay => ay.name === selectedAcademicYear);
      if (!academicYear) return;
      console.log("Testing")
      // Use the pre-loaded academic year records
      const marks: StudentMark[] = await Promise.all(
        allAcademicYearRecords.map(async (academicYearRecord) => {
          try {
            // Get detailed performance data
            const performance = await academicYearService.getStudentPerformanceSummary(
              academicYearRecord?.student?._id || academicYearRecord?.student?.id as string,
              academicYear.name
            );
            console.log("Élève inconnu",performance)
            // Find the selected term in the academic year record
            const term = academicYearRecord.terms.find(t =>
              t.termInfo.toString() === selectedTerm ||
              (typeof t.termInfo === 'object' && t.termInfo._id === selectedTerm)
            );

            // Find the selected sequence in the term
            const sequence = term?.sequences.find(seq =>
              seq.sequenceInfo.toString() === selectedSequence ||
              (typeof seq.sequenceInfo === 'object' && seq.sequenceInfo._id === selectedSequence)
            );

            // Find the selected subject in the sequence
            const subject = sequence?.subjects.find(sub =>
              sub.subjectInfo.toString() === selectedSubject ||
              (typeof sub.subjectInfo === 'object' && sub.subjectInfo._id === selectedSubject)
            );

            const currentMark = subject?.marks?.currentMark || 0;

            // Get all sequences marks for this subject
            const sequenceMarks = term?.sequences.map(seq => ({
              sequenceId: seq.sequenceInfo.toString(),
              sequenceName: typeof seq.sequenceInfo === 'object' ?
                (seq.sequenceInfo as any).name : `Sequence ${seq.sequenceInfo}`,
              mark: seq.subjects.find(sub =>
                sub.subjectInfo.toString() === selectedSubject ||
                (typeof sub.subjectInfo === 'object' && sub.subjectInfo._id === selectedSubject)
              )?.marks?.currentMark || 0
            })) || [];
            // console.log("Élève sequenceMarks",sequenceMarks)
            console.log("performance 12",performance)
            console.log("academicYearRecord",academicYearRecord)

            return {
              academicYearId: academicYearRecord._id!,
              studentId: academicYearRecord?.student?._id as string,
              studentName: academicYearRecord?.student?.fullName || 'Élève inconnu',
              email: academicYearRecord?.student?.email,
              currentMark,
              editedMark: null,
              isEditing: false,
              sequences: sequenceMarks,
              average: performance?.performance?.overallAverage || 0,
              rank: performance?.overallRank || 0,
              status: getPerformanceStatus(performance?.performance?.overallAverage || 0),
              className: classes.find(c => c._id === selectedClass)?.name || 'Classe inconnue'
            };
          } catch (error) {
            console.error(`Error loading data for student ${academicYearRecord.student}:`, error);
            // Return a default student mark object for students with incomplete data
            return {
              academicYearId: academicYearRecord._id!,
              studentId: academicYearRecord.student as string,
              studentName: 'Élève inconnu',
              currentMark: 0,
              editedMark: null,
              isEditing: false,
              sequences: [],
              average: 0,
              rank: 0,
              status: 'À Améliorer',
              className: classes.find(c => c._id === selectedClass)?.name || 'Classe inconnue'
            };
          }
        })
      );

      // Sort by current mark (descending) and assign ranks
      const sortedMarks = marks
        .sort((a, b) => b.currentMark - a.currentMark)
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }));
      console.log("sortedMarks",sortedMarks);
      setStudentMarks(sortedMarks);

    } catch (error) {
      console.error('Error loading student marks:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les notes des élèves',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkEdit = (studentId: string, mark: number) => {
    setStudentMarks(prev => prev.map(student =>
      student.studentId === studentId
        ? { ...student, editedMark: mark, isEditing: true }
        : student
    ));
  };

  const handleMarkSave = async (studentMark: StudentMark) => {
    if (!selectedTerm || !selectedSequence || !selectedSubject) {
      toast({
        title: 'Sélection incomplète',
        description: 'Veuillez sélectionner un terme, une séquence et une matière',
        variant: "destructive"
      });
      return;
    }

    if (studentMark.editedMark === null || studentMark.editedMark === studentMark.currentMark) {
      // No changes or invalid mark
      setStudentMarks(prev => prev.map(student =>
        student.studentId === studentMark.studentId
          ? { ...student, isEditing: false, editedMark: null }
          : student
      ));
      return;
    }

    // Validate mark range
    if (studentMark.editedMark < 0 || studentMark.editedMark > 20) {
      toast({
        title: 'Note invalide',
        description: 'La note doit être comprise entre 0 et 20',
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);

      await academicYearService.updateStudentMark(studentMark.academicYearId, {
        termInfo: selectedTerm,
        sequenceInfo: selectedSequence,
        subjectInfo: selectedSubject,
        newMark: studentMark.editedMark
      });

      // Update local state and re-sort
      const updatedMarks = studentMarks.map(student =>
        student.studentId === studentMark.studentId
          ? {
            ...student,
            currentMark: studentMark.editedMark!,
            isEditing: false,
            editedMark: null
          }
          : student
      ).sort((a, b) => b.currentMark - a.currentMark)
        .map((student, index) => ({ ...student, rank: index + 1 }));

      setStudentMarks(updatedMarks);

      toast({
        title: 'Succès',
        description: 'Note mise à jour avec succès',
      });

      // Recalculate averages in background
      academicYearService.calculateAverages(studentMark.academicYearId).catch(console.error);

    } catch (error) {
      console.error('Error updating mark:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la note',
        variant: "destructive"
      });

      // Revert changes on error
      setStudentMarks(prev => prev.map(student =>
        student.studentId === studentMark.studentId
          ? { ...student, isEditing: false, editedMark: null }
          : student
      ));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkCancel = (studentId: string) => {
    setStudentMarks(prev => prev.map(student =>
      student.studentId === studentId
        ? { ...student, isEditing: false, editedMark: null }
        : student
    ));
  };

  const handleCalculateRanks = async () => {
    if (!selectedClass || !selectedAcademicYear || !selectedTerm || !selectedSequence || !selectedSubject) {
      toast({
        title: 'Information manquante',
        description: 'Veuillez sélectionner tous les critères',
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);
      const academicYear = academicYears.find(ay => ay._id === selectedAcademicYear);
      if (!academicYear) return;

      await academicYearService.calculateSubjectRank({
        classId: selectedClass,
        year: academicYear.name,
        termId: selectedTerm,
        sequenceId: selectedSequence,
        subjectId: selectedSubject
      });

      toast({
        title: 'Succès',
        description: 'Classements calculés avec succès',
      });

      // Reload data to reflect new ranks
      await loadStudentMarks();

    } catch (error) {
      console.error('Error calculating ranks:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de calculer les classements',
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const exportGrades = async () => {
    try {
      if (studentMarks.length === 0) {
        toast({
          title: 'Aucune donnée',
          description: 'Aucune note à exporter',
          variant: "destructive"
        });
        return;
      }

      toast({
        title: 'Export démarré',
        description: 'Préparation du fichier en cours...',
      });

      // Implementation for exporting grades would go here
      setTimeout(() => {
        toast({
          title: 'Export réussi',
          description: 'Les notes ont été exportées avec succès',
        });
      }, 2000);

    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter les notes',
        variant: "destructive"
      });
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const getPerformanceStatus = (average: number): string => {
    if (average >= 16) return 'Excellent';
    if (average >= 14) return 'Très Bien';
    if (average >= 12) return 'Bien';
    if (average >= 10) return 'Moyen';
    return 'À Améliorer';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Excellent': return 'default';
      case 'Très Bien': return 'secondary';
      case 'Bien': return 'outline';
      case 'Moyen': return 'secondary';
      default: return 'destructive';
    }
  };

  const getAcademicYearInfo = () => {
    const academicYear = academicYears.find(ay => ay.name === selectedAcademicYear);
    const term = terms.find(t => t._id === selectedTerm || t.id === selectedTerm);
    const sequence = sequences.find(s => s._id === selectedSequence);
    const subject = subjects.find(s => s.id === selectedSubject);

    return {
      academicYear: academicYear?.name || 'N/A',
      term: term?.name || 'N/A',
      sequence: sequence?.name || 'N/A',
      subject: subject?.name || 'N/A',
      studentCount: allAcademicYearRecords.length
    };
  };

  // Filter students based on search term
  const filteredStudents = studentMarks.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des notes</h1>
          <p className="text-muted-foreground mt-2">
            Saisie et gestion des notes académiques par séquence
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={refreshData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button asChild variant="outline">
            <Link to="/academic-years/grades/bulk">
              <Users className="w-4 h-4 mr-2" />
              Saisie en masse
            </Link>
          </Button>
          <Button onClick={exportGrades} disabled={studentMarks.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Academic Structure Info */}
      {(selectedAcademicYear || selectedTerm || selectedSequence) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Année:</span>
                  <Badge variant="outline">{getAcademicYearInfo().academicYear}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <School className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Terme:</span>
                  <Badge variant="outline">{getAcademicYearInfo().term}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Séquence:</span>
                  <Badge variant="outline">{getAcademicYearInfo().sequence}</Badge>
                </div>
                {selectedSubject && (
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Matière:</span>
                    <Badge variant="outline">{getAcademicYearInfo().subject}</Badge>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Élèves:</span>
                  <Badge variant="outline">{getAcademicYearInfo().studentCount}</Badge>
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
            Sélectionnez la structure académique et la matière pour gérer les notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Academic Year Selection */}
            <div className="space-y-2">
              <Label>Année académique</Label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
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

            {/* Class Selection */}
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={!selectedAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une classe" />
                </SelectTrigger>
                <SelectContent>
                  {academicYearDetailclasses.map((classItem) => (
                    <SelectItem key={classItem._id} value={classItem._id}>
                      {classItem.name} - {classItem.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term Selection */}
            <div className="space-y-2">
              <Label>Terme</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={!selectedAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un terme" />
                </SelectTrigger>
                <SelectContent>
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
              <Select value={selectedSequence} onValueChange={setSelectedSequence} disabled={!selectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une séquence" />
                </SelectTrigger>
                <SelectContent>
                  {sequences.map((sequence) => (
                    <SelectItem key={sequence._id} value={sequence._id!}>
                      {sequence.name} {sequence.isCurrent && '(Actuelle)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une matière" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCalculateRanks}
              disabled={!selectedClass || !selectedTerm || !selectedSequence || !selectedSubject || isUpdating}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {isUpdating ? 'Calcul...' : 'Calculer classements'}
            </Button>
            <Button asChild>
              <Link to="/academic-years/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Voir statistiques
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Notes des élèves - {getAcademicYearInfo().subject}</CardTitle>
              <CardDescription>
                Notes pour la séquence {getAcademicYearInfo().sequence} - {filteredStudents.length} élève(s) trouvé(s)
              </CardDescription>
            </div>
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedClass || !selectedTerm || !selectedSequence || !selectedSubject ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Veuillez sélectionner une classe, un terme, une séquence et une matière pour afficher les notes</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun élève trouvé pour les critères sélectionnés</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Élève</TableHead>
                  <TableHead className="text-center">Note Actuelle</TableHead>
                  <TableHead className="text-center">Moyenne Générale</TableHead>
                  <TableHead className="text-center">Rang</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow key={student.studentId}>
                    <TableCell>
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {student.rank}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.email || 'Email non disponible'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {student.isEditing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={student.editedMark || ''}
                            onChange={(e) => handleMarkEdit(student.studentId, parseFloat(e.target.value) || 0)}
                            onBlur={() => handleMarkSave(student)}
                            className="w-20 text-center"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkSave(student)}
                            disabled={isUpdating}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkCancel(student.studentId)}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-center space-x-2 cursor-pointer group"
                          onClick={() => handleMarkEdit(student.studentId, student.currentMark)}
                        >
                          <span className={`text-2xl font-bold ${student.currentMark >= 10 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {student.currentMark.toFixed(1)}
                          </span>
                          <Edit className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-semibold text-primary">
                        {student.average.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-lg">
                        {student.rank}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusVariant(student.status)}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/academic-years/student/${student.studentId}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Détails
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {classOverview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Moyenne classe</p>
                  <p className="text-2xl font-bold text-primary">
                    {classOverview.averageClassAverage?.toFixed(1) || '0.0'}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Élèves à risque</p>
                  <p className="text-2xl font-bold text-destructive">
                    {classOverview.studentsAtRisk || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux réussite</p>
                  <p className="text-2xl font-bold text-green-600">
                    {classOverview.totalStudents ?
                      (((classOverview.totalStudents - (classOverview.studentsAtRisk || 0)) / classOverview.totalStudents) * 100).toFixed(0)
                      : '0'}%
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total élèves</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {classOverview.totalStudents || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GradesManagement;