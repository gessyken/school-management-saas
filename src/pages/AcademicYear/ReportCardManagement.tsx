import React, { useState, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Download,
    User,
    Users,
    BookOpen,
    FileText,
    Eye,
    Search,
    Filter,
    School,
    Calendar,
    MapPin,
    Phone,
    Mail
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePagination } from "@/components/ui/usePagination";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const itemsPerPage = 5;

// School information (you can customize this)
const SCHOOL_INFO = {
    name: "COLLÈGE SAINTE FAMILLE",
    address: "BP 125 Yaoundé, Cameroun",
    phone: "+237 6 99 99 99 99",
    email: "contact@college-sainte-famille.cm",
    principal: "M. Jean Paul MBAPPE",
    motto: "Excellence et Discipline",
    type: "Établissement Secondaire d'Enseignement Général"
};

export default function ReportCardManagement() {
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
        termsData: any[];
        sequencesData: any[];
        subjectsData: any[];

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
        termsData,
        sequencesData,
        subjectsData,
    } = context;

    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [showReportCard, setShowReportCard] = useState(false);
    const reportCardRef = useRef<HTMLDivElement>(null);

    // Determine what to display based on filters
    const displayMode = useMemo(() => {
        if (subject && sequence && term) return 'subject';
        if (sequence && term) return 'sequence';
        if (term) return 'term';
        return 'overall';
    }, [term, sequence, subject]);

    // Filter students based on context and search
    const filteredStudents = useMemo(() => {
        return academicStudents
            .filter(student =>
                (academicYear ? student.year === academicYear : true) &&
                (educationSystem ? student.classes?.educationSystem === educationSystem : true) &&
                (level ? student.classes?.level === level : true) &&
                (classId ? student.classes?._id === classId : true) &&
                (student.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.student?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map(student => {
                // Calculate comprehensive statistics
                let overallAverage = 0;
                let totalMarks = 0;
                let totalSubjects = 0;
                let overallAbsences = 0;
                let termDetails = {};
                let sequenceDetails = {};

                student.terms?.forEach(termRecord => {
                    let termTotal = 0;
                    let termSubjectCount = 0;
                    let termAbsences = 0;
                    let termSequences = {};

                    termRecord.sequences?.forEach(sequenceRecord => {
                        let sequenceTotal = 0;
                        let sequenceSubjectCount = 0;
                        let sequenceSubjects = {};

                        sequenceRecord.subjects?.forEach(subjectRecord => {
                            const mark = subjectRecord.marks?.currentMark || 0;
                            if (mark > 0) {
                                totalMarks += mark;
                                totalSubjects++;
                                termTotal += mark;
                                termSubjectCount++;
                                sequenceTotal += mark;
                                sequenceSubjectCount++;
                            }

                            // Store subject details
                            sequenceSubjects[subjectRecord.subjectInfo] = {
                                mark: mark,
                                coefficient: subjectRecord.coefficient || 1,
                                teacher: subjectRecord.teacherInfo?.name || 'Non assigné'
                            };
                        });

                        // Sequence details
                        const sequenceAvg = sequenceSubjectCount > 0 ? sequenceTotal / sequenceSubjectCount : 0;
                        sequenceDetails[`${termRecord.termInfo}-${sequenceRecord.sequenceInfo}`] = {
                            average: sequenceAvg,
                            absences: sequenceRecord.absences || 0,
                            subjects: sequenceSubjects
                        };

                        termSequences[sequenceRecord.sequenceInfo] = sequenceDetails[`${termRecord.termInfo}-${sequenceRecord.sequenceInfo}`];
                        termAbsences += sequenceRecord.absences || 0;
                    });

                    // Term details
                    const termAvg = termSubjectCount > 0 ? termTotal / termSubjectCount : 0;
                    termDetails[termRecord.termInfo] = {
                        average: termAvg,
                        absences: termAbsences,
                        sequences: termSequences
                    };

                    overallAbsences += termAbsences;
                });

                overallAverage = totalSubjects > 0 ? totalMarks / totalSubjects : 0;

                // Calculate performance level
                const performance = getPerformanceLevel(overallAverage);

                return {
                    ...student,
                    overallAverage,
                    termDetails,
                    sequenceDetails,
                    overallAbsences,
                    totalSubjects,
                    performance,
                    termAverages: Object.fromEntries(
                        Object.entries(termDetails).map(([termId, termData]: [string, any]) => [termId, termData.average])
                    ),
                    sequenceAverages: Object.fromEntries(
                        Object.entries(sequenceDetails).map(([seqId, seqData]: [string, any]) => [seqId, seqData.average])
                    )
                };
            });
    }, [academicStudents, academicYear, educationSystem, level, classId, searchTerm]);
    console.log("termsData", subjectsData)
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
        return { level: 'Faible', color: 'text-red-600', bg: 'bg-red-100' };
    }

    function getAppreciation(mark: number) {
        if (mark >= 16) return 'Excellent';
        if (mark >= 14) return 'Très Bien';
        if (mark >= 12) return 'Bien';
        if (mark >= 10) return 'Assez Bien';
        if (mark >= 8) return 'Passable';
        return 'Faible';
    }
    function getAbsencePerformanceLevel(absences: number) {
        if (absences === 0) return { level: 'Parfait', color: 'text-green-600', bg: 'bg-green-100' };
        if (absences <= 2) return { level: 'Très Bon', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (absences <= 5) return { level: 'Bon', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        if (absences <= 10) return { level: 'Acceptable', color: 'text-orange-600', bg: 'bg-orange-100' };
        return { level: 'Préoccupant', color: 'text-red-600', bg: 'bg-red-100' };
    }
    const handleViewReportCard = (student: any) => {
        setSelectedStudent(student);
        setShowReportCard(true);
    };

    const exportPDF = async (student: any) => {
        const element = document.getElementById(`report-card-${student._id}`);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`bulletin_${student.student?.firstName}_${student.student?.lastName}_${academicYear}.pdf`);

            toast({
                title: "PDF généré",
                description: "Le bulletin a été téléchargé avec succès",
            });
        } catch (error) {
            console.error("PDF export error:", error);
            toast({
                title: "Erreur",
                description: "Erreur lors de la génération du PDF",
                variant: "destructive",
            });
        }
    };

    const exportAllPDFs = async () => {
        for (const student of filteredStudents) {
            await exportPDF(student);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    const getCurrentAcademicPeriod = () => {
        if (term && sequence && subject) {
            return `${termObj?.name} - ${sequenceObj?.name} - ${subjectObj?.name}`;
        }
        if (term && sequence) {
            return `${termObj?.name} - ${sequenceObj?.name}`;
        }
        if (term) {
            return `${termObj?.name}`;
        }
        return "Année Scolaire Complète";
    };

    if (!academicYear) {
        return (
            <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen">
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sélectionnez une année académique</h3>
                    <p className="text-muted-foreground">
                        Veuillez sélectionner une année académique pour voir les bulletins
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
                        <h1 className="text-3xl font-bold text-foreground">Bulletins de Notes</h1>
                        <p className="text-muted-foreground mt-2">
                            Édition des bulletins selon le système camerounais
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button onClick={exportAllPDFs} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Exporter tous les PDF
                        </Button>
                    </div>
                </div>

                {/* Active Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            {academicYear && (
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
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
                                <label className="text-sm font-medium">Période académique</label>
                                <div className="p-2 bg-muted rounded-lg text-sm">
                                    {getCurrentAcademicPeriod()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Students List */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Élève</TableHead>
                                    <TableHead>Matricule</TableHead>
                                    <TableHead>Moyenne Générale</TableHead>
                                    <TableHead>Appréciation</TableHead>
                                    <TableHead>Absences</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((student) => (
                                    <TableRow key={student._id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {student.student?.firstName} {student.student?.lastName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {student.classes?.name} - {student.classes?.level}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {student.student?.matricule}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-lg font-bold ${student.overallAverage >= 10 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {student.overallAverage.toFixed(2)}
                                                </span>
                                                <span className="text-sm text-muted-foreground">/20</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${student.performance.bg} ${student.performance.color} border-0`}>
                                                {student.performance.level}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${student.overallAbsences === 0
                                                ? 'text-green-600'
                                                : student.overallAbsences <= 10
                                                    ? 'text-yellow-600'
                                                    : 'text-red-600'
                                                }`}>
                                                {student.overallAbsences}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewReportCard(student)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => exportPDF(student)}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
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

                {/* Report Card Modal */}
                {showReportCard && selectedStudent && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Bulletin de Notes</h2>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => exportPDF(selectedStudent)}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Télécharger PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowReportCard(false)}
                                    >
                                        Fermer
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div
                                    id={`report-card-${selectedStudent._id}`}
                                    ref={reportCardRef}
                                    className="bg-white p-8 border border-gray-300 rounded-lg"
                                    style={{ fontFamily: 'Arial, sans-serif' }}
                                >
                                    {/* School Header */}
                                    <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-left text-sm">
                                                <div>RÉPUBLIQUE DU CAMEROUN</div>
                                                <div>Paix - Travail - Patrie</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs">MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</div>
                                            </div>
                                            <div className="text-right text-sm">
                                                <div>***************</div>
                                                <div>***************</div>
                                            </div>
                                        </div>

                                        <h1 className="text-2xl font-bold uppercase mt-4">{SCHOOL_INFO.name}</h1>
                                        <div className="text-sm mt-2">
                                            <div>{SCHOOL_INFO.type}</div>
                                            <div>{SCHOOL_INFO.address}</div>
                                            <div>Tél: {SCHOOL_INFO.phone} - Email: {SCHOOL_INFO.email}</div>
                                            <div className="font-semibold mt-1">"{SCHOOL_INFO.motto}"</div>
                                        </div>
                                    </div>

                                    {/* Student Information */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                        <div>
                                            <table className="w-full border-collapse">
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-1 font-semibold w-1/3">Nom et Prénoms:</td>
                                                        <td className="border border-gray-300 px-3 py-1">{selectedStudent.student?.firstName} {selectedStudent.student?.lastName}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-1 font-semibold">Matricule:</td>
                                                        <td className="border border-gray-300 px-3 py-1">{selectedStudent.student?.matricule}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-1 font-semibold">Date de Naissance:</td>
                                                        <td className="border border-gray-300 px-3 py-1">
                                                            {selectedStudent.student?.dateOfBirth ? new Date(selectedStudent.student.dateOfBirth).toLocaleDateString('fr-FR') : 'Non spécifié'}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-1 font-semibold">Lieu de Naissance:</td>
                                                        <td className="border border-gray-300 px-3 py-1">{selectedStudent.student?.birthPlace || 'Non spécifié'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div>
                                            <table className="w-full border-collapse">
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-1 font-semibold w-1/3">Classe:</td>
                                                        <td className="border border-gray-300 px-3 py-1">{selectedStudent.classes?.name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-1 font-semibold">Niveau:</td>
                                                        <td className="border border-gray-300 px-3 py-1">{selectedStudent.classes?.level}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-1 font-semibold">Année Scolaire:</td>
                                                        <td className="border border-gray-300 px-3 py-1">{selectedStudent.year}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-1 font-semibold">Régime:</td>
                                                        <td className="border border-gray-300 px-3 py-1">{selectedStudent.classes?.educationSystem === 'francophone' ? 'Francophone' : 'Anglophone'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Academic Results */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-center mb-4 bg-gray-100 py-2 border border-gray-300">
                                            RÉSULTATS SCOLAIRES - {getCurrentAcademicPeriod().toUpperCase()}
                                        </h3>

                                        {/* Display based on filters */}
                                        {displayMode === 'subject' && term && sequence && subject && (
                                            <div>
                                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="border border-gray-300 px-3 py-2">Matière</th>
                                                            <th className="border border-gray-300 px-3 py-2">Note</th>
                                                            <th className="border border-gray-300 px-3 py-2">Coefficient</th>
                                                            <th className="border border-gray-300 px-3 py-2">Appréciation</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedStudent.sequenceDetails[`${term}-${sequence}`]?.subjects[subject] && (
                                                            <tr>
                                                                <td className="border border-gray-300 px-3 py-2 font-semibold">
                                                                    {subjectObj?.name}
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                                    {selectedStudent.sequenceDetails[`${term}-${sequence}`].subjects[subject].mark.toFixed(2)}
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                                    {selectedStudent.sequenceDetails[`${term}-${sequence}`].subjects[subject].coefficient}
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                                    {getAppreciation(selectedStudent.sequenceDetails[`${term}-${sequence}`].subjects[subject].mark)}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {displayMode === 'sequence' && term && sequence && (
                                            <div>
                                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="border border-gray-300 px-3 py-2">Matières</th>
                                                            <th className="border border-gray-300 px-3 py-2">Notes</th>
                                                            <th className="border border-gray-300 px-3 py-2">Coefficients</th>
                                                            <th className="border border-gray-300 px-3 py-2">Appréciations</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(selectedStudent.sequenceDetails[`${term}-${sequence}`]?.subjects || {}).map(([subjectId, subjectData]: [string, any]) => (
                                                            <tr key={subjectId}>
                                                                <td className="border border-gray-300 px-2 py-1">{subjectsData.find(s => s.id === subjectId || s._id === subjectId)?.name || 'Matière'}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">{subjectData.mark.toFixed(2)}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">{subjectData.coefficient}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">{getAppreciation(subjectData.mark)}</td>
                                                            </tr>
                                                        ))}
                                                        <tr className="bg-gray-50 font-semibold">
                                                            <td className="border border-gray-300 px-3 py-2 text-right">Moyenne de la Séquence:</td>
                                                            <td className="border border-gray-300 px-3 py-2 text-center">
                                                                {selectedStudent.sequenceDetails[`${term}-${sequence}`]?.average.toFixed(2)}
                                                            </td>
                                                            <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                                                            <td className="border border-gray-300 px-3 py-2 text-center">
                                                                {getAppreciation(selectedStudent.sequenceDetails[`${term}-${sequence}`]?.average)}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Display all terms and sequences */}
                                        {displayMode === 'overall' && (
                                            <div className="space-y-6">
                                                {selectedStudent.terms?.map((termRecord: any) => (
                                                    <div key={termRecord.termInfo} className="border border-gray-300">
                                                        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 font-bold">
                                                            {termsData.find(t => t?._id === termRecord?.termInfo || t?.id === termRecord?.termInfo)?.name} - Moyenne: {selectedStudent.termAverages[termRecord.termInfo]?.toFixed(2)}/20
                                                        </div>
                                                        {termRecord.sequences?.map((sequenceRecord: any) => (
                                                            <div key={sequenceRecord.sequenceInfo} className="border-b border-gray-300 last:border-b-0">
                                                                <div className="bg-gray-50 px-4 py-1 font-semibold">
                                                                    {termsData.find(t => t?._id === termRecord?.termInfo || t?.id === termRecord?.termInfo)?.sequences?.find(s => s._id === sequenceRecord?.sequenceInfo || s.id === sequenceRecord?.sequenceInfo)?.name} - Moyenne: {selectedStudent.sequenceAverages[`${termRecord.termInfo}-${sequenceRecord.sequenceInfo}`]?.toFixed(2)}/20
                                                                </div>
                                                                <table className="w-full border-collapse text-xs">
                                                                    <thead>
                                                                        <tr className="bg-gray-100">
                                                                            <th className="border border-gray-300 px-2 py-1">Matières</th>
                                                                            <th className="border border-gray-300 px-2 py-1">Notes</th>
                                                                            <th className="border border-gray-300 px-2 py-1">Coef.</th>
                                                                            <th className="border border-gray-300 px-2 py-1">Appréciations</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {sequenceRecord.subjects?.map((subjectRecord: any) => (
                                                                            <tr key={subjectRecord.subjectInfo}>
                                                                                <td className="border border-gray-300 px-2 py-1">{subjectsData.find(s => s.id === subjectRecord?.subjectInfo || s._id === subjectRecord?.subjectInfo)?.name || 'Matière'}</td>
                                                                                <td className="border border-gray-300 px-2 py-1 text-center">{subjectRecord.marks?.currentMark?.toFixed(2) || '0.00'}</td>
                                                                                <td className="border border-gray-300 px-2 py-1 text-center">{subjectRecord.coefficient || 1}</td>
                                                                                <td className="border border-gray-300 px-2 py-1 text-center">{getAppreciation(subjectRecord.marks?.currentMark || 0)}</td>
                                                                            </tr>
                                                                        ))}
                                                                        <tr >
                                                                            <td className="border border-gray-300 px-2 py-1">Absensces</td>
                                                                            <td className="border border-gray-300 px-2 py-1 text-center">{sequenceRecord.absences?.toFixed(2) || '0.00'}</td>
                                                                            <td className="border border-gray-300 px-2 py-1 text-center"></td>
                                                                            <td className="border border-gray-300 px-2 py-1 text-center">{getAbsencePerformanceLevel(sequenceRecord.absences || 0)?.level}</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Summary and Signatures */}
                                    <div className="grid grid-cols-2 gap-6 mt-8 text-sm">
                                        <div>
                                            <table className="w-full border-collapse border border-gray-300">
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-100">MOYENNE GÉNÉRALE</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-center font-bold text-lg">
                                                            {selectedStudent.overallAverage.toFixed(2)}/20
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-100">APPRÉCIATION GÉNÉRALE</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-center font-bold">
                                                            {selectedStudent.performance.level.toUpperCase()}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-100">TOTAL ABSENCES</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-center">
                                                            {selectedStudent.overallAbsences} hours
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-100">RANG</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-center">
                                                            À déterminer
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="text-center space-y-8">
                                            <div>
                                                <div className="mb-12">Le Chef d'Établissement</div>
                                                <div className="border-t border-gray-400 pt-1">{SCHOOL_INFO.principal}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-8 pt-4 border-t text-center text-xs text-gray-600">
                                        <p>Bulletin délivré le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        <p className="mt-1">Cachet et signature de l'établissement</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}