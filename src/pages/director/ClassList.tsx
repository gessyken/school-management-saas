import React, { useEffect, useState, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout"; // Assuming AppLayout is still used higher up
import { studentService, Student } from "@/lib/services/studentService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Download,
  Loader2,
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
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { usePagination } from "@/components/ui/usePagination";
import { AcademicYear, settingService } from "@/lib/services/settingService";
import { classService, SchoolClass } from "@/lib/services/classService";
import {
  academicService,
  AcademicYearStudent, // Ensure this interface is complete in academicService.ts
} from "@/lib/services/academicService";
import { useSearchParams } from "react-router-dom";
import AssignStudentsToClass from "./AssignStudentsToClass";
// import Classes from "../../../backend/src/models/Classes"; // Not needed here, Classes model used via classService
import PaymentForm from "./setting/PaymentForm";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { getAllLevelsStructured } from "@/data/cameroonSubjects"; // Import levels for consistent filter

const itemsPerPage = 5;

// Interface for PaymentForm's student prop
interface PaymentStudentInfo {
  studentId: string;
  studentName: string;
  studentClass: string;
  year: string;
}

export default function ClassesList() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]); // All raw student data
  const [academicStudents, setAcademicStudents] = useState<AcademicYearStudent[]>([]); // Student data linked to academic year/class
  const [loading, setLoading] = useState<boolean>(true); // General loading state
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]); // List of academic years for filter
  const [classes, setClasses] = useState<SchoolClass[]>([]); // List of classes for filter

  const [filter, setFilter] = useState({
    level: "", // Filter by student's level
    classId: "", // Filter by student's assigned class ID
    academicYearName: "", // Filter by academic year name (e.g., "2023-2024")
  });

  const { toast } = useToast();
  const allCameroonLevels = getAllLevelsStructured(); // Get structured levels for dropdown

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "";

  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<PaymentStudentInfo | null>(null);

  // --- Data Fetching Callbacks ---
  const fetchAcademicYears = useCallback(async () => {
    try {
      const data = await settingService.getAcademicYears();
      setAcademicYears(data);
      // Set default filter to current academic year if available and not already set
      if (data.length > 0 && !filter.academicYearName) {
        const currentYear = data.find((opt: AcademicYear) => opt.isCurrent);
        if (currentYear) {
          setFilter(prev => ({ ...prev, academicYearName: currentYear.name }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch academic years:", error);
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.load_academic_years"),
        variant: "destructive"
      });
    }
  }, [t, toast, filter.academicYearName]);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await classService.getAll(); // Fetch all classes, frontend filters
      setClasses(res.data.classes || []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.load_classes"),
        variant: "destructive"
      });
    }
  }, [t, toast]);

  const fetchStudents = useCallback(async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data.students || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.load_students"),
        variant: "destructive"
      });
    } finally {
      // Set loading to false only after all initial fetches are done
      // This is a bit tricky if they run in parallel, a dedicated initialLoading state might be better
      // For now, will keep it after the main student data fetch.
    }
  }, [t, toast]);

  const fetchAcademicStudents = useCallback(async () => {
    setLoading(true); // Set loading true for the main table data
    try {
      const data = await academicService.getAll(); // Fetch academic year specific student data
      setAcademicStudents(data.students || []);
    } catch (error) {
      console.error("Failed to fetch academic students:", error);
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.load_academic_students"),
        variant: "destructive"
      });
    } finally {
      setLoading(false); // Finished loading main table data
    }
  }, [t, toast]);

  // --- Initial Data Load Effect ---
  useEffect(() => {
    // Fetch all necessary data on component mount
    fetchAcademicYears();
    fetchClasses();
    fetchStudents(); // Raw student data for 'AssignStudentsToClass'
    fetchAcademicStudents(); // Academic year specific student data for the main table
  }, [fetchAcademicYears, fetchClasses, fetchStudents, fetchAcademicStudents]);

  // --- Filtering Logic for Main Table (Academic Students) ---
  const filteredAcademicStudents = useMemo(() => {
    let result = academicStudents;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (academic) =>
          academic.student?.fullName?.toLowerCase().includes(lowerCaseSearch) ||
          academic.student?.firstName?.toLowerCase().includes(lowerCaseSearch) ||
          academic.student?.lastName?.toLowerCase().includes(lowerCaseSearch) ||
          academic.student?.matricule?.toLowerCase().includes(lowerCaseSearch)
      );
    }

    if (filter.level) {
      result = result.filter(academic => academic.classes?.level === filter.level);
    }

    if (filter.academicYearName) {
      result = result.filter(academic => academic.year === filter.academicYearName);
    }

    if (filter.classId) {
      result = result.filter(academic => academic.classes?._id === filter.classId);
    }

    return result;
  }, [academicStudents, searchTerm, filter.level, filter.academicYearName, filter.classId]);

  // --- Filtering Logic for AssignStudentsToClass (Raw Students) ---
  const filteredRawStudents = useMemo(() => {
    let result = students;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.fullName?.toLowerCase().includes(lowerCaseSearch) ||
          student.firstName?.toLowerCase().includes(lowerCaseSearch) ||
          student.lastName?.toLowerCase().includes(lowerCaseSearch) ||
          student.matricule?.toLowerCase().includes(lowerCaseSearch)
      );
    }

    if (filter.level) {
      result = result.filter(student => student.level === filter.level);
    }

    // No academicYearName or classId filter on raw students as they might not be assigned yet.

    return result;
  }, [students, searchTerm, filter.level]);


  // --- Pagination Hook ---
  const {
    currentPage,
    totalPages,
    currentData, // This will be the paginated portion of filteredAcademicStudents
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filteredAcademicStudents, itemsPerPage);

  // Reset pagination when filters or search change
  useEffect(() => {
    goToPage(1);
  }, [filteredAcademicStudents, goToPage]);

  // --- Event Handlers ---
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: string, value: string) => {
    goToPage(1); // Reset page on any filter change
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  const handleOpenPaymentForm = (academic: AcademicYearStudent) => {
    if (!academic.student || !academic.classes) {
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.missing_student_class_info"),
        variant: "destructive"
      });
      return;
    }
    setSelectedStudentForPayment({
      studentId: academic.student._id,
      studentName: `${academic.student.firstName} ${academic.student.lastName}`,
      studentClass: academic.classes.classesName,
      year: academic.year,
    });
    setOpenPaymentForm(true);
  };

  const handlePaymentSubmit = async (student: PaymentStudentInfo, fee: number) => {
    try {
      // academicService.addFee might need to accept academicYearStudent ID, student ID, and fee
      // Assuming it needs studentId and the fee amount
      await academicService.addFee(student.studentId, fee); // Adjust based on actual API
      toast({
        title: t("common.success"),
        description: t("school.class_list.payment_success"),
        variant: "default"
      });
      setOpenPaymentForm(false);
      fetchAcademicStudents(); // Refresh data to reflect new payment status/amount if needed
    } catch (error) {
      console.error("Payment submission failed:", error);
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.payment_failed"),
        variant: "destructive"
      });
    }
  };

  // --- Export Functions ---
  const exportExcel = () => {
    try {
      const formattedData: any[] = [];

      filteredAcademicStudents.forEach((record) => { // Export filtered data
        const student = record.student || {};
        const classInfo = record.classes || {};
        const academicYearName = record.year;

        record.terms.forEach((term) => {
          const termName = term.termInfo?.name || t("common.na");
          const termAverage = term.average || 0;
          const termRank = term.rank ?? t("common.na");
          const termDiscipline = term.discipline || t("common.na");

          term.sequences.forEach((sequence) => {
            const sequenceName = sequence.sequenceInfo?.name || t("common.na");
            const sequenceAverage = sequence.average || 0;
            const sequenceRank = sequence.rank ?? t("common.na");
            const absences = sequence.absences || 0;

            sequence.subjects.forEach((subject) => {
              const subjectName = subject.subjectInfo?.name || t("common.na");
              const currentMark = subject.marks?.currentMark ?? t("common.na");

              const modifications =
                (subject.marks?.modified || [])
                  .map((mod) => {
                    // Ensure dateModified is a Date object before calling toLocaleDateString
                    const modDate = mod.dateModified instanceof Date ? mod.dateModified : new Date(mod.dateModified);
                    return `${modDate.toLocaleDateString()} ${t("common.by")} ${
                      mod.modifiedBy?.name || t("common.na")
                    }: ${mod.preMark} → ${mod.modMark}`;
                  })
                  .join(" | ") || t("school.class_list.no_modifications");

              formattedData.push({
                [t("school.class_list.excel.academic_year")]: academicYearName,
                [t("school.class_list.excel.student_name")]: `${student.firstName || t("common.na")} ${
                  student.lastName || ""
                }`,
                [t("school.class_list.excel.class")]: classInfo.classesName || t("common.na"),
                [t("school.class_list.excel.level")]: student.level || t("common.na"), // Added level
                [t("school.class_list.excel.term")]: termName,
                [t("school.class_list.excel.term_average")]: termAverage,
                [t("school.class_list.excel.term_rank")]: termRank,
                [t("school.class_list.excel.discipline")]: termDiscipline,
                [t("school.class_list.excel.sequence")]: sequenceName,
                [t("school.class_list.excel.sequence_average")]: sequenceAverage,
                [t("school.class_list.excel.sequence_rank")]: sequenceRank,
                [t("school.class_list.excel.absences")]: absences,
                [t("school.class_list.excel.subject")]: subjectName,
                [t("school.class_list.excel.current_mark")]: currentMark,
                [t("school.class_list.excel.mark_modifications")]: modifications,
                [t("common.created_at")]: new Date(record.createdAt).toLocaleString(),
                [t("common.updated_at")]: new Date(record.updatedAt).toLocaleString(),
              });
            });
          });
        });
      });

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t("school.class_list.excel.sheet_name"));
      XLSX.writeFile(wb, t("school.class_list.excel.file_name"));
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.export_failed"),
        variant: "destructive"
      });
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(t("school.class_list.pdf.title"), 14, 20);

    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${t("common.export_date")}: ${date}`, 14, 28);

    const tableColumn = [
      t("school.class_list.pdf.matricule"),
      t("school.class_list.pdf.full_name"), // Changed from first_name
      t("school.class_list.pdf.email"),
      t("school.class_list.pdf.level"),
      t("school.class_list.pdf.class_name"), // Changed from phone
      t("school.class_list.pdf.academic_year"), // Changed from dob
      t("school.class_list.pdf.overall_average"), // Changed from gender
    ];

    const tableRows = filteredAcademicStudents.map((academic) => [ // Export filtered academic students
      academic.student?.matricule || t("common.na"),
      `${academic.student?.firstName || t("common.na")} ${academic.student?.lastName || ""}`,
      academic.student?.email || t("common.na"),
      academic.classes?.level || t("common.na"),
      academic.classes?.classesName || t("common.na"),
      academic.year || t("common.na"),
      academic.overallAverage ?? t("common.na"),
    ]);

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

    doc.save(`${t("school.class_list.pdf.file_prefix")}_${date.replace(/\//g, "-")}.pdf`);
  };


  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t("school.class_list.title")}</h1>
      <Card className="p-4">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <Input
              placeholder={t("school.class_list.search_placeholder")}
              className="md:w-1/3 w-full"
              onChange={handleSearch}
              value={searchTerm}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={exportExcel}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("common.excel_button")}
              </Button>

              <Button
                variant="outline"
                onClick={exportPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("common.pdf_button")}
              </Button>
            </div>
            <Button
              variant={activeTab ? "default" : "outline"}
              onClick={() =>
                handleTabChange(activeTab === "" ? "assign-student" : "")
              }
            >
              {activeTab === ""
                ? t("school.class_list.assign_student_button")
                : t("school.class_list.view_list_button")}
            </Button>
          </div>

          <div className="bg-background p-6 rounded-xl shadow border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {t("school.students.filters.title")}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  goToPage(1);
                  setSearchTerm("");
                  setFilter({
                    level: "",
                    academicYearName: academicYears.find((opt) => opt.isCurrent)?.name || "", // Reset to current or empty
                    classId: "",
                  });
                }}
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                {t("school.students.filters.reset")}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  {t("school.class_list.level_filter")}
                </label>
                <Select
                  value={filter.level}
                  onValueChange={(value) => handleFilterChange("level", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("school.students.filters.all_levels")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>{t("school.students.filters.all")}</SelectItem>
                    <SelectGroup>
                      <SelectLabel>{t('classes.system.francophone')}</SelectLabel>
                      {allCameroonLevels.francophone.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>{t('classes.system.anglophone')}</SelectLabel>
                      {allCameroonLevels.anglophone.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  {t("school.class_list.classes_filter")}
                </label>
                <Select
                  value={filter.classId}
                  onValueChange={(value) => handleFilterChange("classId", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("school.students.filters.all_classes")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>{t("school.students.filters.all")}</SelectItem>
                    {classes.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.classesName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  {t("school.class_list.academic_year_filter")}
                </label>
                <Select
                  value={filter.academicYearName}
                  onValueChange={(value) => handleFilterChange("academicYearName", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("school.class_list.select_year")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>{t("school.students.filters.all")}</SelectItem>
                    {academicYears.map((year) => (
                      <SelectItem key={year._id} value={year.name}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        {activeTab === "" ? (
          <>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">{t("common.loading")}</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("school.class_list.matricule")}</TableHead>
                      <TableHead>{t("school.class_list.full_name")}</TableHead>
                      <TableHead>{t("school.class_list.class")}</TableHead>
                      <TableHead>{t("school.class_list.level")}</TableHead>
                      <TableHead>{t("school.class_list.academic_year")}</TableHead>
                      <TableHead>{t("school.class_list.overall_average")}</TableHead>
                      <TableHead>{t("school.class_list.status")}</TableHead>
                      <TableHead>{t("school.students.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length > 0 ? (
                      currentData.map((academic) => (
                        <TableRow key={academic._id}>
                          <TableCell>{academic?.student?.matricule || t("common.na")}</TableCell>
                          <TableCell>
                            {academic?.student?.fullName ||
                              `${academic?.student?.firstName || t("common.na")} ${academic?.student?.lastName || ""}`}
                          </TableCell>
                          <TableCell>
                            {academic?.classes?.classesName || t("common.na")}
                          </TableCell>
                          <TableCell>{academic?.classes?.level || t("common.na")}</TableCell>
                          <TableCell>{academic?.year || t("common.na")}</TableCell>
                          <TableCell>{academic?.overallAverage ?? t("common.na")}</TableCell>
                          <TableCell>{academic?.student?.status || t("common.na")}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleOpenPaymentForm(academic)}
                              className="bg-primary hover:bg-primary/80 text-white px-4 py-1 rounded"
                            >
                              {t("school.class_list.add_payment")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-muted-foreground py-8"
                        >
                          {t("school.class_list.no_students_found")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    {t("common.pagination.previous")}
                  </Button>

                  <div className="space-x-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <Button
                        key={index + 1}
                        variant={currentPage === index + 1 ? "default" : "outline"}
                        onClick={() => goToPage(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    {t("common.pagination.next")}
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          // <>hello</>
          <AssignStudentsToClass
            students={filteredRawStudents} // Pass filtered raw students to assign
            selectedClass={filter.classId}
            selectedYear={filter.academicYearName}
            // selectedStudents is not used by AssignStudentsToClass based on its typical function
            // setSelectedStudents is also not used if AssignStudentsToClass handles its own selections internally
            fetchStudents={fetchAcademicStudents} // Refresh academic students after assignment
          />
        )}
        {openPaymentForm && selectedStudentForPayment && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpenPaymentForm(false);
            }}
          >
            <div className="bg-background p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
              {/* <PaymentForm
                student={selectedStudentForPayment}
                onCancel={() => setOpenPaymentForm(false)}
                onSubmit={handlePaymentSubmit}
              /> */}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}