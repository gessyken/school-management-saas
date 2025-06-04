import React, { useEffect, useState } from "react";
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

const itemsPerPage = 5;

const ClassesManagement = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<SchoolClass>({
    classesName: "",
    description: "",
    status: "Open",
    capacity: 0,
    amountFee: 0,
    subjects: [],
    studentList: [],
    mainTeacherInfo: "",
    year: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filtered = classes.filter((cls) =>
    `${cls.classesName} ${cls.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filtered, itemsPerPage);

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

  const fetchSubjects = async () => {
    try {
      const res = await subjectService.getAll({});
      setSubjects(res.data.subjects);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les matières",
      });
    }
  };
  const fetchTeacher = async () => {
    try {
      const res = await userService.getAll({ roles: "TEACHER" });
      console.log(res.data);
      setTeachers(res.data.users);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les matières",
      });
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeacher();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await classService.update(editingId, form);
    } else {
      await classService.create(form);
    }
    setForm({
      classesName: "",
      description: "",
      status: "Open",
      capacity: 0,
      amountFee: 0,
      subjects: [],
      studentList: [],
      mainTeacherInfo: "",
      year: "",
    });
    setEditingId(null);
    setShowModal(false);
    fetchClasses();
  };

  const handleEdit = (cls: any) => {
    setForm({
      ...cls,
      mainTeacherInfo: cls.mainTeacherInfo.id,
      subjects: cls.subjects.map(item => ({
        subjectInfo: item.subjectInfo._id,
        coefficient: item.coefficient,
        teacherInfo: item.teacherInfo.id,
      })),
    });
    setEditingId(cls._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      await classService.remove(id);
      fetchClasses();
    }
  };

  const toggleStatus = async (cls: SchoolClass) => {
    await classService.update(cls._id!, {
      ...cls,
      status: cls.status === "Open" ? "Closed" : "Open",
    });
    fetchClasses();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      classService.bulkImport(data as SchoolClass[]).then(fetchClasses);
    };
    reader.readAsBinaryString(file);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(classes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classes");
    XLSX.writeFile(wb, "classes.xlsx");
  };

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

  const handleSubjectChange = (index: number, field: string, value: any) => {
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
      subjects: [
        ...form.subjects,
        { subjectInfo: "", coefficient: 0, teacherInfo: "" },
      ],
    });
  };

  const removeSubject = (index: number) => {
    const updated = form.subjects.filter((_, i) => i !== index);
    setForm({ ...form, subjects: updated });
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Classes</h1>
        </div>

        <div className="flex justify-between mb-4">
          <Input
            placeholder="Rechercher une classe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setForm({
                  classesName: "",
                  description: "",
                  status: "Open",
                  capacity: 0,
                  amountFee: 0,
                  subjects: [],
                  studentList: [],
                  mainTeacherInfo: "",
                  year: "",
                });
                setShowModal(true);
              }}
            >
              <FilePlus className="mr-2 h-4 w-4" /> Ajouter
            </Button>
            <Button variant="outline" onClick={exportExcel}>
              <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={exportPDF}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <label className="cursor-pointer bg-muted px-3 py-1 rounded">
              <Upload className="inline h-4 w-4 mr-2" /> Importer
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Capacité</TableHead>
              <TableHead>Année</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((cls) => (
              <TableRow key={cls._id}>
                <TableCell>{cls.classesName}</TableCell>
                <TableCell>{cls.status}</TableCell>
                <TableCell>{cls.capacity}</TableCell>
                <TableCell>{cls.year}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(cls)}>
                        <Pencil className="h-4 w-4 mr-2" /> Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(cls)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {cls.status === "Open" ? "Fermer" : "Ouvrir"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(cls._id!)}>
                        <Trash className="h-4 w-4 mr-2" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            Précédent
          </button>

          <div className="space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => goToPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? "Modifier" : "Créer"} une Classe
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={form.classesName}
                    onChange={(e) =>
                      setForm({ ...form, classesName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={form.description ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Statut</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm({ ...form, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Ouvert</SelectItem>
                      <SelectItem value="Closed">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Capacité</Label>
                    <Input
                      type="number"
                      value={form.capacity ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, capacity: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <Label>Frais (Amount Fee)</Label>
                    <Input
                      type="number"
                      value={form.amountFee ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, amountFee: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Année Académique (YYYY-YYYY)</Label>
                  <Input
                    type="text"
                    value={form.year ?? ""}
                    pattern="\d{4}-\d{4}"
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="ex: 2024-2025"
                  />
                </div>

                <div>
                  <Label>Enseignant Principal</Label>
                  <Select
                    value={form.mainTeacherInfo ?? form.mainTeacherInfo}
                    onValueChange={(value) =>
                      setForm({ ...form, mainTeacherInfo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'enseignant" />
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
                <div className="border p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-lg font-semibold">Matières</Label>
                    <Button type="button" size="sm" onClick={addSubject}>
                      + Ajouter une matière
                    </Button>
                  </div>
                  {form.subjects.map((subject, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                      <Select
                        value={subject.subjectInfo}
                        onValueChange={(value) =>
                          handleSubjectChange(index, "subjectInfo", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Matière" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subj) => (
                            <SelectItem key={subj._id} value={subj._id}>
                              {subj.subjectName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        placeholder="Coefficient"
                        value={subject.coefficient}
                        onChange={(e) =>
                          handleSubjectChange(
                            index,
                            "coefficient",
                            Number(e.target.value)
                          )
                        }
                      />

                      <Select
                        value={subject.teacherInfo}
                        onValueChange={(value) =>
                          handleSubjectChange(index, "teacherInfo", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Enseignant" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingId ? "Mettre à jour" : "Créer"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ClassesManagement;
