import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { printInvoicePDF } from "@/lib/printInvoice";

const InvoiceHistory = ({ invoices }: { invoices: any[] }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <div key={invoice._id} className="p-4 border rounded flex justify-between items-center">
          <div>
            <p className="font-semibold">
              {invoice.invoiceNumber} - {invoice.amount.total} {invoice.amount.currency}
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

              <div className="flex justify-end mt-4">
                <Button onClick={() => printInvoicePDF(invoice)}>
                  Télécharger PDF avec QR
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ))}
    </div>
  );
};

export default InvoiceHistory;
