import Invoice from "../models/Invoice.js";
import School from '../models/School.js';
import axios from "axios";

const CAMPAY_API_BASE_URL = process.env.CAMPAY_API_BASE_URL;
const CAMPAY_APP_USERNAME = process.env.CAMPAY_APP_USERNAME;
const CAMPAY_APP_PASSWORD = process.env.CAMPAY_APP_PASSWORD;
const CAMPAY_TOKEN_ENDPOINT = `${CAMPAY_API_BASE_URL}/token/`;
const CAMPAY_COLLECT_ENDPOINT = `${CAMPAY_API_BASE_URL}/collect/`;
const CAMPAY_DISBURSE_ENDPOINT = `${CAMPAY_API_BASE_URL}/withdraw/`;
const CAMPAY_TRANSACTION_STATUS_ENDPOINT = (reference) => `${CAMPAY_API_BASE_URL}/transaction/${reference}/`; // Endpoint to CHECK status

async function getCampayAccessToken() {
    try {
        console.log(CAMPAY_TOKEN_ENDPOINT)
        const response = await axios.post(CAMPAY_TOKEN_ENDPOINT, {
            // Confirm with Campay docs if these should be 'username'/'password' or 'app_username'/'app_password'
            username: CAMPAY_APP_USERNAME,
            password: CAMPAY_APP_PASSWORD
        });
        return response.data.token;
    } catch (error) {
        console.error('Error fetching Campay access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to obtain Campay access token. Please check credentials and base URL.');
    }
}

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

  static async collectInvoice(req, res){
    const { phoneNumber } = req.body;
    const { invoiceId } = req.params;
    if (!phoneNumber) {
        return res.status(400).json({ message: 'Missing required parameters: phoneNumber.' });
    }
    // if (typeof grossAmount !== 'number' || grossAmount <= 0) {
    //     return res.status(400).json({ message: 'Gross amount must be a positive number.' });
    // }
    const phoneRegex = /^237\d{9}$/; // Example for Cameroon numbers
    if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: 'Invalid phone number format. Must include country code (e.g., 6xxxxxxxx).' });
    }

    let accessToken;
    try {
        accessToken = await getCampayAccessToken();
    } catch (tokenError) {
        return res.status(500).json({ message: tokenError.message });
    }

    const headers = {
        'Authorization': `Token ${accessToken}`,
        'Content-Type': 'application/json'
    };

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    // let collectReference = `${invoice._id}`;
    let collectReference = `COLLECT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
        
        console.log("--- Step 1: Initiating Collect ---");
        const collectPayload = {
            amount: invoice.amount.total.toString(),
            // currency: currency,
            from: phoneNumber,
            description: `Collection for money invoice ${invoice._id}`,
            external_reference: collectReference
        };

        const collectResponse = await axios.post(CAMPAY_COLLECT_ENDPOINT, collectPayload, { headers });
        console.log(collectResponse)
        if (collectResponse.status === 200 || collectResponse.status === 202) {
            console.log('Campay Collect Initiation successful:', collectResponse.data);
            invoice.externalReference= collectReference
            invoice.save();
            res.status(202).json({
                message: 'Money collection initiated. Awaiting sender confirmation and Campay processing.',
                status: collectResponse.data.status || 'PENDING', 
                collectReference: collectReference,
                details: collectResponse.data,
                nextSteps: 'Monitor transaction status using the collectReference or await webhook for completion.'
            });
        } else {
            console.error('Campay Collect Initiation failed with unexpected status:', collectResponse.data);
            return res.status(400).json({
                message: 'Failed to initiate money collection from sender.',
                details: collectResponse.data
            });
        }

    } catch (error) {
        console.error('Error during Campay collect initiation:', error.response ? error.response.data : error.message);
        let errorMessage = 'An unexpected error occurred during the collection initiation.';
        let errorDetails = {};

        if (error.response && error.response.data) {
            errorMessage = error.response.data.detail || error.response.data.message || error.response.data;
            errorDetails = error.response.data;
        }

        res.status(error.response ? error.response.status : 500).json({
            message: errorMessage,
            campayError: errorDetails,
            collectReference: collectReference 
        });
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
