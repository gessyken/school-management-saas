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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Subject interface/type
interface Subject {
  _id?: string;
  subjectCode: string;
  subjectName: string;
  description?: string;
  isActive: boolean;
}

const itemsPerPage = 5;

// Simple custom confirmation modal component
const ConfirmationModal = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
};

const Subjects = () => {
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Form state for create/edit
  const [form, setForm] = useState<Subject>({
    subjectCode: "",
    subjectName: "",
    description: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Pagination
  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(subjects, itemsPerPage);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch subjects, optionally filtered by debounced search
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      // Assuming backend supports search filter as query param
      const res = await subjectService.getAll({ search: debouncedSearch });
      setSubjects(res.data.subjects);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les matières",
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, toast]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Handle Import from Excel
  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const bstr = e.target?.result;
        if (!bstr) throw new Error("File reading failed");
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        await subjectService.bulkImport(data);
        toast({ title: "Import réussi", description: "Matières importées avec succès." });
        fetchSubjects();
      };
      reader.readAsBinaryString(file);
    } catch {
      toast({ title: "Erreur", description: "L'import a échoué." });
    } finally {
      setLoading(false);
    }
  };

  // Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(subjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects");
    XLSX.writeFile(wb, "subjects.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Liste des Matières", 14, 20);
    const date = new Date().toLocaleDateString("fr-FR");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date d'exportation : ${date}`, 14, 28);
    const tableColumn = ["Nom", "Code", "Statut"];
    const tableRows = subjects.map((s) => [
      s.subjectName,
      s.subjectCode,
      s.isActive ? "Actif" : "Inactif",
    ]);
    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      styles: { halign: "center", valign: "middle" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35 },
    });
    doc.save(`matieres_${date.replace(/\//g, "-")}.pdf`);
  };

  // Open modal for create/edit/view
  const openModal = (mode: "view" | "edit" | "create", subject: Subject | null = null) => {
    setSelectedSubject(subject);
    setModalMode(mode);
    if (mode === "create") {
      setForm({ subjectCode: "", subjectName: "", description: "", isActive: true });
      setEditingId(null);
    } else if (subject) {
      setForm(subject);
      setEditingId(subject._id ?? null);
    }
    setIsModalOpen(true);
  };

  // Close modal and reset states
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubject(null);
    setModalMode(null);
    setEditingId(null);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await subjectService.update(editingId, form);
        toast({ title: "Matière mise à jour" });
      } else {
        await subjectService.create(form);
        toast({ title: "Matière créée" });
      }
      fetchSubjects();
      closeModal();
    } catch {
      toast({ title: "Erreur", description: "Échec de l'enregistrement" });
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle active status
  const toggleActive = async (subject: Subject) => {
    setLoading(true);
    try {
      await subjectService.update(subject._id!, { ...subject, isActive: !subject.isActive });
      fetchSubjects();
    } catch {
      toast({ title: "Erreur", description: "Impossible de changer le statut" });
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation modal for deletion
  const confirmDelete = (subject: Subject) => {
    setSubjectToDelete(subject);
    setConfirmOpen(true);
  };

  // Delete subject after confirmation
  const handleDeleteConfirmed = async () => {
    if (!subjectToDelete?._id) return;
    setLoading(true);
    try {
      await subjectService.remove(subjectToDelete._id);
      toast({ title: "Suppression réussie" });
      fetchSubjects();
    } catch {
      toast({ title: "Erreur", description: "Échec de la suppression" });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setSubjectToDelete(null);
    }
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
            disabled={loading}
          />
          <div className="flex gap-2">
            <Button onClick={() => openModal("create")} disabled={loading}>
              <FilePlus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
            <Button variant="outline" onClick={exportExcel} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={exportPDF} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <label className="cursor-pointer bg-muted px-3 py-1 rounded">
              <Upload className="inline h-4 w-4 mr-2" />
              Importer
              <input
                type="file"
                hidden
                onChange={(e) => e.target.files && handleImport(e.target.files[0])}
                disabled={loading}
                accept=".xls,.xlsx"
              />
            </label>
          </div>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <>
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
                {currentData.map((subject: Subject) => (
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
                          <Button variant="ghost" size="icon" disabled={loading}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openModal("view", subject)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openModal("edit", subject)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive(subject)}>
                            {subject.isActive ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmDelete(subject)}
                            className="text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={goToPreviousPage}
                disabled={currentPage === 1 || loading}
              >
                Précédent
              </Button>
              <div>
                Page {currentPage} sur {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || loading}
              >
                Suivant
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Modal for create/edit/view */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4 capitalize">
              {modalMode === "create"
                ? "Ajouter une matière"
                : modalMode === "edit"
                ? "Modifier la matière"
                : "Détails de la matière"}
            </h2>

            {(modalMode === "create" || modalMode === "edit") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">Nom</label>
                  <Input
                    type="text"
                    value={form.subjectName}
                    onChange={(e) =>
                      setForm({ ...form, subjectName: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Code</label>
                  <Input
                    type="text"
                    value={form.subjectCode}
                    onChange={(e) =>
                      setForm({ ...form, subjectCode: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Description</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    disabled={loading}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    disabled={loading}
                  />
                  <label htmlFor="isActive">Actif</label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Enregistrer
                  </Button>
                </div>
              </form>
            )}

            {modalMode === "view" && selectedSubject && (
              <div className="space-y-4">
                <div>
                  <strong>Nom:</strong> {selectedSubject.subjectName}
                </div>
                <div>
                  <strong>Code:</strong> {selectedSubject.subjectCode}
                </div>
                <div>
                  <strong>Description:</strong> {selectedSubject.description || "-"}
                </div>
                <div>
                  <strong>Statut:</strong>{" "}
                  {selectedSubject.isActive ? "Actif" : "Inactif"}
                </div>
                <div className="flex justify-end">
                  <Button onClick={closeModal}>Fermer</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation delete modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        message={`Êtes-vous sûr de vouloir supprimer la matière "${
          subjectToDelete?.subjectName ?? ""
        }" ?`}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default Subjects;
