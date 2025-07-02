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
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  FileSpreadsheet,
  Pencil,
  Eye,
  Trash,
  FilePlus,
  Upload,
  Download,
  CheckCircle,
} from "lucide-react";
import { Info, BookOpen, Code2, XCircle } from "lucide-react";
import { subjectService } from "@/lib/services/subjectService";
import { useToast } from "@/components/ui/use-toast";
import { usePagination } from "@/components/ui/usePagination";
// import Modal from '@/components/ui/modal';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Subject {
  _id?: string;
  subjectCode: string;
  subjectName: string;
  description?: string;
  isActive: boolean;
}
// Example usage in your component
const itemsPerPage = 5;

const Subjects = () => {
  const { toast } = useToast();

  const [subjects, setSubjects] = useState([]);
  // const [filteredsubjects, setFilteredSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const filteredSubjects = subjects.filter((subject) =>
    `${subject.subjectName} ${subject.subjectCode} ${subject.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filteredSubjects, itemsPerPage); // subjects is your full data list

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(
    null
  );
  const [form, setForm] = useState<Subject>({
    subjectCode: "",
    subjectName: "",
    description: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    fetchSubjects();
  }, [search]);

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      console.log(data);
      subjectService.bulkImport(data).then(fetchSubjects);
    };
    reader.readAsBinaryString(file);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(subjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects");
    XLSX.writeFile(wb, "subjects.xlsx");
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
    const tableColumn = ["Nom", "Code", "Statut"];

    // Table rows
    const tableRows = subjects.map((s) => [
      s.subjectName,
      s.subjectCode,
      s.isActive ? "Actif" : "Inactif",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await subjectService.update(editingId, form);
    } else {
      await subjectService.create(form);
    }
    setForm({
      subjectCode: "",
      subjectName: "",
      description: "",
      isActive: true,
    });
    setEditingId(null);
    setShowModal(false);
    fetchSubjects();
  };

  const handleEdit = (subject: Subject) => {
    setForm(subject);
    setEditingId(subject._id!);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      await subjectService.remove(id);
      fetchSubjects();
    }
  };

  const toggleActive = async (subject: Subject) => {
    await subjectService.update(subject._id, {
      ...subject,
      isActive: !subject.isActive,
    });
    fetchSubjects();
  };

  const openModal = (mode: "view" | "edit" | "create", subject = null) => {
    setSelectedSubject(subject);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Matières</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-skyblue/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nombre total de matières
            </CardTitle>
            <div className="text-2xl font-bold">{subjects.length}</div>
          </CardHeader>
        </Card>

        <Card className="bg-skyblue/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Matières actives
            </CardTitle>
            <div className="text-2xl font-bold">
              {subjects.filter((s) => s.isActive).length}
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-skyblue/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Matières inactives
            </CardTitle>
            <div className="text-2xl font-bold">
              {subjects.filter((s) => !s.isActive).length}
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Rechercher une matière..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setForm({
                  subjectCode: "",
                  subjectName: "",
                  description: "",
                  isActive: true,
                });
                setShowModal(true);
              }}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
            <Button variant="outline" onClick={exportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={exportPDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <label className="cursor-pointer bg-muted px-3 py-1 rounded">
              <Upload className="inline h-4 w-4 mr-2" />
              Importer
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
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((subject: any) => (
              <TableRow key={subject._id}>
                <TableCell>{subject.subjectName}</TableCell>
                <TableCell>{subject.subjectCode}</TableCell>
                <TableCell>
                  <CheckCircle
                    className={`h-4 w-4 ${
                      subject.isActive ? "text-green-500" : "text-red-500"
                    }`}
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openModal("view", subject)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(subject)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleActive(subject)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Toggle actif
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(subject._id)}
                      >
                        <Trash className="h-4 w-4 mr-2 text-red-500" />
                        Supprimer
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingId ? "Modifier la matière" : "Ajouter une matière"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Code"
                  className="w-full border p-2 rounded"
                  value={form.subjectCode}
                  onChange={(e) =>
                    setForm({ ...form, subjectCode: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Nom"
                  className="w-full border p-2 rounded"
                  value={form.subjectName}
                  onChange={(e) =>
                    setForm({ ...form, subjectName: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder="Description"
                  className="w-full border p-2 rounded"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    {editingId ? "Mettre à jour" : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isModalOpen && modalMode === "view" && selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
              <div className="flex items-center mb-4 border-b pb-3">
                <Info className="text-blue-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-800">
                  Détails de la matière
                </h3>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                  <div>
                    <span className="font-medium">Nom:</span>{" "}
                    {selectedSubject.subjectName}
                  </div>
                </div>

                <div className="flex items-start">
                  <Code2 className="w-5 h-5 mr-2 text-emerald-500" />
                  <div>
                    <span className="font-medium">Code:</span>{" "}
                    {selectedSubject.subjectCode}
                  </div>
                </div>

                {selectedSubject.description && (
                  <div className="flex items-start">
                    <Info className="w-5 h-5 mr-2 text-yellow-500" />
                    <div>
                      <span className="font-medium">Description:</span>{" "}
                      {selectedSubject.description}
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  {selectedSubject.isActive ? (
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  )}
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`font-semibold ${
                        selectedSubject.isActive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedSubject.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Subjects;
