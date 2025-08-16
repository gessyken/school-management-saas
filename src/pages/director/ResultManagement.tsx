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
import ReportCardManagement from "./ReportCardManagement";
import { useSearchParams } from "react-router-dom";

const itemsPerPage = 5;

export default function ResultManagement() {
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
    sequence: "",
  });
  const [terms, setTerms] = useState<Term[]>([]);
  const [studentsMarks, setStudentsMarks] = useState<any>({});
  const [classesSubjects, setClassesSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "";

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  useEffect(() => {
    fetchClasses();
    loadAcademicYearDetail();
    fetchAcademicYear();
    loadTerms();
    loadSequences();
  }, []);

  const loadSequences = async () => {
    const data = await settingService.getSequences();
    setSequences(data);
  };

  const loadAcademicYearDetail = async () => {
    const data = await settingService.getAcademicYears();
    setAcademicYears(data);
    if (data.length > 0 && filter.academicYear === "") {
      setFilter({
        ...filter,
        academicYear: data.find((opt) => opt.isCurrent)?.name,
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
        description: t('school.result.error.load_classes'),
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
        description: t('school.result.error.load_students'),
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
        description: t('school.result.error.load_terms'),
      });
    }
  };

  const filteredTerms = terms.filter((term) =>
    !filter.academicYear ? false : term.academicYear === filter.academicYear
  );
  const showTerms = filteredTerms.filter((term) =>
    filter.term ? term._id === filter.term : true
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
        (!filter.academicYear ? false : academic?.year === filter.academicYear) &&
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
                    return `${t('school.result.export.modification', {
                      date: mod.dateModified.toLocaleDateString(),
                      name: mod.modifiedBy?.name || t('common.na'),
                      before: mod.preMark,
                      after: mod.modMark
                    })}`;
                  })
                  .join(" | ") || t('school.result.export.no_modifications');

              formattedData.push({
                [t('school.result.export.academic_year')]: year,
                [t('school.result.export.student_name')]: `${student.firstName || t('common.na')} ${student.lastName || ""}`,
                [t('school.result.export.class')]: classInfo.name || t('common.na'),
                [t('school.result.export.term')]: termName,
                [t('school.result.export.term_average')]: termAverage,
                [t('school.result.export.term_rank')]: termRank,
                [t('school.result.export.discipline')]: termDiscipline,
                [t('school.result.export.sequence')]: sequenceName,
                [t('school.result.export.sequence_average')]: sequenceAverage,
                [t('school.result.export.sequence_rank')]: sequenceRank,
                [t('school.result.export.absences')]: absences,
                [t('school.result.export.subject')]: subjectName,
                [t('school.result.export.current_mark')]: currentMark,
                [t('school.result.export.mark_modifications')]: modifications,
                [t('school.result.export.created_at')]: record.createdAt.toLocaleString(),
                [t('school.result.export.updated_at')]: record.updatedAt.toLocaleString(),
              });
            });
          });
        });
      });

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('school.result.export.sheet_name'));
      XLSX.writeFile(wb, `${t('school.result.export.filename')}.xlsx`);

      toast({
        title: t('common.success'),
        description: t('school.result.success.export_excel'),
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t('common.error'),
        description: t('school.result.error.export_excel'),
        variant: "destructive",
      });
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text(t('school.result.export.pdf_title'), 14, 20);

      // Date
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${t('school.result.export.export_date')}: ${date}`, 14, 28);

      // Table headers
      const tableColumn = [
        t('school.result.export.matricule'),
        t('school.result.export.student_name'),
        t('school.result.export.email'),
        t('school.result.export.level'),
        t('school.result.export.phone'),
        t('school.result.export.dob'),
        t('school.result.export.gender'),
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
      doc.save(`${t('school.result.export.filename')}_${date.replace(/\//g, "-")}.pdf`);

      toast({
        title: t('common.success'),
        description: t('school.result.success.export_pdf'),
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: t('common.error'),
        description: t('school.result.error.export_pdf'),
        variant: "destructive",
      });
    }
  };

  const generateMarksMap = (academicStudents) => {
    const marksMap = {};

    academicStudents.forEach((student) => {
      const academicId = student._id.toString();

      student.terms?.forEach((term) => {
        const termId = term.termInfo.toString();
        const key = `${academicId}-${termId}-summary`;
        marksMap[key] = term;
        term.sequences?.forEach((sequence) => {
          const sequenceId = sequence.sequenceInfo.toString();
          const key = `${academicId}-${termId}-${sequenceId}-summary`;
          marksMap[key] = sequence;
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

  const calculateRank = async (classId, year, termId, sequenceId, subjectId) => {
    try {
      await academicService.subjectRank(classId, year, termId, sequenceId, subjectId);
      await fetchAcademicYear();
      toast({
        title: t('common.success'),
        description: t('school.result.success.calculate_rank'),
      });
    } catch (error) {
      console.error("Failed to calculate ranks", error);
      toast({
        title: t('common.error'),
        description: t('school.result.error.calculate_rank'),
        variant: "destructive",
      });
    }
  };

  const filteredSeq = sequences
    .filter((seq) => filteredTerms.some((opt) => opt._id === seq.term._id))
    .filter((seq) => (filter.term ? seq.term._id === filter.term : true));
  const showSeq = filteredSeq.filter((seq) =>
    filter.sequence ? seq._id === filter.sequence : true
  );
  const showSubject = classesSubjects.filter((subject) =>
    filter.subject ? subject.subjectInfo._id === filter.subject : true
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          {t('school.result.title')}
        </h1>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={exportExcel}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Excel
          </Button>

          <Button
            variant="outline"
            onClick={exportPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
        <Button
          variant={activeTab ? "default" : "outline"}
          onClick={() => handleTabChange(activeTab === "" ? "report-card" : "")}
        >
          {activeTab === "" ? t('school.result.report_card') : t('school.result.results')}
        </Button>
      </div>
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
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={exportPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-background p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {t('school.result.filters.title')}
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                goToPage(1);
                setSearchTerm("");
                setFilter({
                  level: "",
                  classes: "",
                  term: "",
                  academicYear: filter.academicYear, // Keep academic year
                  subject: "",
                  sequence: "",
                });
              }}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {t('school.result.filters.reset')}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-muted-foreground">
                {t('school.result.filters.academic_year')}
              </label>
              <select
                required
                value={filter.academicYear}
                onChange={(e) => {
                  const yearId = e.target.value;
                  setFilter({ ...filter, academicYear: yearId });
                }}
                className="w-full sm:w-auto border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  {t('school.result.filters.select_academic_year')}
                </option>
                {academicYears.map((year) => (
                  <option key={year._id} value={year.name}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-muted-foreground">
                {t('school.result.filters.class')}
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
                }}
              >
                <option value="">{t('school.result.filters.select_class')}</option>
                {filteredClasses.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.classesName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-muted-foreground">
                {t('school.result.filters.term')}
              </label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                required
                value={filter.term}
                onChange={(e) => {
                  setFilter({ ...filter, term: e.target.value });
                }}
              >
                <option value="">{t('school.result.filters.all')}</option>
                {filteredTerms.map((term) => (
                  <option key={term._id} value={term._id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-muted-foreground">
                {t('school.result.filters.sequence')}
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={filter.sequence}
                onChange={(e) => {
                  setFilter({ ...filter, sequence: e.target.value });
                }}
              >
                <option value="">{t('school.result.filters.all')}</option>
                {filteredSeq.map((seq) => (
                  <option key={seq._id} value={seq._id}>
                    {seq.name}
                  </option>
                ))}
              </select>
            </div>
            {activeTab === "" && (
              <div>
                <label className="block mb-1 text-sm font-medium text-muted-foreground">
                  {t('school.result.filters.subject')}
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  value={filter.subject}
                  onChange={(e) => {
                    const subjectId = e.target.value;
                    setFilter({ ...filter, subject: subjectId });
                  }}
                >
                  <option value="">{t('school.result.filters.all')}</option>
                  <option value="absences">{t('school.result.absences')}</option>
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
            )}
          </div>
        </div>
        {/* Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Input
            placeholder={t('school.result.search_placeholder')}
            className="md:w-1/3 w-full"
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>
        {/* Grades Table */}
        {activeTab === "" ? (
          <>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                <span className="ml-2">{t('common.loading')}</span>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        rowSpan={4}
                        style={{
                          position: "sticky",
                          left: 0,
                          backgroundColor: "white",
                          zIndex: 10,
                          verticalAlign: "middle",
                          textAlign: "center",
                          borderRight: "2px solid #aaa",
                          borderBottom: "2px solid #aaa",
                          minWidth: "120px",
                        }}
                      >
                        {t('school.result.table.matricule')}
                      </TableHead>
                      <TableHead
                        rowSpan={4}
                        style={{
                          position: "sticky",
                          left: "120px",
                          backgroundColor: "white",
                          zIndex: 10,
                          verticalAlign: "middle",
                          textAlign: "center",
                          borderRight: "2px solid #aaa",
                          borderBottom: "2px solid #aaa",
                          minWidth: "180px",
                        }}
                      >
                        {t('school.result.table.student_name')}
                      </TableHead>

                      {showTerms.map((term) => (
                        <TableHead
                          colSpan={
                            showSeq
                              .filter((seq) => seq.term._id === term._id)
                              .filter((s) => s.isActive).length *
                            (3 *
                              showSubject.filter((s) => s.isActive).length +
                              4) +
                            3
                          }
                          key={term._id}
                          className="text-center align-middle"
                          style={{
                            borderRight: "2px solid #aaa",
                            borderBottom: "2px solid #aaa",
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <span>{term.name}</span>
                            <Tooltip >
                              <Button
                                title={t('school.result.calculate_rank_term', { term: term.name })}
                                size="sm"
                                onClick={() => {
                                  calculateRank(
                                    filter.classes,
                                    filter.academicYear,
                                    term._id,
                                    "",
                                    ""
                                  );
                                }}
                              >
                                <Calculator size={16} />
                              </Button>
                            </Tooltip>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>

                    <TableRow>
                      {showTerms.map((term) => (
                        <>
                          {showSeq
                            .filter((s) => s.isActive)
                            .filter((seq) => seq.term._id === term._id)
                            .map((seq) => (
                              <TableHead
                                colSpan={
                                  3 *
                                  showSubject.filter((s) => s.isActive)
                                    .length +
                                  4
                                }
                                key={seq._id}
                                className="text-center align-middle"
                                style={{
                                  borderRight: "2px solid #aaa",
                                  borderBottom: "2px solid #aaa",
                                }}
                              >
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <span>{seq.name}</span>
                                  <Tooltip >
                                    <Button
                                      title={t('school.result.calculate_rank_sequence', { sequence: seq.name })}
                                      size="sm"
                                      onClick={() => {
                                        calculateRank(
                                          filter.classes,
                                          filter.academicYear,
                                          term._id,
                                          seq._id,
                                          ""
                                        );
                                      }}
                                    >
                                      <Calculator size={16} />
                                    </Button>
                                  </Tooltip>
                                </div>
                              </TableHead>
                            ))}
                          {[t('school.result.table.average'), t('school.result.table.rank'), t('school.result.table.discipline')].map((item) => (
                            <TableHead
                              rowSpan={3}
                              key={`${item}`}
                              className="text-center align-middle"
                              style={{
                                whiteSpace: "nowrap",
                                borderRight: "2px solid #aaa",
                                borderBottom: "2px solid #aaa",
                              }}
                            >
                              {item}
                            </TableHead>
                          ))}
                        </>
                      ))}
                    </TableRow>

                    <TableRow>
                      {showTerms.map((term) => (
                        <>
                          {showSeq
                            .filter((s) => s.isActive)
                            .filter((seq) => seq.term._id === term._id)
                            .map((seq) => (
                              <>
                                {showSubject
                                  .filter((s) => s.isActive)
                                  .map((subject) => (
                                    <TableHead
                                      colSpan={3}
                                      key={subject.subjectInfo._id}
                                      className="text-center align-middle"
                                      style={{
                                        whiteSpace: "nowrap",
                                        borderRight: "2px solid #aaa",
                                        borderBottom: "2px solid #aaa",
                                      }}
                                    >
                                      <div className="d-flex align-items-center justify-content-center gap-2">
                                        <span>
                                          {subject.subjectInfo?.subjectName}
                                        </span>
                                        <Tooltip >
                                          <Button
                                            size="sm"
                                            title={t('school.result.calculate_rank_subject', { subject: subject.subjectInfo?.subjectName })}
                                            onClick={() => {
                                              calculateRank(
                                                filter.classes,
                                                filter.academicYear,
                                                term._id,
                                                seq._id,
                                                subject.subjectInfo._id
                                              );
                                            }}
                                          >
                                            <Calculator size={16} />
                                          </Button>
                                        </Tooltip>
                                      </div>
                                    </TableHead>
                                  ))}
                                {[
                                  t('school.result.table.average'),
                                  t('school.result.table.absences'),
                                  t('school.result.table.rank'),
                                  t('school.result.table.discipline'),
                                ].map((item) => (
                                  <TableHead
                                    rowSpan={2}
                                    key={`${item}`}
                                    className="text-center align-middle"
                                    style={{
                                      whiteSpace: "nowrap",
                                      borderRight: "2px solid #aaa",
                                      borderBottom: "2px solid #aaa",
                                    }}
                                  >
                                    {item}
                                  </TableHead>
                                ))}
                              </>
                            ))}
                        </>
                      ))}
                    </TableRow>
                    <TableRow>
                      {showTerms.map((term) => (
                        <>
                          {showSeq
                            .filter((s) => s.isActive)
                            .filter((seq) => seq.term._id === term._id)
                            .map((seq) => (
                              <>
                                {showSubject
                                  .filter((s) => s.isActive)
                                  .map((subject) => (
                                    <React.Fragment
                                      key={`${seq._id}-su(bheaders`}
                                    >
                                      {[
                                        t('school.result.table.mark'),
                                        t('school.result.table.rank'),
                                        t('school.result.table.discipline')
                                      ].map(
                                        (item) => (
                                          <TableHead
                                            colSpan={1}
                                            key={`${subject.subjectInfo._id}-${item}`}
                                            className="text-center align-middle"
                                            style={{
                                              whiteSpace: "nowrap",
                                              borderRight: "2px solid #aaa",
                                              borderBottom: "2px solid #aaa",
                                            }}
                                          >
                                            {item}
                                          </TableHead>
                                        )
                                      )}
                                    </React.Fragment>
                                  ))}
                              </>
                            ))}
                        </>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {currentData.length > 0 ? (
                      currentData.map((record, rowIndex) => (
                        <TableRow
                          key={record._id}
                          className={`${rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-gray-100 transition-colors`}
                        >
                          {/* Sticky Matricule column */}
                          <TableCell className="py-2 px-3 font-medium text-gray-700 border border-gray-300 sticky left-0 bg-white z-20">
                            {record?.student?.matricule}
                          </TableCell>

                          {/* Sticky Full Name column */}
                          <TableCell className="py-2 px-3 font-medium text-gray-700 border border-gray-300 sticky left-[120px] bg-white z-20">
                            {record?.student?.fullName ||
                              `${record.student.firstName} ${record.student.lastName}`}
                          </TableCell>

                          {/* Dynamic terms, sequences, subjects and extra metrics */}
                          {showTerms.map((term) => {
                            return (
                              <React.Fragment key={`${term._id}`}>
                                {showSeq
                                  .filter(
                                    (seq) =>
                                      seq.isActive && seq.term._id === term._id
                                  )
                                  .map((seq) => {
                                    const activeSubjects = showSubject.filter(
                                      (s) => s.isActive
                                    );
                                    return (
                                      <React.Fragment
                                        key={`${term._id}-${seq._id}`}
                                      >
                                        {/* For each subject: 3 cells */}
                                        {activeSubjects.map((subject) => {
                                          const key = `${record._id}-${term._id}-${seq._id}-${subject.subjectInfo._id}`;
                                          const marksData =
                                            studentsMarks[key] ?? {};

                                          return (
                                            <React.Fragment key={key}>
                                              {/* Mark Input */}
                                              <TableCell className="py-2 px-3 border border-border">
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  max="20"
                                                  step="0.01"
                                                  value={(() => {
                                                    const mark =
                                                      marksData.marks
                                                        ?.currentMark ?? 0;
                                                    const str = mark.toString();
                                                    const decimalPart =
                                                      str.split(".")[1];
                                                    return decimalPart &&
                                                      decimalPart.length > 2
                                                      ? mark.toFixed(2)
                                                      : str;
                                                  })()}
                                                  className="w-[10ch] text-center text-sm border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                                                  onChange={(e) => {
                                                    // TODO: handle mark change
                                                  }}
                                                />
                                              </TableCell>

                                              {/* Rank */}
                                              <TableCell className="py-2 px-3 border border-border">
                                                <Input
                                                  type="number"
                                                  readOnly
                                                  value={marksData.rank ?? ""}
                                                  className="w-[10ch] text-center text-sm border border-border bg-muted rounded-md px-2 py-1"
                                                />
                                              </TableCell>

                                              {/* Discipline */}
                                              <TableCell className="py-2 px-3 border border-border">
                                                <Input
                                                  type="text"
                                                  readOnly
                                                  value={
                                                    marksData.discipline ?? ""
                                                  }
                                                  className="w-[10ch] text-center text-sm border border-border bg-muted rounded-md px-2 py-1"
                                                />
                                              </TableCell>
                                            </React.Fragment>
                                          );
                                        })}

                                        {/* Extra columns: Average, Absences, Rank, Discipline */}
                                        {[
                                          "average",
                                          "absences",
                                          "rank",
                                          "discipline",
                                        ].map((metric) => {
                                          const key = `${record._id}-${term._id}-${seq._id}-summary`;
                                          const summary =
                                            studentsMarks[key] ?? {};
                                          return (
                                            <TableCell
                                              key={`${key}-${metric}`}
                                              className="py-2 px-3 border border-border"
                                            >
                                              <Input
                                                type="text"
                                                readOnly
                                                value={summary[metric] ?? ""}
                                                className="w-[10ch] text-center text-sm border border-border bg-muted rounded-md px-2 py-1"
                                              />
                                            </TableCell>
                                          );
                                        })}
                                      </React.Fragment>
                                    );
                                  })}
                                {["average", "rank", "discipline"].map(
                                  (metric) => {
                                    const key = `${record._id}-${term._id}-summary`;
                                    const summary = studentsMarks[key] ?? {};
                                    return (
                                      <TableCell
                                        key={`${key}-${metric}`}
                                        className="py-2 px-3 border border-border"
                                      >
                                        <Input
                                          type="text"
                                          readOnly
                                          value={summary[metric] ?? ""}
                                          className="w-[10ch] text-center text-sm border border-border bg-muted rounded-md px-2 py-1"
                                        />
                                      </TableCell>
                                    );
                                  }
                                )}
                              </React.Fragment>
                            );
                          })}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={
                            2 +
                            showTerms.reduce((total, term) => {
                              const activeSeqCount = showSeq.filter(
                                (seq) =>
                                  seq.isActive && seq.term._id === term._id
                              ).length;
                              const activeSubjectsCount = showSubject.filter(
                                (s) => s.isActive
                              ).length;
                              return (
                                total +
                                activeSeqCount * (activeSubjectsCount * 3 + 4) // +4 for [Average, Absences, Rank, Discipline]
                              );
                            }, 0)
                          }
                          className="text-center text-muted-foreground italic py-4 border border-border"
                        >
                          {t('school.result.no_students')}
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
                    className="bg-muted"
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
                    className="bg-muted"
                  >
                    {t('common.pagination.next')}
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {currentData[0] && (
              <ReportCardManagement
                student={currentData[0]}
                terms={showTerms}
                sequences={showSeq}
                subjects={showSubject}
                studentMarks={studentsMarks}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}