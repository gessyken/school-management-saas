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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, CheckCircle, Trash } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { usePagination } from "@/components/ui/usePagination";
import { useToast } from "@/components/ui/use-toast";

const itemsPerPage = 5;

export default function StudentManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Generate automatic matricule
  const generateMatricule = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `STU${year}${random}`;
  };

  const [form, setForm] = useState<Student>({
    matricule: generateMatricule(),
    firstName: "",
    lastName: "",
    email: "",
    level: "",
    dateOfBirth: "",
  });
  const [educationSystem, setEducationSystem] = useState<'francophone' | 'anglophone'>('francophone');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getAll();
      console.log(data);
      setStudents(data.students || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
      setError(t('school.students.error.loading'));
      setStudents([]);
      toast({
        title: t('common.error'),
        description: t('school.students.error.load_failed'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const [filter, setFilter] = useState({
    level: "",
    gender: "",
    status: "",
  });

  const filteredStudents = students
    .filter(
      (student) =>
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (student) =>
        (filter.level ? student.level === filter.level : true) &&
        (filter.gender ? student.gender === filter.gender : true) &&
        (filter.status ? student.status === filter.status : true)
    );

  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filteredStudents, itemsPerPage);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm(t('school.students.confirm_delete'))) {
      try {
        await studentService.delete(id);
        fetchStudents();
        toast({
          title: t('common.success'),
          description: t('school.students.success.deleted'),
        });
      } catch (error) {
        console.error("Failed to delete student", error);
        toast({
          title: t('common.error'),
          description: t('school.students.error.delete_failed'),
          variant: "destructive",
        });
      }
    }
  };

  const openModal = (
    mode: "view" | "edit" | "create",
    student: Student = null
  ) => {
    setSelectedStudent(student);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData: any[] = XLSX.utils.sheet_to_json(ws);

      const parsedData: Student[] = rawData.map((row) => ({
        matricule: row[t('school.students.export.matricule')],
        firstName: row[t('school.students.export.firstName')],
        lastName: row[t('school.students.export.lastName')],
        email: row[t('school.students.export.email')] !== "N/A" ? row[t('school.students.export.email')] : "",
        phoneNumber: row[t('school.students.export.phone')] !== "N/A" ? row[t('school.students.export.phone')] : "",
        gender: row[t('school.students.export.gender')] !== "N/A" ? row[t('school.students.export.gender')] : undefined,
        dateOfBirth:
          row[t('school.students.export.dob')] !== "N/A" ? row[t('school.students.export.dob')] : "",
        level: row[t('school.students.export.level')],
        status: row[t('school.students.export.status')] !== "N/A" ? row[t('school.students.export.status')] : undefined,
        address: {
          street:
            row[t('school.students.export.address_street')] !== "N/A" ? row[t('school.students.export.address_street')] : undefined,
          city:
            row[t('school.students.export.address_city')] !== "N/A"
              ? row[t('school.students.export.address_city')]
              : undefined,
          state:
            row[t('school.students.export.address_state')] !== "N/A"
              ? row[t('school.students.export.address_state')]
              : undefined,
          country:
            row[t('school.students.export.address_country')] !== "N/A" ? row[t('school.students.export.address_country')] : undefined,
        },
        emergencyContact: {
          name:
            row[t('school.students.export.emergency_name')] !== "N/A"
              ? row[t('school.students.export.emergency_name')]
              : undefined,
          relationship:
            row[t('school.students.export.emergency_relation')] !== "N/A"
              ? row[t('school.students.export.emergency_relation')]
              : undefined,
          phone:
            row[t('school.students.export.emergency_phone')] !== "N/A"
              ? row[t('school.students.export.emergency_phone')]
              : undefined,
        },
        createdAt:
          row[t('school.students.export.created_at')] !== "N/A"
            ? row[t('school.students.export.created_at')]
            : undefined,
        updatedAt:
          row[t('school.students.export.updated_at')] !== "N/A"
            ? row[t('school.students.export.updated_at')]
            : undefined,
      }));
      
      studentService.bulkImport(parsedData)
        .then(() => {
          fetchStudents();
          toast({
            title: t('common.success'),
            description: t('school.students.success.imported'),
          });
        })
        .catch(error => {
          console.error("Import failed:", error);
          toast({
            title: t('common.error'),
            description: t('school.students.error.import_failed'),
            variant: "destructive",
          });
        });
    };
    reader.readAsBinaryString(file);
  };

  const exportExcel = () => {
    const formattedStudents = students.map((student) => ({
      [t('school.students.export.matricule')]: student.matricule,
      [t('school.students.export.firstName')]: student.firstName,
      [t('school.students.export.lastName')]: student.lastName,
      [t('school.students.export.email')]: student.email || "N/A",
      [t('school.students.export.phone')]: student.phoneNumber || "N/A",
      [t('school.students.export.gender')]: student.gender || "N/A",
      [t('school.students.export.dob')]: student.dateOfBirth || "N/A",
      [t('school.students.export.level')]: student.level,
      [t('school.students.export.status')]: student.status || "N/A",
      [t('school.students.export.address_street')]: student.address?.street || "N/A",
      [t('school.students.export.address_city')]: student.address?.city || "N/A",
      [t('school.students.export.address_state')]: student.address?.state || "N/A",
      [t('school.students.export.address_country')]: student.address?.country || "N/A",
      [t('school.students.export.emergency_name')]: student.emergencyContact?.name || "N/A",
      [t('school.students.export.emergency_relation')]:
        student.emergencyContact?.relationship || "N/A",
      [t('school.students.export.emergency_phone')]: student.emergencyContact?.phone || "N/A",
      [t('school.students.export.created_at')]: student.createdAt || "N/A",
      [t('school.students.export.updated_at')]: student.updatedAt || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(formattedStudents);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('school.students.export.sheet_name'));
    XLSX.writeFile(wb, `${t('school.students.export.filename')}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text(t('school.students.export.pdf_title'), 14, 20);

    // Date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${t('school.students.export.export_date')}: ${date}`, 14, 28);

    // Table headers
    const tableColumn = [
      t('school.students.export.matricule'),
      t('school.students.export.firstName'),
      t('school.students.export.email'),
      t('school.students.export.level'),
      t('school.students.export.phone'),
      t('school.students.export.dob'),
      t('school.students.export.gender'),
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
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35 },
    });

    // Save
    doc.save(`${t('school.students.export.filename')}_${date.replace(/\//g, "-")}.pdf`);
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      const francophonesLevels = ['6e', '5e', '4e', '3e', '2nde', '1ère', 'Terminale'];
      const detectedSystem = francophonesLevels.includes(student.level) ? 'francophone' : 'anglophone';
      
      setForm(student);
      setEducationSystem(detectedSystem);
      setEditingId(student._id || null);
    } else {
      resetForm();
    }
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      if (editingId) {
        await studentService.update(editingId, form);
        toast({
          title: t('common.success'),
          description: t('school.students.success.updated'),
        });
      } else {
        await studentService.create(form);
        toast({
          title: t('common.success'),
          description: t('school.students.success.created'),
        });
      }
      await fetchStudents();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to submit student:", error);
      setError(editingId 
        ? t('school.students.error.update_failed') 
        : t('school.students.error.create_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      matricule: generateMatricule(),
      firstName: "",
      lastName: "",
      email: "",
      level: "",
      dateOfBirth: "",
    });
    setEducationSystem('francophone');
    setEditingId(null);
    setError(null);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t('school.students.title')}</h1>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <Card className="p-4">
        <div className="space-y-6">
          {/* Top Bar: Search + Actions */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <Input
              placeholder={t('school.students.search_placeholder')}
              className="md:w-1/3 w-full"
              onChange={handleSearch}
              value={searchTerm}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                className="flex items-center gap-2"
                onClick={() => handleOpenModal()}
              >
                <FilePlus className="h-4 w-4" />
                {t('school.students.add_student')}
              </Button>

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

              <label className="cursor-pointer bg-muted hover:bg-muted/80 text-sm px-3 py-2 rounded flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {t('school.students.import')}
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    e.target.files && handleImport(e.target.files[0])
                  }
                />
              </label>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-background p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {t('school.students.filters.title')}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  goToPage(1);
                  setSearchTerm("");
                  setFilter({ level: "", gender: "", status: "" });
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
                {t('school.students.filters.reset')}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  {t('school.students.filters.level')}
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filter.level}
                  onChange={(e) => {
                    goToPage(1);
                    setFilter({ ...filter, level: e.target.value });
                  }}
                >
                  <option value="">{t('school.students.filters.all')}</option>
                  <optgroup label={t('school.students.filters.francophone_system')}>
                    <option value="6e">6e ({t('school.students.levels.sixth')})</option>
                    <option value="5e">5e ({t('school.students.levels.fifth')})</option>
                    <option value="4e">4e ({t('school.students.levels.fourth')})</option>
                    <option value="3e">3e ({t('school.students.levels.third')})</option>
                    <option value="2nde">2nde ({t('school.students.levels.second')})</option>
                    <option value="1ère">1ère ({t('school.students.levels.first')})</option>
                    <option value="Terminale">{t('school.students.levels.terminal')}</option>
                  </optgroup>
                  <optgroup label={t('school.students.filters.anglophone_system')}>
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                    <option value="Form 5">Form 5</option>
                    <option value="Lower Sixth">Lower Sixth</option>
                    <option value="Upper Sixth">Upper Sixth</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  {t('school.students.filters.gender')}
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filter.gender}
                  onChange={(e) => {
                    goToPage(1);
                    setFilter({ ...filter, gender: e.target.value });
                  }}
                >
                  <option value="">{t('school.students.filters.all')}</option>
                  <option value="male">{t('school.students.gender.male')}</option>
                  <option value="female">{t('school.students.gender.female')}</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  {t('school.students.filters.status')}
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filter.status}
                  onChange={(e) => {
                    goToPage(1);
                    setFilter({ ...filter, status: e.target.value });
                  }}
                >
                  <option value="">{t('school.students.filters.all')}</option>
                  <option value="active">{t('school.students.status.active')}</option>
                  <option value="suspended">{t('school.students.status.suspended')}</option>
                  <option value="graduated">{t('school.students.status.graduated')}</option>
                  <option value="withdrawn">{t('school.students.status.withdrawn')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center p-12 space-y-4">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
            <p className="text-muted-foreground text-lg">
              {t('school.students.loading')}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow border border-border">
              <Table className="min-w-full divide-y divide-border">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('school.students.table.matricule')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('school.students.table.full_name')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('school.students.table.class')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('school.students.table.level')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('school.students.table.gender')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('school.students.table.status')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('school.students.table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-background divide-y divide-border">
                  {currentData.length > 0 ? (
                    currentData.map((student) => (
                      <TableRow
                        key={student._id}
                        className="hover:bg-muted/50 transition"
                      >
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {student.matricule}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {student.fullName ||
                            `${student.firstName} ${student.lastName}`}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {student?.classInfo?.classesName || "N/A"}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {student.level}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground capitalize">
                          {student.gender && t(`school.students.gender.${student.gender}`)}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              student.status === "active"
                                ? "bg-primary/10 text-primary"
                                : student.status === "suspended"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {student.status && t(`school.students.status.${student.status}`)}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="shadow-lg rounded-md border border-border"
                            >
                              <DropdownMenuItem
                                onClick={() => openModal("view", student)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-primary" /> 
                                {t('school.students.actions.view')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenModal(student)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-secondary/10 cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 text-secondary" />{" "}
                                {t('school.students.actions.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(student._id)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 cursor-pointer text-destructive"
                              >
                                <Trash className="w-4 h-4" /> 
                                {t('school.students.actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <GraduationCap className="h-16 w-16 text-muted-foreground/50" />
                          <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium text-foreground">
                              {t('school.students.no_students.title')}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                              {searchTerm || filter.level || filter.gender || filter.status 
                                ? t('school.students.no_students.filtered')
                                : t('school.students.no_students.empty')}
                            </p>
                          </div>
                          {!searchTerm && !filter.level && !filter.gender && !filter.status && (
                            <Button 
                              onClick={() => handleOpenModal()}
                              className="flex items-center gap-2"
                            >
                              <FilePlus className="h-4 w-4" />
                              {t('school.students.add_student')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <nav
              className="flex items-center justify-between mt-6 px-4 py-3 bg-background border border-border rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.pagination.previous')}
              </button>

              <div className="hidden sm:flex space-x-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => goToPage(index + 1)}
                    className={`relative inline-flex items-center px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring ${
                      currentPage === index + 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.pagination.next')}
              </button>
            </nav>
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-background rounded-lg w-full max-w-3xl mx-4 my-8 shadow-lg max-h-screen overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingId 
                    ? t('school.students.modal.edit_title') 
                    : t('school.students.modal.create_title')}
                </h3>

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-2 gap-4 text-sm overflow-y-auto max-h-[70vh] pr-2"
                >
                  {/* Basic Info */}
                  <div className="col-span-2">
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.matricule')}
                    </label>
                    <input
                      type="text"
                      className="w-full border-border p-2 rounded"
                      value={form.matricule}
                      onChange={(e) =>
                        setForm({ ...form, matricule: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.first_name')}
                    </label>
                    <input
                      type="text"
                      className="w-full border-border p-2 rounded"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.last_name')}
                    </label>
                    <input
                      type="text"
                      className="w-full border-border p-2 rounded"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.email')}
                    </label>
                    <input
                      type="email"
                      className="w-full border-border p-2 rounded"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.phone')}
                    </label>
                    <input
                      type="tel"
                      className="w-full border-border p-2 rounded"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm({ ...form, phoneNumber: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.education_system')}
                    </label>
                    <select
                      className="w-full border-border p-2 rounded"
                      value={educationSystem}
                      onChange={(e) => {
                        setEducationSystem(e.target.value as 'francophone' | 'anglophone');
                        setForm({ ...form, level: "" });
                      }}
                    >
                      <option value="francophone">
                        {t('school.students.form.francophone_system')}
                      </option>
                      <option value="anglophone">
                        {t('school.students.form.anglophone_system')}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.level')}
                    </label>
                    <select
                      className="w-full border-border p-2 rounded"
                      value={form.level}
                      onChange={(e) =>
                        setForm({ ...form, level: e.target.value })
                      }
                      required
                    >
                      <option value="">
                        {t('school.students.form.select_level')}
                      </option>
                      {educationSystem === 'francophone' ? (
                        <>
                          <option value="6e">6e ({t('school.students.levels.sixth')})</option>
                          <option value="5e">5e ({t('school.students.levels.fifth')})</option>
                          <option value="4e">4e ({t('school.students.levels.fourth')})</option>
                          <option value="3e">3e ({t('school.students.levels.third')})</option>
                          <option value="2nde">2nde ({t('school.students.levels.second')})</option>
                          <option value="1ère">1ère ({t('school.students.levels.first')})</option>
                          <option value="Terminale">{t('school.students.levels.terminal')}</option>
                        </>
                      ) : (
                        <>
                          <option value="Form 1">Form 1</option>
                          <option value="Form 2">Form 2</option>
                          <option value="Form 3">Form 3</option>
                          <option value="Form 4">Form 4</option>
                          <option value="Form 5">Form 5</option>
                          <option value="Lower Sixth">Lower Sixth</option>
                          <option value="Upper Sixth">Upper Sixth</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.dob')}
                    </label>
                    <input
                      type="date"
                      className="w-full border-border p-2 rounded"
                      value={form.dateOfBirth}
                      onChange={(e) =>
                        setForm({ ...form, dateOfBirth: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.gender')}
                    </label>
                    <select
                      className="w-full border p-2 rounded"
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value })
                      }
                    >
                      <option value="">
                        {t('school.students.form.select_gender')}
                      </option>
                      <option value="male">
                        {t('school.students.gender.male')}
                      </option>
                      <option value="female">
                        {t('school.students.gender.female')}
                      </option>
                      <option value="other">
                        {t('school.students.gender.other')}
                      </option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="col-span-2 pt-4 font-semibold">
                    {t('school.students.form.address_section')}
                  </div>
                  <input
                    type="text"
                    placeholder={t('school.students.form.street')}
                    className="border-border p-2 rounded"
                    value={form.address?.street || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, street: e.target.value },
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder={t('school.students.form.city')}
                    className="border-border p-2 rounded"
                    value={form.address?.city || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, city: e.target.value },
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder={t('school.students.form.state')}
                    className="border-border p-2 rounded"
                    value={form.address?.state || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, state: e.target.value },
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder={t('school.students.form.country')}
                    className="border-border p-2 rounded"
                    value={form.address?.country || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, country: e.target.value },
                      })
                    }
                  />

                  {/* Emergency Contact */}
                  <div className="col-span-2 pt-4 font-semibold">
                    {t('school.students.form.emergency_contact')}
                  </div>
                  <input
                    type="text"
                    placeholder={t('school.students.form.emergency_name')}
                    className="border-border p-2 rounded"
                    value={form.emergencyContact?.name || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        emergencyContact: {
                          ...form.emergencyContact,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder={t('school.students.form.emergency_relation')}
                    className="border-border p-2 rounded"
                    value={form.emergencyContact?.relationship || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        emergencyContact: {
                          ...form.emergencyContact,
                          relationship: e.target.value,
                        },
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder={t('school.students.form.emergency_phone')}
                    className="border-border p-2 rounded col-span-2"
                    value={form.emergencyContact?.phone || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        emergencyContact: {
                          ...form.emergencyContact,
                          phone: e.target.value,
                        },
                      })
                    }
                  />

                  {/* Status */}
                  <div className="col-span-2">
                    <label className="block mb-1 font-medium">
                      {t('school.students.form.status')}
                    </label>
                    <select
                      className="w-full border-border p-2 rounded"
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option value="">
                        {t('school.students.form.select_status')}
                      </option>
                      <option value="active">
                        {t('school.students.status.active')}
                      </option>
                      <option value="suspended">
                        {t('school.students.status.suspended')}
                      </option>
                      <option value="graduated">
                        {t('school.students.status.graduated')}
                      </option>
                      <option value="withdrawn">
                        {t('school.students.status.withdrawn')}
                      </option>
                    </select>
                  </div>

                  {/* Error display in modal */}
                  {error && (
                    <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setError(null);
                      }}
                      disabled={submitting}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {submitting 
                        ? (editingId 
                            ? t('common.updating') 
                            : t('common.adding')) 
                        : (editingId 
                            ? t('common.update') 
                            : t('common.add'))
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {isModalOpen && modalMode === "view" && selectedStudent && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 overflow-y-auto px-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl my-10 overflow-hidden">
              {/* Sticky Header */}
              <div className="flex items-center justify-between bg-primary/10 px-6 py-4 border-b sticky top-0 z-10">
                <div className="flex items-center">
                  <Info className="text-primary w-5 h-5 mr-2" />
                  <h3 className="text-lg font-bold text-foreground">
                    {t('school.students.details.title')}
                  </h3>
                </div>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  {t('common.close')}
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto text-sm text-foreground space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <BadgeCheck className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">
                        {t('school.students.form.matricule')}:
                      </span>{" "}
                      {selectedStudent.matricule}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">
                        {t('school.students.table.full_name')}:
                      </span>{" "}
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">
                        {t('school.students.form.email')}:
                      </span>{" "}
                      {selectedStudent.email || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 mt-1 mr-2 text-secondary" />
                    <div>
                      <span className="font-medium">
                        {t('school.students.form.phone')}:
                      </span>{" "}
                      {selectedStudent.phoneNumber || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Smile className="w-4 h-4 mt-1 mr-2 text-secondary" />
                    <div>
                      <span className="font-medium">
                        {t('school.students.form.gender')}:
                      </span>{" "}
                      {selectedStudent.gender 
                        ? t(`school.students.gender.${selectedStudent.gender}`) 
                        : "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">
                        {t('school.students.form.dob')}:
                      </span>{" "}
                      {selectedStudent.dateOfBirth
                        ? new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <GraduationCap className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">
                        {t('school.students.form.level')}:
                      </span>{" "}
                      {selectedStudent.level}
                    </div>
                  </div>
                  <div className="flex items-start">
                    {selectedStudent.status === "active" ? (
                      <CheckCircle className="w-4 h-4 mt-1 mr-2 text-primary" />
                    ) : selectedStudent.status === "suspended" ? (
                      <AlertCircle className="w-4 h-4 mt-1 mr-2 text-destructive" />
                    ) : (
                      <XCircle className="w-4 h-4 mt-1 mr-2 text-destructive" />
                    )}
                    <div>
                      <span className="font-medium">
                        {t('school.students.form.status')}:
                      </span>{" "}
                      <span
                        className={`font-semibold ${
                          selectedStudent.status === "active"
                            ? "text-primary"
                            : selectedStudent.status === "suspended"
                            ? "text-destructive"
                            : "text-destructive"
                        }`}
                      >
                        {selectedStudent.status 
                          ? t(`school.students.status.${selectedStudent.status}`) 
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    {t('school.students.form.address_section')}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {t('school.students.form.street')}: {selectedStudent.address?.street || "N/A"}
                    </div>
                    <div>
                      {t('school.students.form.city')}: {selectedStudent.address?.city || "N/A"}
                    </div>
                    <div>
                      {t('school.students.form.state')}: {selectedStudent.address?.state || "N/A"}
                    </div>
                    <div>
                      {t('school.students.form.country')}: {selectedStudent.address?.country || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    {t('school.students.form.emergency_contact')}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {t('school.students.form.emergency_name')}: {selectedStudent.emergencyContact?.name || "N/A"}
                    </div>
                    <div>
                      {t('school.students.form.emergency_relation')}:{" "}
                      {selectedStudent.emergencyContact?.relationship || "N/A"}
                    </div>
                    <div className="col-span-2">
                      {t('school.students.form.emergency_phone')}:{" "}
                      {selectedStudent.emergencyContact?.phone || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}