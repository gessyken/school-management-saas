import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { studentService, Student } from "@/lib/services/studentService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  BadgeCheck,
  Calculator,
  Calendar,
  Download,
  Edit2,
  FilePlus,
  GraduationCap,
  Info,
  Loader2,
  Mail,
  Phone,
  Smile,
  Upload,
  User,
  XCircle,
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

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { usePagination } from "@/components/ui/usePagination";
import {
  AcademicYear,
  Sequence,
  settingService,
  Term,
} from "@/lib/services/settingService";
import { classService, SchoolClass } from "@/lib/services/classService";
import {
  AcademicSequence,
  academicService,
  AcademicSubject,
  AcademicTerm,
  AcademicYearStudent,
} from "@/lib/services/academicService";
import { Tooltip } from "@/components/ui/tooltip";
import "../../assets/style.css";

const itemsPerPage = 5;

export default function GradesManagement() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [academicStudents, setAcademicStudents] = useState<AcademicYearStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [filter, setFilter] = useState({
    level: "",
    classes: "",
    term: "",
    academicYear: "",
    subject: "",
  });
  const [terms, setTerms] = useState<Term[]>([]);
  const [studentsMarks, setStudentsMarks] = useState<any>({});
  const [classesSubjects, setClassesSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    loadAcademicYearDetail();
    fetchAcademicYear();
    loadTerms();
    loadSequences();
  }, []);

  const loadSequences = async () => {
    try {
      const data = await settingService.getSequences();
      setSequences(data);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('school.grades.error.load_sequences'),
        variant: "destructive",
      });
    }
  };

  const loadAcademicYearDetail = async () => {
    try {
      const data = await settingService.getAcademicYears();
      setAcademicYears(data);
      if (data.length > 0 && filter.academicYear === "") {
        setFilter({
          ...filter,
          academicYear: data.find((opt) => opt.isCurrent)?.name,
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('school.grades.error.load_academic_years'),
        variant: "destructive",
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await classService.getAll({});
      setClasses(res.data.classes);
    } catch {
      toast({
        title: t('common.error'),
        description: t('school.grades.error.load_classes'),
        variant: "destructive",
      });
    }
  };

  const fetchAcademicYear = async () => {
    try {
      const data = await academicService.getAll();
      setAcademicStudents(data.students);
      generateMarksMap(data.students);
    } catch (error) {
      console.error("Failed to fetch students", error);
      toast({
        title: t('common.error'),
        description: t('school.grades.error.load_students'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTerms = async () => {
    try {
      const data = await settingService.getTerms({});
      setTerms(data);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('school.grades.error.load_terms'),
        variant: "destructive",
      });
    }
  };

  const filteredTerms = terms.filter((term) =>
    filter.academicYear ? term.academicYear === filter.academicYear : true
  );

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
        (filter.academicYear ? academic?.year === filter.academicYear : true) &&
        (!filter.classes ? false : academic?.classes?._id === filter.classes)
    );

  const filteredClasses = classes.filter((item) =>
    filter.level ? item.level === filter.level : true
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
          const termName = term.termInfo?.name || t('common.na');
          const termAverage = term.average || 0;
          const termRank = term.rank ?? t('common.na');
          const termDiscipline = term.discipline || t('common.na');

          term.sequences.forEach((sequence) => {
            const sequenceName = sequence.sequenceInfo?.name || t('common.na');
            const sequenceAverage = sequence.average || 0;
            const sequenceRank = sequence.rank ?? t('common.na');
            const absences = sequence.absences || 0;

            sequence.subjects.forEach((subject) => {
              const subjectName = subject.subjectInfo?.name || t('common.na');
              const currentMark = subject.marks?.currentMark ?? t('common.na');

              const modifications =
                (subject.marks?.modified || [])
                  .map((mod) => {
                    return t('school.grades.export.modification', {
                      date: mod.dateModified.toLocaleDateString(),
                      name: mod.modifiedBy?.name || t('common.na'),
                      before: mod.preMark,
                      after: mod.modMark
                    });
                  })
                  .join(" | ") || t('school.grades.export.no_modifications');

              formattedData.push({
                [t('school.grades.export.academic_year')]: year,
                [t('school.grades.export.student_name')]: `${student.firstName || t('common.na')} ${student.lastName || ""}`,
                [t('school.grades.export.class')]: classInfo.name || t('common.na'),
                [t('school.grades.export.term')]: termName,
                [t('school.grades.export.term_average')]: termAverage,
                [t('school.grades.export.term_rank')]: termRank,
                [t('school.grades.export.discipline')]: termDiscipline,
                [t('school.grades.export.sequence')]: sequenceName,
                [t('school.grades.export.sequence_average')]: sequenceAverage,
                [t('school.grades.export.sequence_rank')]: sequenceRank,
                [t('school.grades.export.absences')]: absences,
                [t('school.grades.export.subject')]: subjectName,
                [t('school.grades.export.current_mark')]: currentMark,
                [t('school.grades.export.mark_modifications')]: modifications,
                [t('school.grades.export.created_at')]: record.createdAt.toLocaleString(),
                [t('school.grades.export.updated_at')]: record.updatedAt.toLocaleString(),
              });
            });
          });
        });
      });

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('school.grades.export.sheet_name'));
      XLSX.writeFile(wb, `${t('school.grades.export.filename')}.xlsx`);

      toast({
        title: t('common.success'),
        description: t('school.grades.success.export_excel'),
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t('common.error'),
        description: t('school.grades.error.export_excel'),
        variant: "destructive",
      });
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text(t('school.grades.export.pdf_title'), 14, 20);

      // Date
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${t('school.grades.export.export_date')}: ${date}`, 14, 28);

      // Table headers
      const tableColumn = [
        t('school.grades.export.matricule'),
        t('school.grades.export.student_name'),
        t('school.grades.export.email'),
        t('school.grades.export.level'),
        t('school.grades.export.phone'),
        t('school.grades.export.dob'),
        t('school.grades.export.gender'),
      ];

      // Table rows
      const tableRows = students.map((s) => [
        s.matricule,
        s.firstName,
        s.email,
        s.level,
        s.phoneNumber,
        new Date(s.dateOfBirth).toLocaleDateString(),
        s.gender ? t(`school.students.gender.${s.gender}`) : t('common.na'),
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
      doc.save(`${t('school.grades.export.filename')}_${date.replace(/\//g, "-")}.pdf`);

      toast({
        title: t('common.success'),
        description: t('school.grades.success.export_pdf'),
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: t('common.error'),
        description: t('school.grades.error.export_pdf'),
        variant: "destructive",
      });
    }
  };

  const FilterBlock = ({ label, children }) => (
    <div>
      <label className="block mb-1 text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );

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
        title: t('common.success'),
        description: subjectInfo === "absences"
          ? t('school.grades.success.update_absences')
          : t('school.grades.success.update_mark'),
      });
    } catch (error) {
      console.error("Failed to update students", error);
      toast({
        title: t('common.error'),
        description: subjectInfo === "absences"
          ? t('school.grades.error.update_absences')
          : t('school.grades.error.update_mark'),
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
    if (filter.subject !== "absences") {
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
      await fetchAcademicYear();
      toast({
        title: t('common.success'),
        description: t('school.grades.success.calculate_rank'),
      });
    } catch (error) {
      console.error("Failed to update students", error);
      toast({
        title: t('common.error'),
        description: t('school.grades.error.calculate_rank'),
        variant: "destructive",
      });
    }
  };

  const filteredSeq = sequences
    .filter((seq) => filteredTerms.some((opt) => opt._id === seq.term._id))
    .filter((seq) => (filter.term ? seq.term._id === filter.term : false));

  function formatToMax2Decimals(value) {
    if (typeof value !== "number") return value;

    const str = value.toString();
    const decimalPart = str.split(".")[1];

    if (decimalPart && decimalPart.length > 2) {
      return value.toFixed(2);
    }
    return str;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        {t('school.grades.title')}
      </h1>

      <Card className="p-6 space-y-6 shadow-sm">
        {/* Search + Export */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div></div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={exportExcel}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('school.grades.export.excel')}
            </Button>
            <Button
              variant="outline"
              onClick={exportPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('school.grades.export.pdf')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FilterBlock label={t('school.grades.filters.academic_year')}>
            <Input readOnly value={filter.academicYear} />
          </FilterBlock>
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              {t('school.grades.filters.class')}
            </label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              required
              value={filter.classes}
              onChange={(e) => {
                const classId = e.target.value;
                setFilter({ ...filter, classes: classId, subject: "" });
                setClassesSubjects(
                  filteredClasses.find((c) => c._id === classId)?.subjects || []
                );
                generateMarksMap(academicStudents);
              }}
            >
              <option value="">{t('school.grades.filters.select_class')}</option>
              {filteredClasses.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.classesName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              {t('school.grades.filters.subject')}
            </label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              required
              value={filter.subject}
              onChange={(e) => {
                const subjectId = e.target.value;
                setFilter({ ...filter, subject: subjectId });
                generateMarksMap(academicStudents);
              }}
            >
              <option value="">{t('school.grades.filters.select_subject')}</option>
              <option value="absences">{t('school.grades.absences')}</option>
              {classesSubjects.map((item) => (
                <option
                  key={item?.subjectInfo?._id}
                  value={item?.subjectInfo?._id}
                >
                  {item?.subjectInfo?.subjectName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              {t('school.grades.filters.term')}
            </label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              required
              value={filter.term}
              onChange={(e) => {
                setFilter({ ...filter, term: e.target.value });
                generateMarksMap(academicStudents);
              }}
            >
              <option value="">{t('school.grades.filters.select_term')}</option>
              {filteredTerms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject Details */}
        {filter.subject && (
          <div className="border rounded-lg p-4 bg-muted mt-4 shadow-sm">
            {filter.subject === "absences" ? (
              <>
                <div className="text-sm text-foreground space-y-2">
                  <p className="font-semibold text-destructive">
                    {t('school.grades.absences_selected')}
                  </p>
                  <p>
                    {t('school.grades.absences_description', {
                      term: filteredTerms.find((t) => t._id === filter.term)?.name,
                      year: filter.academicYear
                    })}
                  </p>
                </div>
              </>
            ) : (
              (() => {
                const selected = classesSubjects.find(
                  (opt) => opt.subjectInfo?._id === filter.subject
                );
                return (
                  selected && (
                    <div className="text-sm text-foreground space-y-2">
                      <p>
                        <strong>{t('school.grades.subject.name')}:</strong>{" "}
                        {selected.subjectInfo.subjectName}
                      </p>
                      <p>
                        <strong>{t('school.grades.subject.code')}:</strong>{" "}
                        {selected.subjectInfo.subjectCode}
                      </p>
                      <p>
                        <strong>{t('school.grades.subject.coefficient')}:</strong> {selected.coefficient}
                      </p>
                      <p>
                        <strong>{t('school.grades.subject.term')}:</strong>{" "}
                        {filteredTerms.find((t) => t._id === filter.term)?.name}
                      </p>
                      <p>
                        <strong>{t('school.grades.subject.academic_year')}:</strong>{" "}
                        {filter.academicYear}
                      </p>
                    </div>
                  )
                );
              })()
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Input
            placeholder={t('school.grades.search_placeholder')}
            className="md:w-1/3 w-full"
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>

        {/* Grades Table */}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
            <span className="ml-2">{t('common.loading')}</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    rowSpan={2}
                    style={{ verticalAlign: "middle", textAlign: "center" }}
                  >
                    {t('school.grades.table.matricule')}
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    style={{ verticalAlign: "middle", textAlign: "center" }}
                  >
                    {t('school.grades.table.student_name')}
                  </TableHead>

                  {filteredSeq
                    .filter((s) => s.isActive)
                    .map((seq) => (
                      <TableHead
                        colSpan={filter.subject !== "absences" ? 3 : 1}
                        key={seq._id}
                        className="text-center align-middle"
                      >
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <span>{seq.name}</span>
                          {filter.subject !== "absences" && (
                            <Tooltip >
                              <Button
                                title={t('school.grades.calculate_rank')}
                                size="sm"
                                onClick={() => {
                                  calculateRank(
                                    filter.classes,
                                    filter.academicYear,
                                    filter.term,
                                    seq._id,
                                    filter.subject
                                  );
                                }}
                              >
                                <Calculator size={16} />
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      </TableHead>
                    ))}
                </TableRow>

                <TableRow>
                  {filteredSeq
                    .filter((s) => s.isActive)
                    .map((seq) => (
                      <React.Fragment key={`${seq._id}-su(bheaders`}>
                        {filter.subject !== "absences" ? (
                          <>
                            <TableHead className="text-center">
                              {t('school.grades.table.mark')}
                            </TableHead>
                            <TableHead className="text-center">
                              {t('school.grades.table.rank')}
                            </TableHead>
                            <TableHead className="text-center">
                              {t('school.grades.table.discipline')}
                            </TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead className="text-center">
                              {t('school.grades.table.absences')}
                            </TableHead>
                          </>
                        )}
                      </React.Fragment>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((record, rowIndex) => (
                    <TableRow
                      key={record._id}
                      className={`${rowIndex % 2 === 0 ? "bg-muted/50" : "bg-background"
                        } hover:bg-muted transition-colors`}
                    >
                      <TableCell className="py-2 px-3 font-medium text-foreground">
                        {record?.student?.matricule}
                      </TableCell>
                      <TableCell className="py-2 px-3 font-medium text-foreground">
                        {record?.student?.fullName ||
                          `${record.student.firstName} ${record.student.lastName}`}
                      </TableCell>

                      {filter.subject &&
                        filteredSeq
                          .filter((s) => s.isActive)
                          .map((seq) => (
                            <React.Fragment key={seq._id}>
                              {filter.subject !== "absences" ? (
                                <>
                                  <TableCell className="py-2 px-3">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.01"
                                      value={(() => {
                                        const mark =
                                          studentsMarks[
                                            `${record._id}-${filter.term}-${seq._id}-${filter.subject}`
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
                                      className="w-[10ch] text-center text-sm border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                                      onChange={(e) => {
                                        handleStudentMarkChange(
                                          record._id,
                                          filter.term,
                                          seq._id,
                                          filter.subject,
                                          e.target.value
                                        );
                                      }}
                                      onBlur={(e) => {
                                        handleMarkUpdate(
                                          record._id,
                                          filter.term,
                                          seq._id,
                                          filter.subject,
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
                                          `${record._id}-${filter.term}-${seq._id}-${filter.subject}`
                                        ]?.rank ?? ""
                                      }
                                      className="w-[10ch] text-center text-sm border border-border bg-muted rounded-md px-2 py-1"
                                    />
                                  </TableCell>
                                  <TableCell className="py-2 px-3">
                                    <Input
                                      type="text"
                                      readOnly
                                      value={
                                        studentsMarks[
                                          `${record._id}-${filter.term}-${seq._id}-${filter.subject}`
                                        ]?.discipline ?? ""
                                      }
                                      className="w-[10ch] text-center text-sm border border-border bg-muted rounded-md px-2 py-1"
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
                                        `${record._id}-${filter.term}-${seq._id}-${filter.subject}`
                                        ] ?? 0
                                      }
                                      className="w-[10ch] text-center text-sm border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                                      onChange={(e) => {
                                        handleStudentMarkChange(
                                          record._id,
                                          filter.term,
                                          seq._id,
                                          filter.subject,
                                          e.target.value
                                        );
                                      }}
                                      onBlur={(e) => {
                                        handleMarkUpdate(
                                          record._id,
                                          filter.term,
                                          seq._id,
                                          filter.subject,
                                          e.target.value
                                        );
                                      }}
                                    />
                                  </TableCell>
                                </>
                              )}
                            </React.Fragment>
                          ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={sequences.length * 2 + 2}
                      className="text-center text-muted-foreground italic py-4"
                    >
                      {t('school.grades.no_students')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="bg-secondary"
              >
                {t('common.pagination.previous')}
              </Button>

              <div className="space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => goToPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="bg-secondary"
              >
                {t('common.pagination.next')}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}