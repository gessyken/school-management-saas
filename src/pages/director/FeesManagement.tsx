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
import { Edit2, Eye, Trash2 } from "lucide-react"; // icons for buttons
import PaymentForm from "./setting/PaymentForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const emptyFee: AcademicFee = {
  billID: "",
  type: "",
  amount: 0,
  paymentDate: "",
  paymentMethod: "",
};

export default function FeesManagement() {
  const { toast } = useToast();
  const [fees, setFees] = useState<any[]>([]);
  const [newFee, setNewFee] = useState<AcademicFee>(emptyFee);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [academicYearId, setAcademicYearId] = useState<string | null>(null);
  const [academicStudents, setAcademicStudents] = useState<
    AcademicYearStudent[]
  >([]);

  const fetchFees = async () => {
    try {
      const data = await academicService.getAll();
      setAcademicStudents(data.students);
      const allFees = data.students.flatMap((student: any) =>
        (student.fees || []).map((fee: any) => ({
          ...fee,
          studentId: student._id,
          studentName:
            student.student.firstName + " " + student.student.lastName,
          studentClass: student.classes?.classesName || "N/A",
          year: student.year || "N/A",
        }))
      );
      setFees(allFees);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Failed to load fees",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFees();
  }, [academicYearId]);

  const handleUpdateFee = async () => {
    if (!editingFeeId || !academicYearId) return;
    try {
      await academicService.updateFee(academicYearId, editingFeeId, newFee);
      toast({
        title: "Succès",
        description: "Frais mis à jour avec succès",
      });
      setEditingFeeId(null);
      setNewFee(emptyFee);
      fetchFees();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour des frais",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFee = async (fee: any) => {
    console.log(fee);
    if (!fee.billID || !fee.studentId) return;
    if (confirm(`Are you sure you want to delete the payment ${fee.billID}?`)) {
      try {
        await academicService.deleteFee(fee.studentId, fee.billID);
        toast({
          title: "Succès",
          description: "Frais supprimés avec succès",
        });
        fetchFees();
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Échec de la suppression des frais",
          variant: "destructive",
        });
      }
    }
  };

  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedFee, setSelectedFee] = useState<any>(null);

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
    try {
      // await academicService.addFee(student._id, fee);
      console.log(student, fee);
      await academicService.updateFee(student.studentId, fee.billID, fee);
      toast({
        title: "Succès",
        description: "Frais ajoutés avec succès",
      });
      setOpenPaymentForm(false);
      fetchFees();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de l'ajout des frais",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold mb-8 text-gray-800">
          Gestion des Frais Académiques
        </h2>
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
            {fees.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  Aucun frais disponible.
                </TableCell>
              </TableRow>
            )}
            {fees.map((fee, idx) => (
              <TableRow
                key={fee.billID || idx}
                className="hover:bg-indigo-50 transition"
              >
                <TableCell>{fee.billID}</TableCell>
                <TableCell>{fee.type}</TableCell>
                <TableCell className="text-right font-semibold text-indigo-600">
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
        {/* Detail Modal */}
        <Dialog open={!!selectedFee} onOpenChange={closeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails du frais</DialogTitle>
              <DialogDescription>
                Informations complètes sur le frais sélectionné.
              </DialogDescription>
            </DialogHeader>
            {selectedFee && (
              <div className="space-y-4 mt-4 text-gray-700">
                <p>
                  <strong>BillID:</strong> {selectedFee.billID}
                </p>
                <p>
                  <strong>Type:</strong> {selectedFee.type}
                </p>
                <p>
                  <strong>Montant:</strong>{" "}
                  {selectedFee.amount.toLocaleString()} FCFA
                </p>
                <p>
                  <strong>Date de paiement:</strong>{" "}
                  {new Date(selectedFee.paymentDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Mode de paiement:</strong> {selectedFee.paymentMethod}
                </p>
                <p>
                  <strong>Étudiant:</strong> {selectedFee.studentName}
                </p>
                <p>
                  <strong>Classe:</strong> {selectedFee.studentClass}
                </p>
                <p>
                  <strong>Année académique:</strong> {selectedFee.year}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button onClick={closeModal}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                initialData={newFee}
                onCancel={() => setOpenPaymentForm(false)}
                onSubmit={handlePaymentSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
