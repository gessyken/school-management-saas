import Invoice from "../models/Invoice.js";
import School from '../models/School.js';

class InvoiceController {
  // Utility method to generate invoice number
  static generateInvoiceNumber() {
    return `INV-${Date.now()}`;
  }

  // 1. Create 7-Day Trial Invoice
  static async createTrialInvoice(req, res) {
    const { schoolId } = req.params;

    try {
      const school = await School.findById(schoolId);
      if (!school) return res.status(404).json({ error: "School not found" });

      const now = new Date();
      const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const dueDate = new Date(trialEnds.getTime() + 5 * 24 * 60 * 60 * 1000);

      const invoice = await Invoice.create({
        school: school._id,
        invoiceNumber: InvoiceController.generateInvoiceNumber(),
        billingPeriod: {
          start: now,
          end: trialEnds,
        },
        amount: {
          subtotal: 0,
          tax: 0,
          discount: 0,
          total: 0,
          currency: "XAF",
        },
        breakdown: {
          users: { count: 0, pricePerUnit: 0 },
          students: { count: 0, pricePerUnit: 0 },
          storage: { gbUsed: 0, pricePerGB: 0 },
          custom: [{ label: "7-Day Trial", amount: 0 }],
        },
        paymentStatus: "paid",
        paymentMethod: "manual",
        dueDate,
        notes: "Free 7-day trial invoice",
      });

      school.billing = {
        currentInvoiceId: invoice._id,
        trialEndsAt: trialEnds,
        nextInvoiceDue: dueDate,
        status: "trialing",
      };

      await school.save();

      return res.status(201).json({ message: "Trial invoice created", invoice });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // 2. Generate New Monthly Invoice
  static async generateInvoice(req, res) {
    const { schoolId } = req.params;

    try {
      const school = await School.findById(schoolId);
      if (!school) return res.status(404).json({ error: "School not found" });

      const now = new Date();
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const dueDate = new Date(end.getTime() + 5 * 24 * 60 * 60 * 1000);

      const amountTotal = school.calculateMonthlyBill();
      console.log(amountTotal)
      const invoice = await Invoice.create({
        school: school._id,
        invoiceNumber: InvoiceController.generateInvoiceNumber(),
        billingPeriod: {
          start: now,
          end: end,
        },
        amount: {
          subtotal: amountTotal,
          tax: 0,
          discount: 0,
          total: amountTotal,
          currency: "XAF",
        },
        breakdown: {
          users: {
            count: school.usage.staffCount,
            pricePerUnit: school.billingRules.perStaffFee,
          },
          students: {
            count: school.usage.studentsCount,
            pricePerUnit: school.billingRules.perStudentFee,
          },
          storage: {
            gbUsed: 0,
            pricePerGB: 0,
          },
          custom: [],
        },
        paymentStatus: "pending",
        paymentMethod: "manual",
        dueDate,
        notes: "Monthly invoice generated",
      });

      school.billing.currentInvoiceId = invoice._id;
      school.billing.nextInvoiceDue = dueDate;
      await school.save();

      return res.status(201).json({ message: "Invoice generated", invoice });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // 3. Mark Invoice as Paid
  static async payInvoice(req, res) {
    const { invoiceId } = req.params;

    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });

      invoice.paymentStatus = "paid";
      invoice.paidAt = new Date();
      await invoice.save();

      const school = await School.findById(invoice.school);
      if (school) {
        school.billing.status = "active";
        school.billing.lastPaymentDate = invoice.paidAt;
        await school.save();
      }

      return res.status(200).json({ message: "Invoice paid", invoice });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // 4. Get All Invoices for a School
  static async getAllSchoolInvoices(req, res) {
    const { schoolId } = req.params;

    try {
      const invoices = await Invoice.find({ school: schoolId }).sort({ createdAt: -1 });

      return res.status(200).json(invoices);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
}

export default InvoiceController;
