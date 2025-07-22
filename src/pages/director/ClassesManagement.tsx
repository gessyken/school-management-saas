import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  FilePlus,
  Download,
  Upload,
  CheckCircle,
  Pencil,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { usePagination } from "@/components/ui/usePagination";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { classService, SchoolClass } from "@/lib/services/classService";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { subjectService } from "@/lib/services/subjectService";
import { userService } from "@/lib/services/userService";
import { useTranslation } from "react-i18next";

interface SubjectItem {
  _id: string;
  subjectName: string;
}
interface TeacherItem {
  _id: string;
  fullName: string;
}
interface ClassSubject {
  subjectInfo: string; // subject _id
  coefficient: number | "";
  teacherInfo: string; // teacher _id
}

const itemsPerPage = 5;

const ClassesManagement = () => {
  const { toast } = useToast();
  const { t } = useTranslation()

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [search, setSearch] = useState("");

  // Subjects and teachers list from API
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);

  // Form state and editing
  const [form, setForm] = useState<Omit<SchoolClass, "_id"> & { subjects: ClassSubject[] }>({
    classesName: "",
    description: "",
    status: "Open",
    capacity: "",
    amountFee: "",
    level: "",
    subjects: [],
    studentList: [],
    mainTeacherInfo: "",
    year: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const filtered = classes.filter((cls) =>
    `${cls.classesName} ${cls.description ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );
  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filtered, itemsPerPage);

  // Fetch classes once on mount
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await classService.getAll({});
      setClasses(res.data.classes);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les classes",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const res = await subjectService.getAll({});
      setSubjects(res.data.subjects);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les matières",
      });
    }
  }, [toast]);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    try {
      const res = await userService.getAll({ roles: "TEACHER" });
      setTeachers(res.data.users);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les enseignants",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, [fetchClasses, fetchSubjects, fetchTeachers]);

  // Submit handler (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation example
    if (!form.classesName.trim()) {
      toast({ title: "Le nom de la classe est requis" });
      return;
    }
    if (form.subjects.some((s) => !s.subjectInfo || !s.teacherInfo)) {
      toast({ title: "Chaque matière doit avoir un sujet et un enseignant assignés" });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await classService.update(editingId, form);
        toast({ title: "Classe mise à jour avec succès" });
      } else {
        await classService.create(form);
        toast({ title: "Classe créée avec succès" });
      }
      setShowModal(false);
      setEditingId(null);
      setForm({
        classesName: "",
        description: "",
        status: "Open",
        capacity: "",
        amountFee: "",
        level: "",
        subjects: [],
        studentList: [],
        mainTeacherInfo: "",
        year: "",
      });
      fetchClasses();
    } catch {
      toast({ title: "Erreur lors de l'enregistrement" });
    } finally {
      setSubmitting(false);
    }
  };

  // Edit class, load data into form
  const handleEdit = (cls: SchoolClass) => {
    setForm({
      ...cls,
      capacity: cls.capacity ?? "",
      amountFee: cls.amountFee ?? "",
      description: cls.description ?? "",
      subjects: cls.subjects?.map((item: any) => ({
        subjectInfo: item.subjectInfo._id,
        coefficient: item.coefficient || "",
        teacherInfo: item.teacherInfo._id || item.teacherInfo.id, // normalize id
      })) || [],
    });
    setEditingId(cls._id || null);
    setShowModal(true);
  };

  // Delete class with confirmation
  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return;
    setLoading(true);
    try {
      await classService.remove(id);
      toast({ title: "Classe supprimée avec succès" });
      fetchClasses();
    } catch {
      toast({ title: "Erreur lors de la suppression" });
    } finally {
      setLoading(false);
    }
  };

  // Toggle class status Open/Closed
  const toggleStatus = async (cls: SchoolClass) => {
    setLoading(true);
    try {
      await classService.update(cls._id!, {
        ...cls,
        status: cls.status === "Open" ? "Closed" : "Open",
      });
      fetchClasses();
    } catch {
      toast({ title: "Erreur lors du changement de statut" });
    } finally {
      setLoading(false);
    }
  };

  // Handle file import
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        classService.bulkImport(data as SchoolClass[]).then(() => {
          toast({ title: "Import réussi" });
          fetchClasses();
        });
      } catch {
        toast({ title: "Erreur lors de l'import" });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export to Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(classes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classes");
    XLSX.writeFile(wb, "classes.xlsx");
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("fr-FR");
    doc.setFontSize(16);
    doc.text("Liste des Classes", 14, 20);
    doc.setFontSize(10);
    doc.text(`Date d'exportation : ${date}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Nom", "Statut", "Capacité", "Année"]],
      body: classes.map((cls) => [
        cls.classesName,
        cls.status,
        cls.capacity ?? "",
        cls.year ?? "",
      ]),
      styles: { halign: "center" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save(`classes_${date.replace(/\//g, "-")}.pdf`);
  };

  // Manage subjects in form
  const handleSubjectChange = (index: number, field: keyof ClassSubject, value: any) => {
    const updatedSubjects = [...form.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value,
    };
    setForm({ ...form, subjects: updatedSubjects });
  };

  const addSubject = () => {
    setForm({
      ...form,
      subjects: [...form.subjects, { subjectInfo: "", coefficient: "", teacherInfo: "" }],
    });
  };

  const removeSubject = (index: number) => {
    setForm({
      ...form,
      subjects: form.subjects.filter((_, i) => i !== index),
    });
  };

  // Prevent selecting duplicate subjects
  const availableSubjectsForIndex = (index: number) => {
    const selectedIds = form.subjects.map((s) => s.subjectInfo).filter(Boolean);
    return subjects.filter(
      (subj) => !selectedIds.includes(subj._id) || subj._id === form.subjects[index]?.subjectInfo
    );
  };
  return (
  <div className="p-6 bg-gray-50 min-h-screen">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-extrabold text-skyblue">{t("classesManagement.title")}</h1>
    </div>

    <div className="flex flex-wrap justify-between mb-6 gap-4">
      <Input
        placeholder={t("classesManagement.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-64"
        disabled={loading}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setForm({
              classesName: "",
              description: "",
              status: "Open",
              capacity: "",
              amountFee: "",
              level: "",
              subjects: [],
              studentList: [],
              mainTeacherInfo: "",
              year: "",
            });
            setEditingId(null);
            setShowModal(true);
          }}
          disabled={loading || submitting}
          className="flex items-center gap-2"
        >
          <FilePlus className="h-5 w-5" />
          {t("classesManagement.add")}
        </Button>
        <Button variant="outline" onClick={exportExcel} disabled={loading || submitting} className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Excel
        </Button>
        <Button variant="outline" onClick={exportPDF} disabled={loading || submitting} className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          PDF
        </Button>
        <label className="cursor-pointer bg-muted px-3 py-1 rounded inline-flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          {t("classesManagement.import")}
          <input
            type="file"
            hidden
            onChange={(e) => e.target.files && handleImport(e.target.files[0])}
            disabled={loading || submitting}
          />
        </label>
      </div>
    </div>

    {loading ? (
      <p className="text-center text-gray-500">{t("classesManagement.loading")}</p>
    ) : (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("classesManagement.tableHeaders.name")}</TableHead>
              <TableHead>{t("classesManagement.tableHeaders.status")}</TableHead>
              <TableHead>{t("classesManagement.tableHeaders.students")}</TableHead>
              <TableHead>{t("classesManagement.tableHeaders.capacity")}</TableHead>
              <TableHead>{t("classesManagement.tableHeaders.level")}</TableHead>
              <TableHead>{t("classesManagement.tableHeaders.year")}</TableHead>
              <TableHead>{t("classesManagement.tableHeaders.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((cls) => (
              <TableRow key={cls._id}>
                <TableCell>{cls.classesName}</TableCell>
                <TableCell>{t(`classesManagement.status.${cls.status.toLowerCase()}`)}</TableCell>
                <TableCell>{cls.studentList?.length ?? 0}</TableCell>
                <TableCell>{cls.capacity ?? ""}</TableCell>
                <TableCell>{cls.level}</TableCell>
                <TableCell>{cls.year}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loading || submitting}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(cls)} className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" /> {t("classesManagement.actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(cls)} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {cls.status === "Open" ? t("classesManagement.actions.close") : t("classesManagement.actions.open")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(cls._id!)} className="flex items-center gap-2 text-red-600">
                        <Trash className="h-4 w-4" /> {t("classesManagement.actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || loading}
          >
            {t("classesManagement.pagination.previous")}
          </button>

          <div className="space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded transition ${
                  currentPage === i + 1
                    ? "bg-skyblue text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => goToPage(i + 1)}
                disabled={loading}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
            onClick={goToNextPage}
            disabled={currentPage === totalPages || loading}
          >
            {t("classesManagement.pagination.next")}
          </button>
        </div>
      </>
    )}

    {/* Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
          <h2 className="text-xl font-semibold mb-6">
            {editingId ? t("classesManagement.modal.editTitle") : t("classesManagement.modal.createTitle")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>{t("classesManagement.form.name")}</Label>
              <Input
                value={form.classesName}
                onChange={(e) => setForm({ ...form, classesName: e.target.value })}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <Label>{t("classesManagement.form.description")}</Label>
              <Input
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={submitting}
              />
            </div>

            <div>
              <Label>{t("classesManagement.form.status")}</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("classesManagement.form.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">{t("classesManagement.status.open")}</SelectItem>
                  <SelectItem value="Closed">{t("classesManagement.status.closed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label>{t("classesManagement.form.capacity")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.capacity ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value === "" ? "" : Number(e.target.value) })
                  }
                  disabled={submitting}
                />
              </div>

              <div>
                <Label>{t("classesManagement.form.amountFee")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.amountFee ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, amountFee: e.target.value === "" ? "" : Number(e.target.value) })
                  }
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label>{t("classesManagement.form.level")}</Label>
                <select
                  className="w-full border p-2 rounded"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  disabled={submitting}
                >
                  <option value="">{t("classesManagement.form.selectLevel")}</option>
                  <option value="Form 1">Form 1</option>
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                  <option value="Form 4">Form 4</option>
                  <option value="Form 5">Form 5</option>
                  <option value="Lower Sixth">Lower Sixth</option>
                  <option value="Upper Sixth">Upper Sixth</option>
                </select>
              </div>

              <div>
                <Label>{t("classesManagement.form.year")}</Label>
                <Input
                  type="text"
                  value={form.year ?? ""}
                  pattern="\d{4}-\d{4}"
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder={t("classesManagement.form.yearPlaceholder")}
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <Label>{t("classesManagement.form.mainTeacher")}</Label>
              <Select
                value={form.mainTeacherInfo ?? ""}
                onValueChange={(value) => setForm({ ...form, mainTeacherInfo: value })}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("classesManagement.form.selectTeacher")} />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher._id} value={teacher._id}>
                      {teacher.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subjects Section */}
            <div className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-lg font-semibold">{t("classesManagement.form.subjects")}</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={addSubject}
                  disabled={submitting || form.subjects.length >= subjects.length}
                >
                  + {t("classesManagement.form.addSubject")}
                </Button>
              </div>
              {form.subjects.length === 0 ? (
                <p className="text-gray-500 italic">{t("classesManagement.form.noSubjects")}</p>
              ) : (
                form.subjects.map((subject, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 mb-3 items-center">
                    <Select
                      value={subject.subjectInfo}
                      onValueChange={(value) => handleSubjectChange(index, "subjectInfo", value)}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("classesManagement.form.subject")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubjectsForIndex(index).map((subj) => (
                          <SelectItem key={subj._id} value={subj._id}>
                            {subj.subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      placeholder={t("classesManagement.form.coefficient")}
                      min={0}
                      value={subject.coefficient}
                      onChange={(e) =>
                        handleSubjectChange(
                          index,
                          "coefficient",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      disabled={submitting}
                    />

                    <Select
                      value={subject.teacherInfo}
                      onValueChange={(value) => handleSubjectChange(index, "teacherInfo", value)}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("classesManagement.form.teacher")} />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      className="self-center text-red-600"
                      onClick={() => removeSubject(index)}
                      disabled={submitting}
                    >
                      {t("classesManagement.form.remove")}
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                {t("classesManagement.form.cancel")}
              </Button>
              <Button type="submit" disabled={submitting}>
                {editingId ? t("classesManagement.form.update") : t("classesManagement.form.create")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);

};

export default ClassesManagement;
