import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Award,
    TrendingUp,
    TrendingDown,
    Filter,
    Download,
    GraduationCap,
    User,
    Star,
    Medal,
    ArrowUpDown,
    Search,
    Users,
    BookOpen,
    Calculator,
    Clock,
    Calendar
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePagination } from "@/components/ui/usePagination";

const itemsPerPage = 10;

export default function ClassmentManagement() {
    const context = useOutletContext<{
        academicYear: string;
        educationSystem: string;
        level: string;
        class: string;
        term: string;
        sequence: string;
        subject: string;
        tab: string;
        academicStudents: any[];
        academicYearObj: any;
        educationSystemObj: any;
        levelObj: any;
        classObj: any;
        termObj: any;
        sequenceObj: any;
        subjectObj: any;
        loadAcademicYearRecords: any;
    }>();

    const {
        academicYear,
        educationSystem,
        level,
        class: classId,
        term,
        sequence,
        subject,
        academicStudents = [],
        academicYearObj,
        educationSystemObj,
        levelObj,
        classObj,
        termObj,
        sequenceObj,
        subjectObj,
        loadAcademicYearRecords,
    } = context;

    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'average', direction: 'desc' });

    // Determine ranking type based on context filters
    const rankingType = useMemo(() => {
        if (subject && sequence && term) return 'subject';
        if (sequence && term) return 'sequence';
        if (term) return 'term';
        return 'overall';
    }, [term, sequence, subject]);

    // Check if we're displaying absences
    const isAbsenceView = useMemo(() => {
        return subject === 'absences';
    }, [subject]);

    // Calculate student rankings based on current filters
    const rankedStudents = useMemo(() => {
        if (!academicStudents.length) return [];

        const studentsWithAverages = academicStudents
            .filter(student =>
                (academicYear ? student.year === academicYear : true) &&
                (educationSystem ? student.classes?.educationSystem === educationSystem : true) &&
                (level ? student.classes?.level === level : true) &&
                (classId ? student.classes?._id === classId : true)
            )
            .map(student => {
                let average = 0;
                let totalMarks = 0;
                let totalSubjects = 0;
                let overallAbsences = 0;

                // Filter based on context
                const shouldIncludeStudent =
                    (academicYear ? student.year === academicYear : true) &&
                    (classId ? student.classes?._id === classId : true) &&
                    (educationSystem ? student.classes?.educationSystem === educationSystem : true) &&
                    (level ? student.classes?.level === level : true);

                if (!shouldIncludeStudent) {
                    return {
                        ...student,
                        average: 0,
                        overallAbsences: 0,
                        totalSubjects: 0,
                        performance: isAbsenceView ? getAbsencePerformanceLevel(0) : getPerformanceLevel(0)
                    };
                }

                student.terms?.forEach(termRecord => {
                    // Skip if term filter is active and doesn't match
                    if (term && termRecord.termInfo !== term) return;

                    termRecord.sequences?.forEach(sequenceRecord => {
                        // Skip if sequence filter is active and doesn't match
                        if (sequence && sequenceRecord.sequenceInfo !== sequence) return;

                        sequenceRecord.subjects?.forEach(subjectRecord => {
                            // Skip if subject filter is active and doesn't match
                            if (subject && subject !== 'absences' && subjectRecord.subjectInfo !== subject) return;

                            const mark = subjectRecord.marks?.currentMark || 0;
                            if (mark > 0) {
                                totalMarks += mark;
                                totalSubjects++;
                            }
                        });
                    });
                });

                // Calculate value based on ranking type and view type (marks vs absences)
                if (isAbsenceView) {
                    // Handle absence calculations
                    if (rankingType === 'subject' && term && sequence && subject) {
                        // Specific subject in specific sequence and term - absences are not per subject
                        const termRecord = student.terms?.find(t => t.termInfo === term);
                        const sequenceRecord = termRecord?.sequences?.find(s => s.sequenceInfo === sequence);
                        average = sequenceRecord?.absences || 0;
                    } else if (rankingType === 'sequence' && term && sequence) {
                        // Specific sequence in specific term
                        const termRecord = student.terms?.find(t => t.termInfo === term);
                        const sequenceRecord = termRecord?.sequences?.find(s => s.sequenceInfo === sequence);
                        average = sequenceRecord?.absences || 0;
                    } else if (rankingType === 'term' && term) {
                        // Specific term - sum absences from all sequences in the term
                        const termRecord = student.terms?.find(t => t.termInfo === term);
                        let termAbsences = 0;
                        termRecord?.sequences?.forEach(sequenceRecord => {
                            termAbsences += sequenceRecord?.absences || 0;
                        });
                        average = termAbsences;
                    } else {
                        // Overall absences - use the virtual field or calculate from all terms
                        average = student.overallAbsences || 0;
                    }
                } else {
                    // Handle mark calculations (existing logic)
                    if (rankingType === 'subject' && term && sequence && subject) {
                        const termRecord = student.terms?.find(t => t.termInfo === term);
                        const sequenceRecord = termRecord?.sequences?.find(s => s.sequenceInfo === sequence);
                        const subjectRecord = sequenceRecord?.subjects?.find(sub => sub.subjectInfo === subject);
                        average = subjectRecord?.marks?.currentMark || 0;
                    } else if (rankingType === 'sequence' && term && sequence) {
                        const termRecord = student.terms?.find(t => t.termInfo === term);
                        const sequenceRecord = termRecord?.sequences?.find(s => s.sequenceInfo === sequence);
                        let seqTotal = 0;
                        let seqCount = 0;
                        sequenceRecord?.subjects?.forEach(subjectRecord => {
                            const mark = subjectRecord.marks?.currentMark || 0;
                            if (mark > 0) {
                                seqTotal += mark;
                                seqCount++;
                            }
                        });
                        average = seqCount > 0 ? seqTotal / seqCount : 0;
                    } else if (rankingType === 'term' && term) {
                        const termRecord = student.terms?.find(t => t.termInfo === term);
                        let termTotal = 0;
                        let termCount = 0;
                        termRecord?.sequences?.forEach(sequenceRecord => {
                            sequenceRecord.subjects?.forEach(subjectRecord => {
                                const mark = subjectRecord.marks?.currentMark || 0;
                                if (mark > 0) {
                                    termTotal += mark;
                                    termCount++;
                                }
                            });
                        });
                        average = termCount > 0 ? termTotal / termCount : 0;
                    } else {
                        average = totalSubjects > 0 ? totalMarks / totalSubjects : 0;
                    }
                }

                return {
                    ...student,
                    average,
                    totalSubjects,
                    performance: isAbsenceView ? getAbsencePerformanceLevel(average) : getPerformanceLevel(average)
                };
            });

        // Sort by average/absences
        const sortedStudents = [...studentsWithAverages].sort((a, b) => {
            if (isAbsenceView) {
                // For absences, lower is better (ascending order)
                return sortConfig.direction === 'desc' ? b.average - a.average : a.average - b.average;
            } else {
                // For marks, higher is better (descending order)
                return sortConfig.direction === 'desc' ? b.average - a.average : a.average - b.average;
            }
        });

        // Assign ranks
        return sortedStudents.map((student, index) => ({
            ...student,
            rank: index + 1
        }));
    }, [academicStudents, academicYear, classId, level, term, sequence, subject, rankingType, sortConfig.direction, isAbsenceView]);

    console.log("rankedStudents", rankedStudents);

    // Filter students based on search
    const filteredStudents = rankedStudents.filter(student =>
        student.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student?.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const {
        currentPage,
        totalPages,
        currentData,
        goToNextPage,
        goToPreviousPage,
        goToPage,
    } = usePagination(filteredStudents, itemsPerPage);

    function getPerformanceLevel(average: number) {
        if (average >= 16) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
        if (average >= 14) return { level: 'Très Bien', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (average >= 12) return { level: 'Bien', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        if (average >= 10) return { level: 'Moyen', color: 'text-orange-600', bg: 'bg-orange-100' };
        return { level: 'À Améliorer', color: 'text-red-600', bg: 'bg-red-100' };
    }

    function getAbsencePerformanceLevel(absences: number) {
        if (absences === 0) return { level: 'Parfait', color: 'text-green-600', bg: 'bg-green-100' };
        if (absences <= 2) return { level: 'Très Bon', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (absences <= 5) return { level: 'Bon', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        if (absences <= 10) return { level: 'Acceptable', color: 'text-orange-600', bg: 'bg-orange-100' };
        return { level: 'Préoccupant', color: 'text-red-600', bg: 'bg-red-100' };
    }

    function getRankBadge(rank: number) {
        if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-orange-500" />;
        return <span className="text-sm font-semibold">#{rank}</span>;
    }

    const getRankingTitle = () => {
        if (isAbsenceView) {
            switch (rankingType) {
                case 'subject':
                    return `Classement Absences - ${sequenceObj?.name || 'Séquence'} (${termObj?.name || 'Terme'})`;
                case 'sequence':
                    return `Classement Absences - ${sequenceObj?.name || 'Séquence'} (${termObj?.name || 'Terme'})`;
                case 'term':
                    return `Classement Absences - ${termObj?.name || 'Terme'}`;
                default:
                    return 'Classement Absences Général';
            }
        } else {
            switch (rankingType) {
                case 'subject':
                    return `Classement - ${subjectObj?.name || 'Matière'} (${sequenceObj?.name || 'Séquence'}, ${termObj?.name || 'Terme'})`;
                case 'sequence':
                    return `Classement - ${sequenceObj?.name || 'Séquence'} (${termObj?.name || 'Terme'})`;
                case 'term':
                    return `Classement - ${termObj?.name || 'Terme'}`;
                default:
                    return 'Classement Général';
            }
        }
    };

    const getRankingDescription = () => {
        if (isAbsenceView) {
            switch (rankingType) {
                case 'subject':
                    return `Classement par nombre d'absences dans la séquence et le terme sélectionnés`;
                case 'sequence':
                    return `Classement par nombre d'absences dans la séquence sélectionnée`;
                case 'term':
                    return `Classement par nombre d'absences dans le terme sélectionné`;
                default:
                    return 'Classement basé sur le nombre total d\'absences';
            }
        } else {
            switch (rankingType) {
                case 'subject':
                    return `Classement par matière spécifique dans la séquence et le terme sélectionnés`;
                case 'sequence':
                    return `Classement par séquence dans le terme sélectionné`;
                case 'term':
                    return `Classement par terme spécifique`;
                default:
                    return 'Classement basé sur toutes les performances académiques';
            }
        }
    };

    const handleSort = (key: string) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const handlePromoteStudents = async () => {
        toast({
            title: "Fonctionnalité de promotion",
            description: "La fonction de promotion sera implémentée ici",
        });
    };

    const exportToExcel = () => {
        toast({
            title: "Export réussi",
            description: "Les données de classement ont été exportées",
        });
    };

    const exportToPDF = () => {
        toast({
            title: "Export réussi",
            description: "Le classement a été exporté en PDF",
        });
    };

    if (!academicYear) {
        return (
            <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen">
                <div className="text-center py-12">
                    <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sélectionnez une année académique</h3>
                    <p className="text-muted-foreground">
                        Veuillez sélectionner une année académique pour voir le classement
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{getRankingTitle()}</h1>
                        <p className="text-muted-foreground mt-2">
                            {getRankingDescription()}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button onClick={exportToExcel} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Excel
                        </Button>
                        <Button onClick={exportToPDF} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        <Button onClick={handlePromoteStudents} className="bg-green-600 hover:bg-green-700">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Promouvoir
                        </Button>
                    </div>
                </div>

                {/* Active Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            {academicYear && (
                                <div className="flex items-center space-x-2">
                                    <Calculator className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Année:</span>
                                    <Badge variant="outline">{academicYear}</Badge>
                                </div>
                            )}
                            {classId && (
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Classe:</span>
                                    <Badge variant="outline">{classObj?.name}</Badge>
                                </div>
                            )}
                            {level && (
                                <div className="flex items-center space-x-2">
                                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Niveau:</span>
                                    <Badge variant="outline">{level}</Badge>
                                </div>
                            )}
                            {term && (
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">Terme:</span>
                                    <Badge variant="outline">{termObj?.name}</Badge>
                                </div>
                            )}
                            {sequence && (
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">Séquence:</span>
                                    <Badge variant="outline">{sequenceObj?.name}</Badge>
                                </div>
                            )}
                            {subject && subject !== 'absences' && (
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">Matière:</span>
                                    <Badge variant="outline">{subjectObj?.name}</Badge>
                                </div>
                            )}
                            {isAbsenceView && (
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Vue:</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        Absences
                                    </Badge>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Élèves:</span>
                                <Badge variant="outline">{filteredStudents.length}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Search Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Filter className="w-5 h-5" />
                            <span>Recherche</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rechercher un élève</label>
                                <Input
                                    placeholder="Nom, prénom ou matricule..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type de classement actuel</label>
                                <div className="p-2 bg-muted rounded-lg">
                                    <Badge variant="secondary" className="text-sm">
                                        {getRankingTitle()}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                {isAbsenceView ? (
                                    <TrendingDown className="w-8 h-8 text-green-500" />
                                ) : (
                                    <TrendingUp className="w-8 h-8 text-green-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isAbsenceView ? 'Moins d\'absences' : 'Meilleure moyenne'}
                                    </p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {rankedStudents.length > 0
                                            ? (isAbsenceView
                                                ? Math.min(...rankedStudents.map(s => s.average)).toFixed(0)
                                                : Math.max(...rankedStudents.map(s => s.average)).toFixed(2)
                                            )
                                            : (isAbsenceView ? '0' : '0.00')
                                        }</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                {isAbsenceView ? (
                                    <TrendingUp className="w-8 h-8 text-red-500" />
                                ) : (
                                    <TrendingDown className="w-8 h-8 text-red-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isAbsenceView ? 'Plus d\'absences' : 'Plus basse moyenne'}
                                    </p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {rankedStudents.length > 0
                                            ? (isAbsenceView
                                                ? Math.max(...rankedStudents.map(s => s.average)).toFixed(0)
                                                : Math.min(...rankedStudents.map(s => s.average)).toFixed(2)
                                            )
                                            : (isAbsenceView ? '0' : '0.00')
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                {isAbsenceView ? (
                                    <Clock className="w-8 h-8 text-blue-500" />
                                ) : (
                                    <Calculator className="w-8 h-8 text-blue-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isAbsenceView ? 'Moyenne d\'absences' : 'Moyenne du groupe'}
                                    </p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {(rankedStudents.reduce((sum, student) => sum + student.average, 0) / rankedStudents.length || 0).toFixed(isAbsenceView ? 0 : 2)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                {isAbsenceView ? (
                                    <Calendar className="w-8 h-8 text-yellow-500" />
                                ) : (
                                    <Star className="w-8 h-8 text-yellow-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isAbsenceView ? 'Élèves sans absences' : 'Élèves excellents'}
                                    </p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {isAbsenceView
                                            ? rankedStudents.filter(s => s.average === 0).length
                                            : rankedStudents.filter(s => s.average >= 16).length
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Classment Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">Rang</TableHead>
                                    <TableHead>Élève</TableHead>
                                    <TableHead>Matricule</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('average')}
                                            className="flex items-center space-x-1"
                                        >
                                            <span>{isAbsenceView ? 'Absences' : 'Moyenne'}</span>
                                            <ArrowUpDown className="w-4 h-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Performance</TableHead>
                                    {!isAbsenceView && (<TableHead>Matières</TableHead>)}
                                    <TableHead>Classe</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((student) => (
                                    <TableRow key={student._id} className="hover:bg-muted/50">
                                        <TableCell className="text-center">
                                            <div className="flex justify-center items-center">
                                                {getRankBadge(student.rank)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {student.student?.firstName} {student.student?.lastName}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {student.student?.matricule}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-lg font-bold ${isAbsenceView
                                                    ? student.average === 0
                                                        ? 'text-green-600'
                                                        : student.average <= 5
                                                            ? 'text-yellow-600'
                                                            : 'text-red-600'
                                                    : student.average >= 10
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                    }`}>
                                                    {isAbsenceView
                                                        ? student.average.toFixed(0)
                                                        : student.average.toFixed(2)
                                                    }
                                                </span>
                                                {!isAbsenceView && (
                                                    <span className="text-sm text-muted-foreground">/20</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${student.performance.bg} ${student.performance.color} border-0`}>
                                                {student.performance.level}
                                            </Badge>
                                        </TableCell>
                                        {!isAbsenceView && (<TableCell className="text-center">
                                            {student.totalSubjects}
                                        </TableCell>)}
                                        <TableCell>
                                            {student.classes?.name}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center p-4 border-t">
                                <Button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    variant="outline"
                                >
                                    Précédent
                                </Button>

                                <div className="flex items-center space-x-2">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <Button
                                            key={i + 1}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            onClick={() => goToPage(i + 1)}
                                            size="sm"
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    variant="outline"
                                >
                                    Suivant
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Performers Section */}
                {rankedStudents.length >= 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Award className="w-5 h-5 text-yellow-500" />
                                <span>{isAbsenceView ? 'Meilleure Assiduité' : 'Top Performers'}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {rankedStudents.slice(0, 3).map((student, index) => (
                                    <div key={student._id} className={`p-4 rounded-lg border-2 ${index === 0 ? 'border-yellow-400 bg-yellow-50' :
                                        index === 1 ? 'border-gray-400 bg-gray-50' :
                                            'border-orange-400 bg-orange-50'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                {getRankBadge(index + 1)}
                                                <span className="text-lg font-bold">
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                </span>
                                            </div>
                                            <div className={`text-2xl font-bold ${isAbsenceView
                                                ? student.average === 0
                                                    ? 'text-green-600'
                                                    : 'text-primary'
                                                : 'text-primary'
                                                }`}>
                                                {isAbsenceView
                                                    ? student.average.toFixed(0)
                                                    : student.average.toFixed(2)
                                                }
                                            </div>
                                        </div>
                                        <div className="font-semibold">
                                            {student.student?.firstName} {student.student?.lastName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {student.student?.matricule}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {student.classes?.name}
                                        </div>
                                        <div className="mt-2">
                                            <Badge className={`${student.performance.bg} ${student.performance.color} border-0 text-xs`}>
                                                {student.performance.level}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}