import express from "express";
import InvoiceController from "../controllers/InvoiceController.js";

const router = express.Router();

router.post("/trial/:schoolId", InvoiceController.createTrialInvoice);
router.post("/generate/:schoolId", InvoiceController.generateInvoice);
router.put("/pay/:invoiceId", InvoiceController.payInvoice);
router.get("/school/:schoolId", InvoiceController.getAllSchoolInvoices);

export default router;
