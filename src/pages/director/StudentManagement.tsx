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

const itemsPerPage = 5;

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Student>({
    matricule: "",
    firstName: "",
    lastName: "",
    email: "",
    level: "",
    dateOfBirth: "",
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

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
    if (confirm("Are you sure you want to delete this student?")) {
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
      setForm(student);
      setEditingId(student._id || null);
    } else {
      setForm({
        matricule: "",
        firstName: "",
        lastName: "",
        email: "",
        level: "",
        dateOfBirth: "",
      });
      setEditingId(null);
    }
    setShowModal(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await studentService.update(editingId, form);
      } else {
        await studentService.create(form);
      }
      fetchStudents();
      setShowModal(false);
    } catch (error) {
      console.error("Failed to submit student:", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Student Management</h1>
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

              <label className="cursor-pointer bg-muted hover:bg-gray-100 text-sm px-3 py-2 rounded flex items-center gap-2">
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
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  goToPage(1);
                  setSearchTerm("");
                  setFilter({ level: "", gender: "", status: "" });
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
                Réinitialiser
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Niveau
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter.level}
                  onChange={(e) => {
                    goToPage(1);
                    setFilter({ ...filter, level: e.target.value });
                  }}
                >
                  <option value="">Tous</option>
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
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Sexe
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="flex justify-center items-center p-8">
            <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>classe</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Sexe</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>{student.matricule}</TableCell>
                      <TableCell>
                        {student.fullName ||
                          `${student.firstName} ${student.lastName}`}
                      </TableCell>
                      <TableCell>
                        {student?.classInfo?.classesName || "N/A"}
                      </TableCell>
                      <TableCell>{student.level}</TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>{student.status}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openModal("view", student)}
                            >
                              <Eye className="w-4 h-4 mr-2" /> Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenModal(student)}
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(student._id)}
                            >
                              <Trash className="w-4 h-4 mr-2 text-red-500" />{" "}
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      Aucun étudiant trouvé.
                    </TableCell>
                  </TableRow>
                )}
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
          </>
        )}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-3xl mx-4 my-8 shadow-lg max-h-screen overflow-hidden">
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
                      className="w-full border p-2 rounded"
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
                      className="w-full border p-2 rounded"
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
                      className="w-full border p-2 rounded"
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
                      className="w-full border p-2 rounded"
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
                      className="w-full border p-2 rounded"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm({ ...form, phoneNumber: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Niveau</label>
                    <select
                      className="w-full border p-2 rounded"
                      value={form.level}
                      onChange={(e) =>
                        setForm({ ...form, level: e.target.value })
                      }
                      required
                    >
                      <option value="">Sélectionnez un niveau</option>
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
                    <label className="block mb-1 font-medium">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      className="w-full border p-2 rounded"
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
                    className="border p-2 rounded"
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
                    className="border p-2 rounded"
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
                    className="border p-2 rounded"
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
                    className="border p-2 rounded"
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
                    className="border p-2 rounded"
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
                    className="border p-2 rounded"
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
                    className="border p-2 rounded col-span-2"
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
                      className="w-full border p-2 rounded"
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

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded"
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
          </div>
        )}
        {isModalOpen && modalMode === "view" && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-10 overflow-hidden">
              {/* Sticky Header */}
              <div className="flex items-center justify-between bg-blue-50 px-6 py-4 border-b sticky top-0 z-10">
                <div className="flex items-center">
                  <Info className="text-blue-600 w-5 h-5 mr-2" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Détails de l'étudiant
                  </h3>
                </div>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Fermer
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto text-sm text-gray-700 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <BadgeCheck className="w-4 h-4 mt-1 mr-2 text-indigo-500" />
                    <div>
                      <span className="font-medium">Matricule:</span>{" "}
                      {selectedStudent.matricule}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className="w-4 h-4 mt-1 mr-2 text-blue-500" />
                    <div>
                      <span className="font-medium">Nom complet:</span>{" "}
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 mt-1 mr-2 text-emerald-500" />
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedStudent.email || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 mt-1 mr-2 text-pink-500" />
                    <div>
                      <span className="font-medium">Téléphone:</span>{" "}
                      {selectedStudent.phoneNumber || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Smile className="w-4 h-4 mt-1 mr-2 text-yellow-500" />
                    <div>
                      <span className="font-medium">Genre:</span>{" "}
                      {selectedStudent.gender || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 mt-1 mr-2 text-cyan-600" />
                    <div>
                      <span className="font-medium">Date de naissance:</span>{" "}
                      {new Date(
                        selectedStudent.dateOfBirth
                      ).toLocaleDateString() || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <GraduationCap className="w-4 h-4 mt-1 mr-2 text-purple-500" />
                    <div>
                      <span className="font-medium">Niveau:</span>{" "}
                      {selectedStudent.level}
                    </div>
                  </div>
                  <div className="flex items-start">
                    {selectedStudent.status === "active" ? (
                      <CheckCircle className="w-4 h-4 mt-1 mr-2 text-green-600" />
                    ) : selectedStudent.status === "suspended" ? (
                      <AlertCircle className="w-4 h-4 mt-1 mr-2 text-yellow-600" />
                    ) : (
                      <XCircle className="w-4 h-4 mt-1 mr-2 text-red-600" />
                    )}
                    <div>
                      <span className="font-medium">Statut:</span>{" "}
                      <span
                        className={`font-semibold ${
                          selectedStudent.status === "active"
                            ? "text-green-600"
                            : selectedStudent.status === "suspended"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">
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
                  <h4 className="text-base font-semibold text-gray-800 mb-2">
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
