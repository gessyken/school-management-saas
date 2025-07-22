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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
          {submitting
            ? t("invoiceHistory.generating")
            : t("invoiceHistory.generateInvoice")}
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
              {t("invoiceHistory.status")}: {invoice.paymentStatus}
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setSelectedInvoice(invoice)}
              >
                {t("invoiceHistory.details")}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("invoiceHistory.invoiceDetails")}</DialogTitle>
              </DialogHeader>

              <div className="text-sm space-y-2 p-2 border">
                <p>
                  <strong>{t("invoiceHistory.number")}:</strong>{" "}
                  {invoice.invoiceNumber}
                </p>
                <p>
                  <strong>{t("invoiceHistory.total")}:</strong>{" "}
                  {invoice.amount.total} {invoice.amount.currency}
                </p>
                <p>
                  <strong>{t("invoiceHistory.subtotal")}:</strong>{" "}
                  {invoice.amount.subtotal}
                </p>
                <p>
                  <strong>{t("invoiceHistory.tax")}:</strong>{" "}
                  {invoice.amount.tax}
                </p>
                <p>
                  <strong>{t("invoiceHistory.discount")}:</strong>{" "}
                  {invoice.amount.discount}
                </p>
                <p>
                  <strong>{t("invoiceHistory.dueDate")}:</strong>{" "}
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>{t("invoiceHistory.status")}:</strong>{" "}
                  {invoice.paymentStatus}
                </p>
                <p>
                  <strong>{t("invoiceHistory.paidAt")}:</strong>{" "}
                  {invoice.paidAt
                    ? new Date(invoice.paidAt).toLocaleDateString()
                    : t("invoiceHistory.notPaid")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <Button onClick={() => printInvoicePDF(invoice)}>
                  {t("invoiceHistory.downloadPDF")}
                </Button>

                {invoice.paymentStatus !== "Paid" && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowPayModal(true);
                    }}
                  >
                    {t("invoiceHistory.markAsPaid")}
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
            <DialogTitle>{t("invoiceHistory.paymentTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p>{t("invoiceHistory.enterPhone")}</p>
            <Input
              placeholder={t("invoiceHistory.phonePlaceholder")}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowPayModal(false)}>
                {t("invoiceHistory.cancel")}
              </Button>
              <Button onClick={handleSubmitPayment}>
                {t("invoiceHistory.confirmAndMarkPaid")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceHistory;
