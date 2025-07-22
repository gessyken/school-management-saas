import React, { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";

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
  const [academicStudents, setAcademicStudents] = useState<
    AcademicYearStudent[]
  >([]);
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
      console.log(res.data);
      setClasses(res.data.classes);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les classes",
      });
    }
  };
  const fetchAcademicYear = async () => {
    try {
      const data = await academicService.getAll();
      console.log("fetchAcademicYear", data);
      setAcademicStudents(data.students);
      generateMarksMap(data.students);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };
  const loadTerms = async () => {
    const data = await settingService.getTerms({});
    console.log(data);
    setTerms(data);
  };
  const filteredTerms = terms.filter((term) =>
    filter.academicYear ? term.academicYear === filter.academicYear : true
  );
  console.log("terms", terms);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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

  const FilterBlock = ({ label, children }) => (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
  console.log("filter", studentsMarks);
  const handleMarkUpdate = async (
    academicInfo,
    termInfo,
    sequenceInfo,
    subjectInfo,
    newMark
  ) => {
    try {
      console.log(academicInfo, termInfo, sequenceInfo, subjectInfo, newMark);
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
        title: "Success",
        description: `Students ${
          subjectInfo === "absences" ? "absences" : "mark"
        } update successfully`,
      });
    } catch (error) {
      console.error("Failed to update students", error);
      toast({
        title: "Erreur",
        description: `Failed to update students ${
          subjectInfo === "absences" ? "Absences" : "Mark"
        }`,
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
        title: "Success",
        description: `Students Ranks calculated successfully`,
      });
    } catch (error) {
      console.error("Failed to update students", error);
      toast({
        title: "Erreur",
        description: `Failed to calculate students Ranks`,
      });
    }
  };
  const filteredSeq = sequences
    .filter((seq) => filteredTerms.some((opt) => opt._id === seq.term._id))
    .filter((seq) => (filter.term ? seq.term._id === filter.term : false));
  // console.log("filteredSeq", filteredSeq);
  function formatToMax2Decimals(value) {
    if (typeof value !== "number") return value;

    const str = value.toString();
    const decimalPart = str.split(".")[1];

    // If decimal part exists and length > 2, fix to 2 decimals
    if (decimalPart && decimalPart.length > 2) {
      return value.toFixed(2);
    }
    // else return original string (no change)
    return str;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        📘 {t("gradeManagement.title")}
      </h1>

      <Card className="p-6 space-y-6 shadow-sm">
        {/* 🔍 Search + Export */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div></div>

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
        </div>

        {/* 📚 Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FilterBlock label={t("gradeManagement.academicYear")}>
            <Input readOnly value={filter.academicYear} />
          </FilterBlock>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {t("gradeManagement.class")}
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <option value="">{t("gradeManagement.selectClass")}</option>
              {filteredClasses.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.classesName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {t("gradeManagement.subject")}
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={filter.subject}
              onChange={(e) => {
                const subjectId = e.target.value;
                setFilter({ ...filter, subject: subjectId });
                generateMarksMap(academicStudents);
              }}
            >
              <option value="">{t("gradeManagement.selectSubject")}</option>
              <option value="absences">{t("gradeManagement.absences")}</option>
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {t("gradeManagement.term")}
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={filter.term}
              onChange={(e) => {
                setFilter({ ...filter, term: e.target.value });
                generateMarksMap(academicStudents);
              }}
            >
              <option value="">{t("gradeManagement.selectTerm")}</option>
              {filteredTerms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 📌 Subject Details */}
        {filter.subject && (
          <div className="border rounded-lg p-4 bg-gray-50 mt-4 shadow-sm">
            {filter.subject === "absences" ? (
              <>
                <div className="text-sm text-gray-700 space-y-2">
                  <p className="font-semibold text-red-600">
                    ⚠️ {t("gradeManagement.absencesSelected")}
                  </p>
                  <p>
                    {t("gradeManagement.absencesDescription1")}{" "}
                    <strong>
                      {filteredTerms.find((t) => t._id === filter.term)?.name}
                    </strong>
                    {t("gradeManagement.absencesDescription2")}{" "}
                    <strong>{filter.academicYear}</strong>.
                  </p>
                  <p>{t("gradeManagement.absencesDescription3")}</p>
                </div>
              </>
            ) : (
              (() => {
                const selected = classesSubjects.find(
                  (opt) => opt.subjectInfo?._id === filter.subject
                );
                return (
                  selected && (
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>
                        <strong>📘 {t("gradeManagement.name")}:</strong>{" "}
                        {selected.subjectInfo.subjectName}
                      </p>
                      <p>
                        <strong>🔢 {t("gradeManagement.code")}:</strong>{" "}
                        {selected.subjectInfo.subjectCode}
                      </p>
                      <p>
                        <strong>🎯 {t("gradeManagement.coefficient")}:</strong>{" "}
                        {selected.coefficient}
                      </p>
                      <p>
                        <strong>📅 {t("gradeManagement.term")}:</strong>{" "}
                        {filteredTerms.find((t) => t._id === filter.term)?.name}
                      </p>
                      <p>
                        <strong>🗓️ {t("gradeManagement.academicYear")}:</strong>{" "}
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
            placeholder={`🔎 ${t("gradeManagement.searchPlaceholder")}`}
            className="md:w-1/3 w-full"
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>

        {/* 📊 Grades Table */}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
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
                    {t("gradeManagement.registrationNumber")}
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    style={{ verticalAlign: "middle", textAlign: "center" }}
                  >
                    {t("gradeManagement.fullName")}
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
                            <Button
                              size="sm"
                              className="tooltip-button"
                              title={t("gradeManagement.calculateRank")}
                              aria-label={t(
                                "gradeManagement.calculateRankFor",
                                { name: seq.name }
                              )}
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
                              {t("gradeManagement.mark")}
                            </TableHead>
                            <TableHead className="text-center">
                              {t("gradeManagement.rank")}
                            </TableHead>
                            <TableHead className="text-center">
                              {t("gradeManagement.discipline")}
                            </TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead className="text-center">
                              {t("gradeManagement.absences")}
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
                      className={`${
                        rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <TableCell className="py-2 px-3 font-medium text-gray-700">
                        {record?.student?.matricule}
                      </TableCell>
                      <TableCell className="py-2 px-3 font-medium text-gray-700">
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
                                      className="w-[10ch] text-center text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                      className="w-[10ch] text-center text-sm border border-gray-200 bg-gray-100 rounded-md px-2 py-1"
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
                                      className="w-[10ch] text-center text-sm border border-gray-200 bg-gray-100 rounded-md px-2 py-1"
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
                                      className="w-[10ch] text-center text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="text-center text-gray-400 italic py-4"
                    >
                      {t("gradeManagement.noStudentsFound")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* 🔁 Pagination */}
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="bg-gray-100"
              >
                {t("gradeManagement.previous")}
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
                className="bg-gray-100"
              >
                {t("gradeManagement.next")}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
