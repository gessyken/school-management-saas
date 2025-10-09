import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calculator,
  Download,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { usePagination } from "@/components/ui/usePagination";
import { academicService } from "@/services/academicService";
import { Tooltip } from "@/components/ui/tooltip";

const itemsPerPage = 5;

export default function GradesManagement() {
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
    loadAcademicYearRecords:any;
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
  
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [studentsMarks, setStudentsMarks] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    if (academicStudents.length > 0) {
      generateMarksMap(academicStudents);
      setLoading(false);
    }
  }, [academicStudents]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredAcademicStudents = academicStudents
    .filter(
      (academic) =>
        academic?.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        academic?.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        academic?.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        academic?.student?.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (academic) =>
        (academicYear ? academic?.year === academicYear : true) &&
        (classId ? academic?.classes?._id === classId : true)
    );

  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filteredAcademicStudents, itemsPerPage);

  const exportExcel = () => {
    try {
      const formattedData = [];

      currentData.forEach((record) => {
        const student = record.student || {};
        const classInfo = record.classes || {};
        const year = record.year;

        record.terms.forEach((term) => {
          const termName = term.termInfo?.name || 'N/A';
          const termAverage = term.average || 0;
          const termRank = term.rank ?? 'N/A';
          const termDiscipline = term.discipline || 'N/A';

          term.sequences.forEach((sequence) => {
            const sequenceName = sequence.sequenceInfo?.name || 'N/A';
            const sequenceAverage = sequence.average || 0;
            const sequenceRank = sequence.rank ?? 'N/A';
            const absences = sequence.absences || 0;

            sequence.subjects.forEach((subject) => {
              const subjectName = subject.subjectInfo?.name || 'N/A';
              const currentMark = subject.marks?.currentMark ?? 'N/A';

              const modifications =
                (subject.marks?.modified || [])
                  .map((mod) => {
                    return `Modifié le ${mod.dateModified.toLocaleDateString()} par ${mod.modifiedBy?.name || 'N/A'} (${mod.preMark} → ${mod.modMark})`;
                  })
                  .join(" | ") || 'Aucune modification';

              formattedData.push({
                'Année académique': year,
                'Nom élève': `${student.firstName || 'N/A'} ${student.lastName || ""}`,
                'Classe': classInfo.name || 'N/A',
                'Terme': termName,
                'Moyenne terme': termAverage,
                'Rang terme': termRank,
                'Discipline': termDiscipline,
                'Séquence': sequenceName,
                'Moyenne séquence': sequenceAverage,
                'Rang séquence': sequenceRank,
                'Absences': absences,
                'Matière': subjectName,
                'Note actuelle': currentMark,
                'Modifications': modifications,
                'Créé le': record.createdAt.toLocaleString(),
                'Modifié le': record.updatedAt.toLocaleString(),
              });
            });
          });
        });
      });

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Notes académiques');
      XLSX.writeFile(wb, `notes_academiques_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: 'Succès',
        description: 'Export Excel réussi',
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'export Excel',
        variant: "destructive",
      });
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text('Rapport des Notes Académiques', 14, 20);

      // Date
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Exporté le: ${date}`, 14, 28);

      // Table headers
      const tableColumn = [
        'Matricule',
        'Nom élève',
        'Email',
        'Niveau',
        'Téléphone',
        'Date naissance',
        'Genre',
      ];

      // Table rows
      const tableRows = filteredAcademicStudents.map((s) => [
        s.student?.matricule || 'N/A',
        `${s.student?.firstName || ''} ${s.student?.lastName || ''}`,
        s.student?.email || 'N/A',
        s.classes?.level || 'N/A',
        s.student?.phoneNumber || 'N/A',
        s.student?.dateOfBirth ? new Date(s.student.dateOfBirth).toLocaleDateString() : 'N/A',
        s.student?.gender === 'male' ? 'Masculin' : s.student?.gender === 'female' ? 'Féminin' : 'N/A',
      ]);

      // AutoTable
      autoTable(doc, {
        startY: 35,
        head: [tableColumn],
        body: tableRows,
        styles: {
          halign: "center",
          valign: "middle",
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35 },
      });

      // Save
      doc.save(`notes_academiques_${date.replace(/\//g, "-")}.pdf`);

      toast({
        title: 'Succès',
        description: 'Export PDF réussi',
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'export PDF',
        variant: "destructive",
      });
    }
  };

  const handleMarkUpdate = async (
    academicInfo,
    termInfo,
    sequenceInfo,
    subjectInfo,
    newMark
  ) => {
    try {
      let student = await academicService.updateMark(
        academicInfo,
        termInfo,
        sequenceInfo,
        subjectInfo,
        newMark
      );
      const record = academicStudents.find(
        (a) => a._id.toString() === academicInfo
      );
      record.terms = student?.academicYear?.terms;
      generateMarksMap(academicStudents);
      toast({
        title: 'Succès',
        description: subjectInfo === "absences"
          ? 'Absences mises à jour avec succès'
          : 'Note mise à jour avec succès',
      });
    } catch (error) {
      console.error("Failed to update students", error);
      toast({
        title: 'Erreur',
        description: subjectInfo === "absences"
          ? 'Erreur lors de la mise à jour des absences'
          : 'Erreur lors de la mise à jour de la note',
        variant: "destructive",
      });
    }
  };

  const handleStudentMarkChange = (
    academicInfo,
    termInfo,
    sequenceInfo,
    subjectInfo,
    mark
  ) => {
    if (subject !== "absences") {
      setStudentsMarks({
        ...studentsMarks,
        [`${academicInfo}-${termInfo}-${sequenceInfo}-${subjectInfo}`]: {
          ...studentsMarks[
          `${academicInfo}-${termInfo}-${sequenceInfo}-${subjectInfo}`
          ],
          marks: {
            ...studentsMarks[
              `${academicInfo}-${termInfo}-${sequenceInfo}-${subjectInfo}`
            ]?.marks,
            currentMark: Number(mark) || "",
          },
        },
      });
    } else {
      setStudentsMarks({
        ...studentsMarks,
        [`${academicInfo}-${termInfo}-${sequenceInfo}-${subjectInfo}`]:
          Number(mark) || "",
      });
    }
  };

  const generateMarksMap = (academicStudents) => {
    const marksMap = {};

    academicStudents.forEach((student) => {
      const academicId = student._id.toString();

      student.terms?.forEach((term) => {
        const termId = term.termInfo.toString();

        term.sequences?.forEach((sequence) => {
          const sequenceId = sequence.sequenceInfo.toString();
          const key = `${academicId}-${termId}-${sequenceId}-absences`;
          marksMap[key] = sequence.absences ?? 0;
          sequence.subjects?.forEach((subject) => {
            const subjectId = subject.subjectInfo.toString();
            const key = `${academicId}-${termId}-${sequenceId}-${subjectId}`;
            marksMap[key] = subject ?? 0;
          });
        });
      });
    });

    setStudentsMarks(marksMap);
  };

  const calculateRank = async (
    classId,
    year,
    termId,
    sequenceId,
    subjectId
  ) => {
    try {
      await academicService.subjectRank(
        classId,
        year,
        termId,
        sequenceId,
        subjectId
      );
      loadAcademicYearRecords()
      // Note: You might need to refresh the academicStudents data here
      toast({
        title: 'Succès',
        description: 'Classement calculé avec succès',
      });
    } catch (error) {
      console.error("Failed to calculate rank", error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du calcul du classement',
        variant: "destructive",
      });
    }
  };

  function formatToMax2Decimals(value) {
    if (typeof value !== "number") return value;

    const str = value.toString();
    const decimalPart = str.split(".")[1];

    if (decimalPart && decimalPart.length > 2) {
      return value.toFixed(2);
    }
    return str;
  }

  // Show loading if no data from context
  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen">
        <div className="flex justify-center items-center p-8">
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
          <span className="ml-2 text-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Gestion des Notes
        </h1>

        <Card className="p-6 space-y-6 shadow-lg border-0 bg-background/90 backdrop-blur-sm">
          {/* Filtres Actifs */}
          {(academicYear || classId || term || sequence || subject) && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3">Filtres actifs:</h3>
              <div className="flex flex-wrap gap-2">
                {academicYear && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Année: {academicYear}
                  </span>
                )}
                {educationSystem && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Système: {educationSystem}
                  </span>
                )}
                {level && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Niveau: {level}
                  </span>
                )}
                {classId && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    Classe: {classObj?.name}
                  </span>
                )}
                {term && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    Terme: {termObj?.name}
                  </span>
                )}
                {sequence && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    Séquence: {sequenceObj?.name}
                  </span>
                )}
                {subject && (
                  <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                    Matière: {subjectObj?.name}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Instructions si pas de filtre */}
          {!academicYear && (
            <div className="p-6 text-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Sélectionnez des filtres dans la section supérieure pour voir les notes
              </p>
            </div>
          )}

          {/* Export + Search - seulement si des filtres sont actifs */}
          {academicYear && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div></div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={exportExcel}
                    className="flex items-center gap-2 border-border hover:bg-background/80"
                  >
                    <Download className="h-4 w-4" />
                    Exporter Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportPDF}
                    className="flex items-center gap-2 border-border hover:bg-background/80"
                  >
                    <Download className="h-4 w-4" />
                    Exporter PDF
                  </Button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Input
                  placeholder="Rechercher un élève..."
                  className="md:w-1/3 w-full border-border focus:border-primary focus:ring-primary"
                  onChange={handleSearch}
                  value={searchTerm}
                />
              </div>

              {/* Détails du sujet */}
              {subject && (
                <div className="border rounded-lg p-4 bg-muted/50 shadow-sm border-border">
                  {subject === "absences" ? (
                    <div className="text-sm text-foreground space-y-2">
                      <p className="font-semibold text-destructive">
                        Gestion des absences sélectionnée
                      </p>
                      <p>
                        Gestion des absences pour le terme {term} de l'année {academicYear}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-foreground space-y-2">
                      <p>
                        <strong>Matière sélectionnée:</strong> {subjectObj?.name}
                      </p>
                      <p>
                        <strong>Terme:</strong> {termObj?.name}
                      </p>
                      <p>
                        <strong>Séquence:</strong> {sequenceObj?.name}
                      </p>
                      <p>
                        <strong>Année académique:</strong> {academicYear}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tableau des Notes */}
              {filteredAcademicStudents.length > 0 ? (
                <>
                  <Table className="border-border">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead
                          rowSpan={2}
                          style={{ verticalAlign: "middle", textAlign: "center" }}
                          className="text-foreground"
                        >
                          Matricule
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          style={{ verticalAlign: "middle", textAlign: "center" }}
                          className="text-foreground"
                        >
                          Nom de l'élève
                        </TableHead>

                        {sequence && (
                          <TableHead
                            colSpan={subject !== "absences" ? 3 : 1}
                            className="text-center align-middle text-foreground"
                          >
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <span>Séquence {sequenceObj?.name}</span>
                              {subject !== "absences" && (
                                <Tooltip>
                                  <Button
                                    title="Calculer le classement"
                                    size="sm"
                                    className="bg-primary/10 hover:bg-primary/20 text-primary"
                                    onClick={() => {
                                      calculateRank(
                                        classId,
                                        academicYear,
                                        term,
                                        sequence,
                                        subject
                                      );
                                    }}
                                  >
                                    <Calculator size={16} />
                                  </Button>
                                </Tooltip>
                              )}
                            </div>
                          </TableHead>
                        )}
                      </TableRow>

                      <TableRow>
                        {sequence && (
                          <>
                            {subject !== "absences" ? (
                              <>
                                <TableHead className="text-center text-foreground">
                                  Note
                                </TableHead>
                                <TableHead className="text-center text-foreground">
                                  Rang
                                </TableHead>
                                <TableHead className="text-center text-foreground">
                                  Discipline
                                </TableHead>
                              </>
                            ) : (
                              <TableHead className="text-center text-foreground">
                                Absences
                              </TableHead>
                            )}
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.map((record, rowIndex) => (
                        <TableRow
                          key={record._id}
                          className={`${rowIndex % 2 === 0 ? "bg-muted/30" : "bg-background"
                            } hover:bg-muted/50 transition-colors`}
                        >
                          <TableCell className="py-2 px-3 font-medium text-foreground">
                            {record?.student?.matricule}
                          </TableCell>
                          <TableCell className="py-2 px-3 font-medium text-foreground">
                            {record?.student?.fullName ||
                              `${record.student.firstName} ${record.student.lastName}`}
                          </TableCell>

                          {subject && sequence && (
                            <>
                              {subject !== "absences" ? (
                                <>
                                  <TableCell className="py-2 px-3">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.01"
                                      disabled={!academicYearObj.isCurrent}
                                      value={(() => {
                                        const mark =
                                          studentsMarks[
                                            `${record._id}-${term}-${sequence}-${subject}`
                                          ]?.marks?.currentMark ?? 0;

                                        const str = mark.toString();
                                        const decimalPart = str.split(".")[1];

                                        if (
                                          decimalPart &&
                                          decimalPart.length > 2
                                        ) {
                                          return mark.toFixed(2);
                                        }
                                        return str;
                                      })()}
                                      className="w-[10ch] text-center text-sm border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                                      onChange={(e) => {
                                        handleStudentMarkChange(
                                          record._id,
                                          term,
                                          sequence,
                                          subject,
                                          e.target.value
                                        );
                                      }}
                                      onBlur={(e) => {
                                        handleMarkUpdate(
                                          record._id,
                                          term,
                                          sequence,
                                          subject,
                                          e.target.value
                                        );
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="py-2 px-3">
                                    <Input
                                      type="number"
                                      readOnly
                                      value={
                                        studentsMarks[
                                          `${record._id}-${term}-${sequence}-${subject}`
                                        ]?.rank ?? ""
                                      }
                                      className="w-[10ch] text-center text-sm border border-border bg-muted/50 rounded-md px-2 py-1"
                                    />
                                  </TableCell>
                                  <TableCell className="py-2 px-3">
                                    <Input
                                      type="text"
                                      readOnly
                                      value={
                                        studentsMarks[
                                          `${record._id}-${term}-${sequence}-${subject}`
                                        ]?.discipline ?? ""
                                      }
                                      className="w-[10ch] text-center text-sm border border-border bg-muted/50 rounded-md px-2 py-1"
                                    />
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="py-2 px-3">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.01"
                                      value={
                                        studentsMarks[
                                        `${record._id}-${term}-${sequence}-${subject}`
                                        ] ?? 0
                                      }
                                      className="w-[10ch] text-center text-sm border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                                      onChange={(e) => {
                                        handleStudentMarkChange(
                                          record._id,
                                          term,
                                          sequence,
                                          subject,
                                          e.target.value
                                        );
                                      }}
                                      onBlur={(e) => {
                                        handleMarkUpdate(
                                          record._id,
                                          term,
                                          sequence,
                                          subject,
                                          e.target.value
                                        );
                                      }}
                                    />
                                  </TableCell>
                                </>
                              )}
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="bg-primary/10 hover:bg-primary/20 text-primary"
                      >
                        Précédent
                      </Button>

                      <div className="space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <Button
                            key={i + 1}
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            className={currentPage === i + 1 ? "bg-gradient-to-r from-primary to-secondary text-white" : "border-border hover:bg-muted/50"}
                            onClick={() => goToPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </div>

                      <Button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="bg-primary/10 hover:bg-primary/20 text-primary"
                      >
                        Suivant
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground italic">
                  Aucun élève trouvé avec les filtres sélectionnés
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}