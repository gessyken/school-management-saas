import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { printInvoicePDF } from "@/lib/printInvoice";
import { toast } from "@/components/ui/use-toast";
import { invoiceService } from "@/lib/services/invoiceService";

type Props = {
  invoices: any[];
  schoolId?: string;
  setInvoices: (invoices: any[]) => void;
  handlePayInvoice: (invoiceId: string, phoneNumber?: string) => Promise<void>;
};

const InvoiceHistory = ({
  invoices,
  schoolId,
  setInvoices,
  handlePayInvoice,
}: Props) => {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleGenerateInvoice = async () => {
    if (!schoolId) return;
    setSubmitting(true);
    try {
      await invoiceService.generate(schoolId);
      toast({ title: "Nouvelle facture générée" });
      const invoiceRes = await invoiceService.getBySchool(schoolId);
      setInvoices(invoiceRes.data);
    } catch {
      toast({
        title: "Erreur",
        description: "Échec de génération de la facture",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!phoneNumber || !selectedInvoice) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un numéro de téléphone valide.",
        variant: "destructive",
      });
      return;
    }

    try {
      await handlePayInvoice(selectedInvoice._id, phoneNumber);
      setShowPayModal(false);
      setPhoneNumber("");
    } catch (error) {
      // handled in parent
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleGenerateInvoice} disabled={submitting}>
          {submitting ? "Génération..." : "Générer une facture"}
        </Button>
      </div>

      {invoices.map((invoice) => (
        <div
          key={invoice._id}
          className="p-4 border rounded flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              {invoice.invoiceNumber} - {invoice.amount.total}{" "}
              {invoice.amount.currency}
            </p>
            <p className="text-sm text-muted-foreground">
              Statut: {invoice.paymentStatus}
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setSelectedInvoice(invoice)}
              >
                Détails
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Détails de la facture</DialogTitle>
              </DialogHeader>

              <div className="text-sm space-y-2 p-2 border">
                <p><strong>Numéro:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Total:</strong> {invoice.amount.total} {invoice.amount.currency}</p>
                <p><strong>Sous-total:</strong> {invoice.amount.subtotal}</p>
                <p><strong>Taxe:</strong> {invoice.amount.tax}</p>
                <p><strong>Réduction:</strong> {invoice.amount.discount}</p>
                <p><strong>Échéance:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p><strong>Statut:</strong> {invoice.paymentStatus}</p>
                <p><strong>Payée le:</strong> {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "Non payé"}</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <Button onClick={() => printInvoicePDF(invoice)}>
                  Télécharger PDF avec QR
                </Button>

                {invoice.paymentStatus !== "Paid" && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowPayModal(true);
                    }}
                  >
                    Marquer comme Payée
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ))}

      {/* Payment Phone Number Modal */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paiement de la facture</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p>Entrez votre numéro de téléphone pour procéder au paiement :</p>
            <Input
              placeholder="Numéro de téléphone (ex: +237...)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowPayModal(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleSubmitPayment}>
                Confirmer et marquer comme payée
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceHistory;
