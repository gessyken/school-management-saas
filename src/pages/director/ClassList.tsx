import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { studentService, Student } from "@/lib/services/studentService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  BadgeCheck,
  Calendar,
  Download,
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
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { usePagination } from "@/components/ui/usePagination";
import { AcademicYear, settingService } from "@/lib/services/settingService";
import { classService, SchoolClass } from "@/lib/services/classService";
import {
  academicService,
  AcademicYearStudent,
} from "@/lib/services/academicService";
import { useSearchParams } from "react-router-dom";
import AssignStudentsToClass from "./AssignStudentsToClass";
import Classes from "../../../backend/src/models/Classes";
import PaymentForm from "./setting/PaymentForm";

const itemsPerPage = 5;

export default function ClassesList() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [academicStudents, setAcademicStudents] = useState<AcademicYearStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [filter, setFilter] = useState({
    level: "",
    classes: "",
    status: "",
    academicYear: "",
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    loadAcademicYearDetail();
    fetchStudents();
    fetchAcademicYear();
  }, []);

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
        title: t("common.error"),
        description: t("school.class_list.errors.load_classes"),
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data.students);
    } catch (error) {
      console.error("Failed to fetch students", error);
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.load_students"),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYear = async () => {
    try {
      const data = await academicService.getAll();
      setAcademicStudents(data.students);
    } catch (error) {
      console.error("Failed to fetch academic students", error);
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.load_academic_students"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = students
    .filter(
      (student) =>
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((student) =>
      filter.level ? student?.level === filter.level : true
    );

  const filteredAcademicStudents = academicStudents
    .filter(
      (academic) =>
        academic?.student?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        academic?.student?.firstName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        academic?.student?.lastName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        academic?.student?.matricule
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .filter(
      (academic) =>
        (filter.level ? academic?.classes?.level === filter.level : true) &&
        (filter.academicYear ? academic?.year === filter.academicYear : true) &&
        (filter.classes ? academic?.classes?._id === filter.classes : true)
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
                    return `${mod.dateModified.toLocaleDateString()} ${t("common.by")} ${
                      mod.modifiedBy?.name
                    }: ${mod.preMark} → ${mod.modMark}`;
                  })
                  .join(" | ") || t("school.class_list.no_modifications");

              formattedData.push({
                [t("school.class_list.excel.academic_year")]: year,
                [t("school.class_list.excel.student_name")]: `${student.firstName || t("common.na")} ${
                  student.lastName || ""
                }`,
                [t("school.class_list.excel.class")]: classInfo.name || t("common.na"),
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
                [t("common.created_at")]: record.createdAt.toLocaleString(),
                [t("common.updated_at")]: record.updatedAt.toLocaleString(),
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
      t("school.class_list.pdf.first_name"),
      t("school.class_list.pdf.email"),
      t("school.class_list.pdf.level"),
      t("school.class_list.pdf.phone"),
      t("school.class_list.pdf.dob"),
      t("school.class_list.pdf.gender"),
    ];

    const tableRows = students.map((s) => [
      s.matricule,
      s.firstName,
      s.email,
      s.level,
      s.phoneNumber,
      new Date(s.dateOfBirth).toLocaleDateString(),
      s.gender,
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

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "";

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleOpenPaymentForm = (student) => {
    setSelectedStudent({
      studentId: student._id,
      studentName: student.student.firstName + " " + student.student.firstName,
      studentClass: student.classes.classesName,
      year: student.year,
    });
    setOpenPaymentForm(true);
  };

  const handlePaymentSubmit = async (student, fee) => {
    try {
      await academicService.addFee(student.studentId, fee);
      toast({
        title: t("common.success"),
        description: t("school.class_list.payment_success"),
      });
      setOpenPaymentForm(false);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("school.class_list.errors.payment_failed"),
      });
    }
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
                {/* {t("common.excel")} */}
                Excel
              </Button>

              <Button
                variant="outline"
                onClick={exportPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {/* {t("common.pdf")} */}
                PDF
              </Button>
            </div>
            <Button
              variant={activeTab ? "default" : "outline"}
              onClick={() =>
                handleTabChange(activeTab === "" ? "assign-student" : "")
              }
            >
              {activeTab === "" 
                ? t("school.class_list.assign_student") 
                : t("school.class_list.view_list")}
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
                    academicYear: filter.academicYear,
                    status: "",
                    classes: "",
                  });
                  setSelectedStudents([]);
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
                {t("school.students.filters.reset")}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  {t("school.class_list.level")}
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filter.level}
                  onChange={(e) => {
                    goToPage(1);
                    setFilter({ ...filter, level: e.target.value });
                    setSelectedStudents([]);
                  }}
                >
                  <option value="">{t("school.students.filters.all")}</option>
                  <option value="6ème">6ème</option>
                  <option value="5ème">5ème</option>
                  <option value="4ème">4ème</option>
                  <option value="3ème">3ème</option>
                  <option value="2nde">2nde</option>
                  <option value="1ère">1ère</option>
                  <option value="Terminale">Terminale</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  {t("school.class_list.classes")}
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  value={filter.classes}
                  onChange={(e) => {
                    const classId = e.target.value;
                    setFilter({ ...filter, classes: classId });
                  }}
                >
                  <option value="">{t("school.students.filters.all")}</option>
                  {filteredClasses.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.classesName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  {t("school.class_list.academic_year")}
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
                    {t("school.class_list.select_year")}
                  </option>
                  {academicYears.map((year) => (
                    <option key={year._id} value={year.name}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        {activeTab === "" ? (
          <>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
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
                      <TableHead>{t("school.class_list.status")}</TableHead>
                      <TableHead>{t("school.students.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length > 0 ? (
                      currentData.map((academic) => (
                        <TableRow key={academic._id}>
                          <TableCell>{academic?.student?.matricule}</TableCell>
                          <TableCell>
                            {academic?.student?.fullName ||
                              `${academic?.student?.firstName} ${academic?.student?.lastName}`}
                          </TableCell>
                          <TableCell>
                            {academic?.classes?.classesName || t("common.na")}
                          </TableCell>
                          <TableCell>{academic?.student?.level}</TableCell>
                          <TableCell>{academic?.student?.status}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => handleOpenPaymentForm(academic)}
                              className="bg-primary hover:bg-primary/80 text-white px-4 py-1 rounded"
                            >
                              {t("school.class_list.add_payment")}
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground"
                        >
                          {t("school.class_list.no_students")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-4">
                  <button
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded disabled:opacity-50"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    {t("common.pagination.previous")}
                  </button>

                  <div className="space-x-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === index + 1
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => goToPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded disabled:opacity-50"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    {t("common.pagination.next")}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <AssignStudentsToClass
            students={filteredStudents}
            selectedClass={filter.classes}
            selectedYear={filter.academicYear}
            selectedStudents={selectedStudents}
            setSelectedStudents={setSelectedStudents}
            fetchStudents={fetchStudents}
          />
        )}
        {openPaymentForm && selectedStudent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpenPaymentForm(false);
            }}
          >
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
              <PaymentForm
                student={selectedStudent}
                onCancel={() => setOpenPaymentForm(false)}
                onSubmit={handlePaymentSubmit}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}