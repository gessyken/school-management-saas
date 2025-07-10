import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    billingPeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },

    amount: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
      currency: { type: String, default: "XAF" },
    },

    breakdown: {
      users: { count: { type: Number }, pricePerUnit: { type: Number } },
      students: { count: { type: Number }, pricePerUnit: { type: Number } },
      storage: { gbUsed: { type: Number }, pricePerGB: { type: Number } },
      custom: [{ label: String, amount: Number }],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "overdue", "failed"],
      default: "pending",
    },

    paidAt: {
      type: Date,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "flutterwave", "manual"],
      default: "stripe",
    },

    externalReference: {
      type: String,
    },

    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
