// lib/utils/printInvoice.ts
import jsPDF from "jspdf";
import QRCode from "qrcode";

export const printInvoicePDF = async (invoice: any) => {
  const doc = new jsPDF();

  const qrDataURL = await QRCode.toDataURL(invoice.invoiceNumber);

  doc.setFontSize(18);
  doc.text("Facture", 20, 20);
  doc.setFontSize(12);
  doc.text(`Numéro: ${invoice.invoiceNumber}`, 20, 30);
  doc.text(`Période: ${new Date(invoice.billingPeriod.start).toLocaleDateString()} - ${new Date(invoice.billingPeriod.end).toLocaleDateString()}`, 20, 38);
  doc.text(`Statut: ${invoice.paymentStatus}`, 20, 46);
  doc.text(`Méthode de paiement: ${invoice.paymentMethod}`, 20, 54);
  doc.text(`Échéance: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 62);

  doc.text(`Sous-total: ${invoice.amount.subtotal} ${invoice.amount.currency}`, 20, 72);
  doc.text(`Taxe: ${invoice.amount.tax}`, 20, 80);
  doc.text(`Réduction: ${invoice.amount.discount}`, 20, 88);
  doc.text(`Total: ${invoice.amount.total} ${invoice.amount.currency}`, 20, 96);

  if (invoice.notes) {
    doc.text(`Note: ${invoice.notes}`, 20, 106);
  }

  // Add QR code
  doc.addImage(qrDataURL, "PNG", 150, 20, 40, 40);
  doc.save(`facture-${invoice.invoiceNumber}.pdf`);
};
