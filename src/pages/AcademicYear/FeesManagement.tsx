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
  const [paymentData, setPaymentData] = useState<AcademicFee>({
    billID: "",
    type: "Tuition",
    amount: 0,
    paymentDate: "",
    paymentMethod: "cash",
  })
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'paid', 'pending'
  const [amountFilter, setAmountFilter] = useState('all'); // 'all', 'high', 'low'

  // Filter and sort students based on current context
  const filteredStudents = academicStudents
    .filter(student =>
      (academicYear ? student.year === academicYear : true) &&
      (classId ? student.classes?._id === classId : true) &&
      (student.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .map(student => {
      console.log("student.classes", student.classes)
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

  const handleAddPayment = (student) => {
    setSelectedStudent(student);
    setSelectedFee(null);
    setPaymentData({
    billID: "",
    type: "Tuition",
    amount: 0,
    paymentDate: "",
    paymentMethod: "cash",
  });
    setShowPaymentForm(true);
  };

  const handleEditPayment = (student, fee) => {
    setSelectedStudent(student);
    setSelectedFee(fee);
    setPaymentData(fee);
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
      loadAcademicYearRecords(); // Refresh data
      setShowFeeDetail(false);
      setShowPaymentForm(false);
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

  const handlePaymentSubmit = async () => {
    setLoading(true);
    try {
      if (selectedFee) {
        // Update existing payment
        await academicService.updateFee(selectedStudent._id, selectedFee.billID, paymentData);
        toast({
          title: "Succès",
          description: "Paiement modifié avec succès",
        });
      } else {
        // Add new payment
        console.log("add function", paymentData)
        await academicService.addFee(selectedStudent._id, paymentData);
        toast({
          title: "Succès",
          description: "Paiement ajouté avec succès",
        });
      }
      setShowPaymentForm(false);
      setShowFeeDetail(false);
      setSelectedFee(null);
      setSelectedStudent(null);
      loadAcademicYearRecords(); // Refresh data
    } catch (error) {
      console.error("Failed to process payment:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement du paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const data = filteredStudents.map(student => ({
      'Matricule': student.student?.matricule,
      'Nom élève': `${student.student?.firstName} ${student.student?.lastName}`,
      'Classe': student.classes?.classesName,
      'Niveau': student.classes?.level,
      'Année académique': student.year,
      'Frais à payer': student.amountToPay,
      'Total payé': student.totalFeesPaid,
      'Reste à payer': student.remaining,
      'Statut': student.isPaid ? 'Payé' : 'En attente',
      'Nombre de paiements': student.fees?.length || 0
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Frais académiques');
    XLSX.writeFile(wb, `frais_academiques_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Rapport des Frais Académiques', 14, 20);

    const tableColumn = [
      'Matricule',
      'Nom élève',
      'Classe',
      'Total payé',
      'Reste à payer',
      'Statut'
    ];

    const tableRows = filteredStudents.map(student => [
      student.student?.matricule || 'N/A',
      `${student.student?.firstName} ${student.student?.lastName}`,
      student.classes?.classesName || 'N/A',
      `${student.totalFeesPaid.toLocaleString()} FCFA`,
      `${student.remaining.toLocaleString()} FCFA`,
      student.isPaid ? 'Payé' : 'En attente'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    });

    doc.save(`frais_academiques_${new Date().toISOString().split('T')[0]}.pdf`);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Frais</h1>
            <p className="text-muted-foreground mt-2">
              Gestion des paiements des frais académiques
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={exportToExcel} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filtres Actifs */}
        {(academicYear || classId) && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {academicYear && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Année:</span>
                    <Badge variant="outline">{academicYear}</Badge>
                  </div>
                )}
                {classId && (
                  <div className="flex items-center space-x-2">
                    <School className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Classe:</span>
                    <Badge variant="outline">{classObj?.name}</Badge>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Élèves:</span>
                  <Badge variant="outline">{filteredStudents.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtres et recherche</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recherche</label>
                <Input
                  placeholder="Rechercher un élève..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Statut paiement</label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="paid">Payé</option>
                  <option value="pending">En attente</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Montant restant</label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                >
                  <option value="all">Tous les montants</option>
                  <option value="high">Reste élevé (&gt; 50%)</option>
                  <option value="low">Reste faible (&lt;= 50%)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Élèves affichés</label>
                <div className="text-lg font-semibold text-primary">
                  {filteredStudents.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('studentName')}
                      className="flex items-center space-x-1"
                    >
                      <span>Élève</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('amountToPay')}
                      className="flex items-center space-x-1"
                    >
                      <span>Frais à payer</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('totalFeesPaid')}
                      className="flex items-center space-x-1"
                    >
                      <span>Total payé</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('remaining')}
                      className="flex items-center space-x-1"
                    >
                      <span>Reste à payer</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">
                        {student.student?.firstName} {student.student?.lastName}
                      </TableCell>
                      <TableCell>{student.student?.matricule}</TableCell>
                      <TableCell>{student.classes?.name}</TableCell>
                      <TableCell className="font-semibold">
                        {student.amountToPay?.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {student.totalFeesPaid?.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell className={student.remaining > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                        {student.remaining?.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(student)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(student)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddPayment(student)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-center">
                        <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucun élève trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Précédent
                </Button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => goToPage(i + 1)}
                      size="sm"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Suivant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History Dialog */}
      <Dialog open={showFeeDetail} onOpenChange={setShowFeeDetail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historique des paiements</DialogTitle>
            <DialogDescription>
              Détails des paiements pour {selectedStudent?.student?.firstName} {selectedStudent?.student?.lastName}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total à payer</p>
                  <p className="text-2xl font-bold">{selectedStudent.amountToPay?.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total payé</p>
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.totalFeesPaid?.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reste à payer</p>
                  <p className={`text-2xl font-bold ${selectedStudent.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedStudent.remaining?.toLocaleString()} FCFA
                  </p>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h4 className="font-semibold mb-4">Historique des paiements</h4>
                {selectedStudent.fees?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Facture</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date paiement</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudent.fees.map((fee) => (
                        <TableRow key={fee.billID}>
                          <TableCell>{fee.billID}</TableCell>
                          <TableCell>{fee.type}</TableCell>
                          <TableCell className="font-semibold">{fee.amount?.toLocaleString()} FCFA</TableCell>
                          <TableCell>{new Date(fee.paymentDate).toLocaleDateString()}</TableCell>
                          <TableCell>{fee.paymentMethod}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditPayment(selectedStudent, fee)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePayment(selectedStudent, fee.billID)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Aucun paiement enregistré</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowFeeDetail(false)}>Fermer</Button>
            <Button onClick={() => handleAddPayment(selectedStudent)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFee ? 'Modifier le paiement' : 'Nouveau paiement'}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent && `${selectedStudent.student?.firstName} ${selectedStudent.student?.lastName}`}
            </DialogDescription>
          </DialogHeader>

          {/* Simple Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type de frais *</label>
              <select
                className={`w-full border rounded-lg px-3 py-2 text-sm`}
                value={paymentData?.type}
                disabled
                onChange={(e) => setPaymentData({ ...paymentData, type: "Tuition" })}
              >
                {/* <option value="">Sélectionnez le type de frais</option> */}
                <option value="Tuition">Scolarité</option>
                {/* <option value="Books">Livres</option>
                <option value="Uniform">Uniforme</option>
                <option value="Transport">Transport</option>
                <option value="Other">Autre</option> */}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Montant</label>
              <Input
                type="number"
                placeholder="Montant en FCFA"
                defaultValue={selectedFee?.amount}
                value={paymentData?.amount}
                // placeholder="Montant en FCFA"
                min="0"
                step="0.01"
                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date de paiement</label>
              <Input
                value={paymentData?.paymentDate?.split('T')[0]}
                type="date"
                defaultValue={selectedFee?.paymentDate?.split('T')[0]}
                onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Méthode de paiement</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                value={paymentData?.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              >
                <option value="">Choisi le mode de payment</option>
                <option value="Cash">Espèces</option>
                <option value="Bank Transfer">Virement</option>
                <option value="Check">Chèque</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
              Annuler
            </Button>
            <Button onClick={handlePaymentSubmit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedFee ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}