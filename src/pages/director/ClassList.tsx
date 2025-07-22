import { useEffect, useState } from "react";
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
import PaymentForm from "./setting/PaymentForm";
import { useTranslation } from "react-i18next";

const itemsPerPage = 5;

export default function ClassesList() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [academicStudents, setAcademicStudents] = useState<
    AcademicYearStudent[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(
    null
  );
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
      console.log(res.data);
      setClasses(res.data.classes);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les classes",
      });
    }
  };
  const fetchStudents = async () => {
    try {
      const data = await studentService.getAll();
      console.log(data);
      setStudents(data.students);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchAcademicYear = async () => {
    try {
      const data = await academicService.getAll();
      console.log("fetchAcademicYear", data);
      setAcademicStudents(data.students);
    } catch (error) {
      console.error("Failed to fetch students", error);
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
  } = usePagination(filteredAcademicStudents, itemsPerPage); // subjects is your full data list

  const exportExcel = () => {
    try {
      const formattedData = [];

      currentData.forEach((record) => {
        const student = record.student || {};
        const classInfo = record.classes || {};
        const year = record.year;

        // Flatten each term
        record.terms.forEach((term) => {
          const termName = term.termInfo?.name || "N/A";
          const termAverage = term.average || 0;
          const termRank = term.rank ?? "N/A";
          const termDiscipline = term.discipline || "N/A";

          term.sequences.forEach((sequence) => {
            const sequenceName = sequence.sequenceInfo?.name || "N/A";
            const sequenceAverage = sequence.average || 0;
            const sequenceRank = sequence.rank ?? "N/A";
            const absences = sequence.absences || 0;

            sequence.subjects.forEach((subject) => {
              const subjectName = subject.subjectInfo?.name || "N/A";
              const currentMark = subject.marks?.currentMark ?? "N/A";

              // Handle modifications
              const modifications =
                (subject.marks?.modified || [])
                  .map((mod) => {
                    return `${mod.dateModified.toLocaleDateString()} by ${
                      mod.modifiedBy?.name
                    }: ${mod.preMark} → ${mod.modMark}`;
                  })
                  .join(" | ") || "No Modifications";

              formattedData.push({
                "Année Académique": year,
                "Nom de l'étudiant": `${student.firstName || "N/A"} ${
                  student.lastName || ""
                }`,
                Classe: classInfo.name || "N/A",
                Terme: termName,
                "Moyenne Terme": termAverage,
                "Rang Terme": termRank,
                Discipline: termDiscipline,
                Séquence: sequenceName,
                "Moyenne Séquence": sequenceAverage,
                "Rang Séquence": sequenceRank,
                Absences: absences,
                Matière: subjectName,
                "Note Actuelle": currentMark,
                "Modifications de Note": modifications,
                "Créé le": record.createdAt.toLocaleString(),
                "Mis à jour le": record.updatedAt.toLocaleString(),
              });
            });
          });
        });
      });

      // Convert to Excel
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Année Académique");
      XLSX.writeFile(wb, "academic_years.xlsx");
    } catch (error) {
      console.error(
        "Erreur lors de l'exportation des années académiques:",
        error
      );
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Liste des Matières", 14, 20);

    // Date
    const date = new Date().toLocaleDateString("fr-FR");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date d'exportation : ${date}`, 14, 28);

    // Table headers
    const tableColumn = [
      "matricule",
      "firstName",
      "email",
      "level",
      "phoneNumber",
      "dateOfBirth",
      "gender",
    ];

    // Table rows
    const tableRows = students.map((s) => [
      s.matricule,
      s.firstName,
      s.email,
      s.level,
      s.phoneNumber,
      new Date(s.dateOfBirth).toLocaleDateString(),
      s.gender,
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
        fillColor: [41, 128, 185], // Blue
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35 },
    });

    // Save
    doc.save(`matieres_${date.replace(/\//g, "-")}.pdf`);
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
    // refresh data or show notification
    try {
      await academicService.addFee(student.studentId, fee);
      toast({
        title: "success",
        description: "Fee added successfully",
      });
      setOpenPaymentForm(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Failed to add fee",
      });
    }
  };
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t("classListManagement.title")}</h1>
      <Card className="p-4">
        <div className="space-y-6">
          {/* Top Bar: Search + Actions */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <Input
              placeholder={t("classListManagement.searchPlaceholder")}
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
                {t("common.excel")}
              </Button>

              <Button
                variant="outline"
                onClick={exportPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("common.pdf")}
              </Button>
            </div>
            <Button
              variant={activeTab ? "default" : "outline"}
              onClick={() =>
                handleTabChange(activeTab === "" ? "assign-student" : "")
              }
            >
              {activeTab === ""
                ? t("classListManagement.assignStudent")
                : t("classListManagement.viewList")}
            </Button>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("classListManagement.filters")}
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
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
                {t("classListManagement.reset")}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t("classListManagement.level")}
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter.level}
                  onChange={(e) => {
                    goToPage(1);
                    setFilter({ ...filter, level: e.target.value });
                    setSelectedStudents([]);
                  }}
                >
                  <option value="">{t("classListManagement.all")}</option>
                  {[
                    "Form 1",
                    "Form 2",
                    "Form 3",
                    "Form 4",
                    "Form 5",
                    "Lower Sixth",
                    "Upper Sixth",
                  ].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t("classListManagement.classes")}
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={filter.classes}
                  onChange={(e) => {
                    const classId = e.target.value;
                    setFilter({ ...filter, classes: classId });
                  }}
                >
                  <option value="">{t("classListManagement.all")}</option>
                  {filteredClasses.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.classesName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t("classListManagement.academicYear")}
                </label>
                <select
                  required
                  value={filter.academicYear}
                  onChange={(e) => {
                    const yearId = e.target.value;
                    setFilter({ ...filter, academicYear: yearId });
                  }}
                  className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    {t("classListManagement.selectAcademicYear")}
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
                <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("classListManagement.registrationNumber")}
                      </TableHead>
                      <TableHead>{t("classListManagement.fullName")}</TableHead>
                      <TableHead>{t("classListManagement.class")}</TableHead>
                      <TableHead>{t("classListManagement.level")}</TableHead>
                      <TableHead>{t("classListManagement.status")}</TableHead>
                      <TableHead>{t("classListManagement.actions")}</TableHead>
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
                          <TableCell>
                            {t(
                              `classListManagement.statuses.${academic?.student?.status}`
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleOpenPaymentForm(academic)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                            >
                              {t("classListManagement.addPayment")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground"
                        >
                          {t("classListManagement.noStudentsFound")}
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
                    {t("classListManagement.previous")}
                  </Button>

                  <div className="space-x-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <Button
                        key={index + 1}
                        variant={
                          currentPage === index + 1 ? "default" : "outline"
                        }
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
                    {t("classListManagement.next")}
                  </Button>
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
