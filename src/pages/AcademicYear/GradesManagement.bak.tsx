import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  Download,
  Filter,
  ArrowUpDown,
  Receipt,
  CreditCard,
  Calendar,
  User,
  School,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePagination } from "@/components/ui/usePagination";
import { AcademicFee, academicService } from "@/services/academicService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const itemsPerPage = 10;

// Default payment data structure
const defaultPaymentData: AcademicFee = {
  billID: "",
  type: "",
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0], // Default to today
  paymentMethod: "cash",
};

export default function FeesManagement() {
  const context = useOutletContext<{
    academicYear: string;
    educationSystem: string;
    level: string;
    class: string;
    term: string;
    sequence: string;
    subject: string;
    tab: string;
    academicStudents: any[];
    academicYearObj: any;
    educationSystemObj: any;
    levelObj: any;
    classObj: any;
    termObj: any;
    sequenceObj: any;
    subjectObj: any;
    loadAcademicYearRecords: any;
  }>();

  const {
    academicYear,
    educationSystem,
    level,
    class: classId,
    term,
    sequence,
    subject,
    academicStudents = [],
    academicYearObj,
    educationSystemObj,
    levelObj,
    classObj,
    termObj,
    sequenceObj,
    subjectObj,
    loadAcademicYearRecords,
  } = context;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showFeeDetail, setShowFeeDetail] = useState(false);
  const [paymentData, setPaymentData] = useState<AcademicFee>(defaultPaymentData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');

  // Filter and sort students (your existing code remains the same)
  const filteredStudents = academicStudents
    .filter(student =>
      (academicYear ? student.year === academicYear : true) &&
      (classId ? student.classes?._id === classId : true) &&
      (student.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .map(student => {
      const totalFeesPaid = student.fees?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
      const amountToPay = student.classes?.amountFee || 0;
      const remaining = amountToPay - totalFeesPaid;

      return {
        ...student,
        totalFeesPaid,
        amountToPay,
        remaining,
        isPaid: remaining <= 0,
        paymentStatus: remaining <= 0 ? 'paid' : remaining < amountToPay ? 'partial' : 'pending'
      };
    })
    .filter(student => {
      if (paymentFilter === 'all') return true;
      if (paymentFilter === 'paid') return student.isPaid;
      if (paymentFilter === 'pending') return !student.isPaid;
      return true;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === 'remaining' || sortConfig.key === 'totalFeesPaid' || sortConfig.key === 'amountToPay') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (sortConfig.key === 'studentName') {
        const aName = `${a.student?.firstName} ${a.student?.lastName}`;
        const bName = `${b.student?.firstName} ${b.student?.lastName}`;
        return sortConfig.direction === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }

      return 0;
    })
    .filter(student => {
      if (amountFilter === 'all') return true;
      if (amountFilter === 'high') return student.remaining > student.amountToPay * 0.5;
      if (amountFilter === 'low') return student.remaining <= student.amountToPay * 0.5 && student.remaining > 0;
      return true;
    });

  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filteredStudents, itemsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Reset form when opening/closing
  const resetForm = () => {
    setPaymentData(defaultPaymentData);
    setSelectedFee(null);
    setFormErrors({});
  };

  const handleAddPayment = (student) => {
    setSelectedStudent(student);
    resetForm();
    setShowPaymentForm(true);
  };

  const handleEditPayment = (student, fee) => {
    setSelectedStudent(student);
    setSelectedFee(fee);
    
    // Pre-fill form with existing fee data
    setPaymentData({
      billID: fee.billID || "",
      type: fee.type || "",
      amount: fee.amount || 0,
      paymentDate: fee.paymentDate ? fee.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: fee.paymentMethod || "cash",
    });
    
    setShowPaymentForm(true);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowFeeDetail(true);
  };

  const handleDeletePayment = async (student, feeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;

    setLoading(true);
    try {
      await academicService.deleteFee(student._id, feeId);
      toast({
        title: "Succès",
        description: "Paiement supprimé avec succès",
      });
      loadAcademicYearRecords();
    } catch (error) {
      console.error("Failed to delete fee:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!paymentData.type) errors.type = 'Le type de frais est requis';
    if (!paymentData.amount || paymentData.amount <= 0) errors.amount = 'Le montant doit être supérieur à 0';
    if (!paymentData.paymentDate) errors.paymentDate = 'La date de paiement est requise';
    if (!paymentData.paymentMethod) errors.paymentMethod = 'La méthode de paiement est requise';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedFee) {
        // Update existing payment
        console.log("Updating fee:", {
          studentId: selectedStudent._id,
          feeId: selectedFee.billID,
          data: paymentData
        });
        
        await academicService.updateFee(selectedStudent._id, selectedFee.billID, paymentData);
        toast({
          title: "Succès",
          description: "Paiement modifié avec succès",
        });
      } else {
        // Add new payment
        console.log("Adding new fee:", {
          studentId: selectedStudent._id,
          data: paymentData
        });

        // Generate billID if not provided
        const finalPaymentData = {
          ...paymentData,
          billID: paymentData.billID || `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        await academicService.addFee(selectedStudent._id, finalPaymentData);
        toast({
          title: "Succès",
          description: "Paiement ajouté avec succès",
        });
      }
      
      setShowPaymentForm(false);
      resetForm();
      loadAcademicYearRecords();
    } catch (error) {
      console.error("Failed to process payment:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors du traitement du paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update payment data with proper typing
  const updatePaymentData = (field: keyof AcademicFee, value: any) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Close payment form handler
  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    resetForm();
  };

  // Your existing export functions remain the same
  const exportToExcel = () => {
    // ... existing code
  };

  const exportToPDF = () => {
    // ... existing code
  };

  const getPaymentStatusBadge = (student) => {
    if (student.isPaid) {
      return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
    } else if (student.totalFeesPaid > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Partiel</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">En attente</Badge>;
    }
  };

  // Show loading if no data from context
  if (!academicYear) {
    return (
      <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen">
        <div className="text-center py-12">
          <School className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sélectionnez une année académique</h3>
          <p className="text-muted-foreground">
            Veuillez sélectionner une année académique pour gérer les frais
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen">
      {/* ... existing JSX code remains the same until the Payment Form Dialog ... */}

      {/* Payment Form Dialog - CORRECTED */}
      <Dialog open={showPaymentForm} onOpenChange={handleClosePaymentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFee ? 'Modifier le paiement' : 'Nouveau paiement'}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent && `${selectedStudent.student?.firstName} ${selectedStudent.student?.lastName}`}
              {selectedStudent && (
                <div className="mt-2 text-sm">
                  <div>Total à payer: <strong>{selectedStudent.amountToPay?.toLocaleString()} FCFA</strong></div>
                  <div>Déjà payé: <strong className="text-green-600">{selectedStudent.totalFeesPaid?.toLocaleString()} FCFA</strong></div>
                  <div>Reste: <strong className={selectedStudent.remaining > 0 ? "text-red-600" : "text-green-600"}>
                    {selectedStudent.remaining?.toLocaleString()} FCFA
                  </strong></div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Payment Form with proper state management */}
          <div className="space-y-4">
            {/* Bill ID (optional) */}
            <div>
              <label className="text-sm font-medium">ID Facture (optionnel)</label>
              <Input
                value={paymentData.billID}
                onChange={(e) => updatePaymentData('billID', e.target.value)}
                placeholder="ID de la facture"
              />
            </div>

            {/* Fee Type */}
            <div>
              <label className="text-sm font-medium">Type de frais *</label>
              <select 
                className={`w-full border rounded-lg px-3 py-2 text-sm ${formErrors.type ? 'border-red-500' : 'border-border'}`}
                value={paymentData.type}
                onChange={(e) => updatePaymentData('type', e.target.value)}
              >
                <option value="">Sélectionnez le type de frais</option>
                <option value="Tuition">Scolarité</option>
                <option value="Books">Livres</option>
                <option value="Uniform">Uniforme</option>
                <option value="Transport">Transport</option>
                <option value="Other">Autre</option>
              </select>
              {formErrors.type && (
                <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium">Montant *</label>
              <Input
                type="number"
                value={paymentData.amount}
                onChange={(e) => updatePaymentData('amount', parseFloat(e.target.value) || 0)}
                placeholder="Montant en FCFA"
                className={formErrors.amount ? 'border-red-500' : ''}
                min="0"
                step="0.01"
              />
              {formErrors.amount && (
                <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="text-sm font-medium">Date de paiement *</label>
              <Input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => updatePaymentData('paymentDate', e.target.value)}
                className={formErrors.paymentDate ? 'border-red-500' : ''}
              />
              {formErrors.paymentDate && (
                <p className="text-red-500 text-xs mt-1">{formErrors.paymentDate}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-sm font-medium">Méthode de paiement *</label>
              <select 
                className={`w-full border rounded-lg px-3 py-2 text-sm ${formErrors.paymentMethod ? 'border-red-500' : 'border-border'}`}
                value={paymentData.paymentMethod}
                onChange={(e) => updatePaymentData('paymentMethod', e.target.value)}
              >
                <option value="">Sélectionnez la méthode</option>
                <option value="cash">Espèces</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="check">Chèque</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="credit_card">Carte de crédit</option>
              </select>
              {formErrors.paymentMethod && (
                <p className="text-red-500 text-xs mt-1">{formErrors.paymentMethod}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClosePaymentForm} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handlePaymentSubmit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedFee ? 'Modifier le paiement' : 'Ajouter le paiement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}