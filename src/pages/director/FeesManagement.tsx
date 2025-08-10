import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  academicService,
  AcademicFee,
  AcademicYearStudent,
} from "@/lib/services/academicService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Eye, Trash2, AlertCircle, XCircle, Loader2, Receipt, FilePlus } from "lucide-react"; // icons for buttons
import PaymentForm from "./setting/PaymentForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePagination } from "@/components/ui/usePagination";
import { AcademicYear, settingService } from "@/lib/services/settingService";
import { classService, SchoolClass } from "@/lib/services/classService";
import { Input } from "@/components/ui/input";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const emptyFee: AcademicFee = {
  billID: "",
  type: "",
  amount: 0,
  paymentDate: "",
  paymentMethod: "",
};

const itemsPerPage = 5;
export default function FeesManagement() {
  const { toast } = useToast();
  const [fees, setFees] = useState<any[]>([]);
  const [newFee, setNewFee] = useState<AcademicFee>(emptyFee);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [academicYearId, setAcademicYearId] = useState<string | null>(null);
  const [academicStudents, setAcademicStudents] = useState<
    AcademicYearStudent[]
  >([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState({
    level: "",
    classes: "",
    academicYear: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.getAll();
      setAcademicStudents(data.students || []);
      console.log(data.students[0]);
      const allFees = (data.students || []).flatMap((student: any) =>
        (student.fees || []).map((fee: any) => ({
          ...fee,
          studentId: student._id,
          studentName:
            student.student.firstName + " " + student.student.lastName,
          studentClass: student.classes?.classesName || "N/A",
          studentLevel: student.classes?.level || "N/A",
          year: student.year || "N/A",
          totalFeesPaid: student.totalFeesPaid,
          amountToPaid: student?.classes?.amountFee,
        }))
      );
      setFees(allFees);
    } catch (error) {
      console.error("Failed to fetch fees:", error);
      setError("Erreur lors du chargement des frais. Veuillez réessayer.");
      setFees([]);
      setAcademicStudents([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les frais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const loadAcademicYearDetail = async () => {
    try {
      const data = await settingService.getAcademicYears();
      setAcademicYears(data || []);
      if (data && data.length > 0 && filter.academicYear === "") {
        setFilter({
          ...filter,
          academicYear: data.find((opt) => opt.isCurrent)?.name,
        });
      }
    } catch (error) {
      console.error("Failed to fetch academic years:", error);
      setAcademicYears([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les années académiques",
        variant: "destructive",
      });
    }
  };
  
  const fetchClasses = async () => {
    try {
      const res = await classService.getAll({});
      console.log(res.data);
      setClasses(res.data?.classes || []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les classes",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    loadAcademicYearDetail();
    fetchClasses();
    fetchFees();
  }, [academicYearId]);
  const filteredFees = fees
    .filter((student) =>
      student.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((student) => {
      console.log(student);
      console.log(student?.studentClass, " ", filter.classes);
      console.log(student?.year, " ", filter.academicYear);
      console.log(student?.studentLevel, " level", filter.level);
      return (
        (filter.classes ? student?.studentClass === filter.classes : true) &&
        (filter.academicYear ? student?.year === filter.academicYear : true) &&
        (filter.level ? student?.studentLevel === filter.level : true)
      );
    });
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
  } = usePagination(filteredFees, itemsPerPage); // subjects is your full data list

  const handleDeleteFee = async (fee: any) => {
    console.log(fee);
    if (!fee.billID || !fee.studentId) return;
    if (confirm(`Êtes-vous sûr de vouloir supprimer le paiement ${fee.billID} ?`)) {
      setLoading(true);
      setError(null);
      try {
        await academicService.deleteFee(fee.studentId, fee.billID);
        toast({
          title: "Succès",
          description: "Frais supprimé avec succès",
        });
        fetchFees();
      } catch (error) {
        console.error("Failed to delete fee:", error);
        setError("Erreur lors de la suppression des frais. Veuillez réessayer.");
        toast({
          title: "Erreur",
          description: "Échec de la suppression des frais",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => setSelectedFee(null);

  const handleOpenPaymentForm = (fee: any) => {
    // To edit fee, we want the student info related to the fee:
    const student = academicStudents.find((s) => s._id === fee.studentId);
    setSelectedStudent({
      studentId: student._id,
      studentName: student.student.firstName + " " + student.student.firstName,
      studentClass: student.classes.classesName,
      year: student.year,
    });
    setNewFee(fee);
    setEditingFeeId(fee.billID);
    setOpenPaymentForm(true);
  };

  const handlePaymentSubmit = async (student: any, fee: AcademicFee) => {
    setSubmitting(true);
    setError(null);
    try {
      // await academicService.addFee(student._id, fee);
      console.log(student, fee);
      await academicService.updateFee(student.studentId, fee.billID, fee);
      toast({
        title: "Succès",
        description: "Frais mis à jour avec succès",
      });
      setOpenPaymentForm(false);
      fetchFees();
    } catch (error) {
      console.error("Failed to update fee:", error);
      setError("Erreur lors de la mise à jour des frais. Veuillez réessayer.");
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour des frais",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const exportToExcel = (data: any[], fileName = "fees.xlsx") => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Frais");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(file, fileName);
  };

  const exportToPDF = (data: any[], fileName = "fees.pdf") => {
    const doc = new jsPDF();

    const tableColumn = [
      "Nom de l'étudiant",
      "Classe",
      "Niveau",
      "Année",
      "Montant",
      "Méthode",
      "Date de paiement",
    ];
    const tableRows = data.map((fee) => [
      fee.studentName,
      fee.studentClass,
      fee.studentLevel,
      fee.year,
      fee.amount,
      fee.paymentMethod,
      fee.paymentDate.slice(0, 10),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      margin: { top: 20 },
    });

    doc.save(fileName);
  };

  return (
    <div className="p-6 bg-background rounded-lg shadow-lg max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold mb-8 text-foreground">
        Gestion des Frais Académiques
      </h2>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="text-destructive hover:text-destructive/80"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex justify-end gap-4 mb-4">
        <Button
          variant="outline"
          onClick={() => exportToExcel(filteredFees)}
          className="text-primary border-primary hover:bg-primary/10"
        >
          📄 Exporter Excel
        </Button>
        <Button
          variant="outline"
          onClick={() => exportToPDF(filteredFees)}
          className="text-secondary border-secondary hover:bg-secondary/10"
        >
          🧾 Exporter PDF
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-background p-6 rounded-2xl shadow-md border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">🎯 Filtres</h2>
          <Button
            variant="ghost"
            onClick={() => {
              goToPage(1);
              setSearchTerm("");
              setFilter({
                level: "",
                academicYear: filter.academicYear,
                classes: "",
              });
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {/* Search */}
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              Rechercher une Étudiant
            </label>
            <Input
              placeholder="Ex: Étudiant"
              className="w-full"
              onChange={handleSearch}
              value={searchTerm}
            />
          </div>

          {/* Level */}
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              Niveau
            </label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={filter.level}
              onChange={(e) => {
                goToPage(1);
                setFilter({ ...filter, level: e.target.value });
              }}
            >
              <option value="">Tous</option>
              <optgroup label="🇫🇷 Système Francophone">
                {[
                  { value: "6e", label: "6e (Sixième)" },
                  { value: "5e", label: "5e (Cinquième)" },
                  { value: "4e", label: "4e (Quatrième)" },
                  { value: "3e", label: "3e (Troisième)" },
                  { value: "2nde", label: "2nde (Seconde)" },
                  { value: "1ère", label: "1ère (Première)" },
                  { value: "Terminale", label: "Terminale" },
                ].map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🇬🇧 Système Anglophone">
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
              </optgroup>
            </select>
          </div>

          {/* Classes */}
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              Classes
            </label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={filter.classes}
              onChange={(e) => {
                const classId = e.target.value;
                setFilter({ ...filter, classes: classId });
              }}
            >
              <option value="">Tous</option>
              {filteredClasses.map((item) => (
                <option key={item._id} value={item.classesName}>
                  {item.classesName}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              Année académique
            </label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={filter.academicYear}
              onChange={(e) => {
                const yearId = e.target.value;
                setFilter({ ...filter, academicYear: yearId });
              }}
            >
              <option value="">Tous</option>
              {academicYears.map((year) => (
                <option key={year._id} value={year.name}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">Chargement des frais...</span>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant (FCFA)</TableHead>
              <TableHead>Date de Paiement</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Receipt className="h-12 w-12 text-muted-foreground/50" />
                    <div className="text-center">
                      <p className="text-lg font-medium text-muted-foreground">
                        {searchTerm || filter.level || filter.classes || filter.academicYear
                          ? "Aucun frais trouvé"
                          : "Aucun frais disponible"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchTerm || filter.level || filter.classes || filter.academicYear
                          ? "Essayez de modifier vos critères de recherche"
                          : "Les frais apparaîtront ici une fois ajoutés"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          {currentData.map((fee, idx) => (
            <TableRow
              key={fee.billID || idx}
              className="hover:bg-muted/50 transition"
            >
              <TableCell>{fee.billID}</TableCell>
              <TableCell>{fee.type}</TableCell>
              <TableCell className="text-right font-semibold text-primary">
                {fee.amount.toLocaleString()}
              </TableCell>
              <TableCell className="text-center">
                {fee.paymentDate
                  ? new Date(fee.paymentDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell className="text-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedFee(fee)}
                  aria-label={`view fee ${fee.billID}`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenPaymentForm(fee)}
                  aria-label={`Edit fee ${fee.billID}`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteFee(fee)}
                  aria-label={`Delete fee ${fee.billID}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
      
      {/* Pagination */}
      {!loading && currentData.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      <Dialog open={!!selectedFee} onOpenChange={closeModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              🧾 Détails du frais
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Informations complètes sur le frais sélectionné.
            </DialogDescription>
          </DialogHeader>

          {selectedFee && (
            <div className="mt-4 space-y-6 text-sm text-foreground">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-muted-foreground">📌 Bill ID:</span>
                  <div className="text-foreground">{selectedFee.billID}</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">💳 Type:</span>
                  <div className="text-foreground">{selectedFee.type}</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">💰 Montant:</span>
                  <div className="text-foreground">
                    {selectedFee.amount.toLocaleString()} FCFA
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    📅 Date de paiement:
                  </span>
                  <div className="text-foreground">
                    {new Date(selectedFee.paymentDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    🏦 Mode de paiement:
                  </span>
                  <div className="text-foreground">
                    {selectedFee.paymentMethod}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    🎓 Étudiant:
                  </span>
                  <div className="text-foreground">{selectedFee.studentName}</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">🏫 Classe:</span>
                  <div className="text-foreground">
                    {selectedFee.studentClass}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    📚 Année académique:
                  </span>
                  <div className="text-foreground">{selectedFee.year}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <span className="font-medium text-muted-foreground">
                    ✅ Total payé:
                  </span>
                  <div className="text-primary font-semibold">
                    {selectedFee.totalFeesPaid.toLocaleString()} FCFA
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    📉 Reste à payer:
                  </span>
                  <div className="text-destructive font-semibold">
                    {(
                      selectedFee.amountToPaid - selectedFee.totalFeesPaid
                    ).toLocaleString()}{" "}
                    FCFA
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button onClick={closeModal} className="w-full sm:w-auto">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {openPaymentForm && selectedStudent && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenPaymentForm(false);
          }}
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
            <PaymentForm
              student={selectedStudent}
              initialData={newFee}
              onCancel={() => setOpenPaymentForm(false)}
              onSubmit={handlePaymentSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
