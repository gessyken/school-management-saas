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
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Générer un matricule automatique
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
      setError("Erreur lors du chargement des étudiants. Veuillez réessayer.");
      setStudents([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les étudiants",
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
  } = usePagination(filteredStudents, itemsPerPage); // subjects is your full data list

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      try {
        await studentService.delete(id);
        fetchStudents();
      } catch (error) {
        console.error("Failed to delete student", error);
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
        matricule: row["Matricule"],
        firstName: row["firstName"],
        lastName: row["lastName"],
        email: row["Email"] !== "N/A" ? row["Email"] : "",
        phoneNumber: row["Téléphone"] !== "N/A" ? row["Téléphone"] : "",
        gender: row["Genre"] !== "N/A" ? row["Genre"] : undefined,
        dateOfBirth:
          row["Date de naissance"] !== "N/A" ? row["Date de naissance"] : "",
        level: row["Niveau"],
        status: row["Statut"] !== "N/A" ? row["Statut"] : undefined,
        address: {
          street:
            row["Adresse - Rue"] !== "N/A" ? row["Adresse - Rue"] : undefined,
          city:
            row["Adresse - Ville"] !== "N/A"
              ? row["Adresse - Ville"]
              : undefined,
          state:
            row["Adresse - Région/État"] !== "N/A"
              ? row["Adresse - Région/État"]
              : undefined,
          country:
            row["Adresse - Pays"] !== "N/A" ? row["Adresse - Pays"] : undefined,
        },
        emergencyContact: {
          name:
            row["Contact d'urgence - Nom"] !== "N/A"
              ? row["Contact d'urgence - Nom"]
              : undefined,
          relationship:
            row["Contact d'urgence - Relation"] !== "N/A"
              ? row["Contact d'urgence - Relation"]
              : undefined,
          phone:
            row["Contact d'urgence - Téléphone"] !== "N/A"
              ? row["Contact d'urgence - Téléphone"]
              : undefined,
        },
        createdAt:
          row["Date de création"] !== "N/A"
            ? row["Date de création"]
            : undefined,
        updatedAt:
          row["Date de mise à jour"] !== "N/A"
            ? row["Date de mise à jour"]
            : undefined,
      }));
      console.log(parsedData);
      studentService.bulkImport(parsedData).then(fetchStudents);
    };
    reader.readAsBinaryString(file);
  };

  const exportExcel = () => {
    const formattedStudents = students.map((student) => ({
      Matricule: student.matricule,
      firstName: student.firstName,
      lastName: student.lastName,
      Email: student.email || "N/A",
      Téléphone: student.phoneNumber || "N/A",
      Genre: student.gender || "N/A",
      "Date de naissance": student.dateOfBirth || "N/A",
      Niveau: student.level,
      Statut: student.status || "N/A",
      "Adresse - Rue": student.address?.street || "N/A",
      "Adresse - Ville": student.address?.city || "N/A",
      "Adresse - Région/État": student.address?.state || "N/A",
      "Adresse - Pays": student.address?.country || "N/A",
      "Contact d'urgence - Nom": student.emergencyContact?.name || "N/A",
      "Contact d'urgence - Relation":
        student.emergencyContact?.relationship || "N/A",
      "Contact d'urgence - Téléphone": student.emergencyContact?.phone || "N/A",
      "Date de création": student.createdAt || "N/A",
      "Date de mise à jour": student.updatedAt || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(formattedStudents);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Étudiants");
    XLSX.writeFile(wb, "etudiants.xlsx");
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

  const handleOpenModal = (student?: Student) => {
    if (student) {
      // Detect education system based on level
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
      } else {
        await studentService.create(form);
      }
      await fetchStudents();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to submit student:", error);
      setError(editingId ? "Erreur lors de la modification de l'étudiant" : "Erreur lors de l'ajout de l'étudiant");
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
      <h1 className="text-2xl font-bold">Student Management</h1>
      
      {/* Affichage des erreurs */}
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
              placeholder="Rechercher une matière..."
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
                Ajouter un étudiant
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

          {/* Filter Section */}
          <div className="bg-background p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Filtres</h2>
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
                Réinitialiser
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  Niveau
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filter.level}
                  onChange={(e) => {
                    goToPage(1);
                    setFilter({ ...filter, level: e.target.value });
                  }}
                >
                  <option value="">Tous</option>
                  <optgroup label="🇫🇷 Système Francophone">
                    <option value="6e">6e (Sixième)</option>
                    <option value="5e">5e (Cinquième)</option>
                    <option value="4e">4e (Quatrième)</option>
                    <option value="3e">3e (Troisième)</option>
                    <option value="2nde">2nde (Seconde)</option>
                    <option value="1ère">1ère (Première)</option>
                    <option value="Terminale">Terminale</option>
                  </optgroup>
                  <optgroup label="🇬🇧 Système Anglophone">
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
                  Sexe
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filter.gender}
                  onChange={(e) => {
                    goToPage(1);
                    setFilter({ ...filter, gender: e.target.value });
                  }}
                >
                  <option value="">Tous</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">
                  Statut
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filter.status}
                  onChange={(e) => {
                    goToPage(1);
                    setFilter({ ...filter, status: e.target.value });
                  }}
                >
                  <option value="">Tous</option>
                  <option value="active">Actif</option>
                  <option value="suspended">Suspendu</option>
                  <option value="graduated">Diplômé</option>
                  <option value="withdrawn">Abandonné</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center p-12 space-y-4">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
            <p className="text-muted-foreground text-lg">Chargement des étudiants...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow border border-border">
              <Table className="min-w-full divide-y divide-border">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Matricule
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Nom complet
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Classe
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Niveau
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Sexe
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Statut
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
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
                          {student.gender}
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
                            {student.status}
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
                                <Eye className="w-4 h-4 text-primary" /> Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenModal(student)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-secondary/10 cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 text-secondary" />{" "}
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(student._id)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 cursor-pointer text-destructive"
                              >
                                <Trash className="w-4 h-4" /> Supprimer
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
                            <h3 className="text-lg font-medium text-foreground">Aucun étudiant trouvé</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                              {searchTerm || filter.level || filter.gender || filter.status 
                                ? "Aucun étudiant ne correspond à vos critères de recherche."
                                : "Commencez par ajouter votre premier étudiant."}
                            </p>
                          </div>
                          {!searchTerm && !filter.level && !filter.gender && !filter.status && (
                            <Button 
                              onClick={() => handleOpenModal()}
                              className="flex items-center gap-2"
                            >
                              <FilePlus className="h-4 w-4" />
                              Ajouter un étudiant
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
                Précédent
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
                Suivant
              </button>
            </nav>
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-background rounded-lg w-full max-w-3xl mx-4 my-8 shadow-lg max-h-screen overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingId ? "Modifier l'étudiant" : "Ajouter un étudiant"}
                </h3>

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-2 gap-4 text-sm overflow-y-auto max-h-[70vh] pr-2"
                >
                  {/* Basic Info */}
                  <div className="col-span-2">
                    <label className="block mb-1 font-medium">Matricule</label>
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
                    <label className="block mb-1 font-medium">Prénom</label>
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
                    <label className="block mb-1 font-medium">Nom</label>
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
                    <label className="block mb-1 font-medium">Email</label>
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
                    <label className="block mb-1 font-medium">Téléphone</label>
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
                    <label className="block mb-1 font-medium">Système Éducatif</label>
                    <select
                      className="w-full border-border p-2 rounded"
                      value={educationSystem}
                      onChange={(e) => {
                        setEducationSystem(e.target.value as 'francophone' | 'anglophone');
                        setForm({ ...form, level: "" }); // Reset level when changing system
                      }}
                    >
                      <option value="francophone">🇫🇷 Système Francophone</option>
                      <option value="anglophone">🇬🇧 Système Anglophone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Niveau</label>
                    <select
                      className="w-full border-border p-2 rounded"
                      value={form.level}
                      onChange={(e) =>
                        setForm({ ...form, level: e.target.value })
                      }
                      required
                    >
                      <option value="">Sélectionnez un niveau</option>
                      {educationSystem === 'francophone' ? (
                        <>
                          <option value="6e">6e (Sixième)</option>
                          <option value="5e">5e (Cinquième)</option>
                          <option value="4e">4e (Quatrième)</option>
                          <option value="3e">3e (Troisième)</option>
                          <option value="2nde">2nde (Seconde)</option>
                          <option value="1ère">1ère (Première)</option>
                          <option value="Terminale">Terminale</option>
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
                      Date de naissance
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
                    <label className="block mb-1 font-medium">Genre</label>
                    <select
                      className="w-full border p-2 rounded"
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value })
                      }
                    >
                      <option value="">Sélectionnez</option>
                      <option value="male">Masculin</option>
                      <option value="female">Féminin</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="col-span-2 pt-4 font-semibold">Adresse</div>
                  <input
                    type="text"
                    placeholder="Rue"
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
                    placeholder="Ville"
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
                    placeholder="Région/État"
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
                    placeholder="Pays"
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
                    Contact d'urgence
                  </div>
                  <input
                    type="text"
                    placeholder="Nom"
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
                    placeholder="Relation"
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
                    placeholder="Téléphone"
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
                    <label className="block mb-1 font-medium">Statut</label>
                    <select
                      className="w-full border-border p-2 rounded"
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option value="">Sélectionnez un statut</option>
                      <option value="active">Actif</option>
                      <option value="suspended">Suspendu</option>
                      <option value="graduated">Diplômé</option>
                      <option value="withdrawn">Abandonné</option>
                    </select>
                  </div>

                  {/* Affichage des erreurs dans le modal */}
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
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {submitting 
                        ? (editingId ? "Mise à jour..." : "Ajout...") 
                        : (editingId ? "Mettre à jour" : "Ajouter")
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
                    Détails de l'étudiant
                  </h3>
                </div>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Fermer
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto text-sm text-foreground space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <BadgeCheck className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">Matricule:</span>{" "}
                      {selectedStudent.matricule}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">Nom complet:</span>{" "}
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedStudent.email || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 mt-1 mr-2 text-secondary" />
                    <div>
                      <span className="font-medium">Téléphone:</span>{" "}
                      {selectedStudent.phoneNumber || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Smile className="w-4 h-4 mt-1 mr-2 text-secondary" />
                    <div>
                      <span className="font-medium">Genre:</span>{" "}
                      {selectedStudent.gender || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">Date de naissance:</span>{" "}
                      {new Date(
                        selectedStudent.dateOfBirth
                      ).toLocaleDateString() || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <GraduationCap className="w-4 h-4 mt-1 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">Niveau:</span>{" "}
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
                      <span className="font-medium">Statut:</span>{" "}
                      <span
                        className={`font-semibold ${
                          selectedStudent.status === "active"
                            ? "text-primary"
                            : selectedStudent.status === "suspended"
                            ? "text-destructive"
                            : "text-destructive"
                        }`}
                      >
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    Adresse
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>Rue: {selectedStudent.address?.street || "N/A"}</div>
                    <div>Ville: {selectedStudent.address?.city || "N/A"}</div>
                    <div>
                      Région/État: {selectedStudent.address?.state || "N/A"}
                    </div>
                    <div>Pays: {selectedStudent.address?.country || "N/A"}</div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    Contact d'urgence
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      Nom: {selectedStudent.emergencyContact?.name || "N/A"}
                    </div>
                    <div>
                      Relation:{" "}
                      {selectedStudent.emergencyContact?.relationship || "N/A"}
                    </div>
                    <div className="col-span-2">
                      Téléphone:{" "}
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
