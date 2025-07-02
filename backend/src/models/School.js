import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },

    phone: {
        type: String,
        trim: true
    },

    address: {
        type: String,
        trim: true
    },

    logoUrl: {
        type: String,
        trim: true
    },

    subdomain: {
        type: String,
        lowercase: true,
        unique: true,
        sparse: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    plan: {
        type: String,
        enum: ['FREE', 'BASIC', 'PRO'],
        default: 'FREE'
    },

    billing: {
        currentInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
        nextInvoiceDue: { type: Date },
        lastPaymentDate: { type: Date },
        status: {
            type: String,
            enum: ["active", "trialing", "past_due", "canceled", "unpaid"],
            default: "trialing",
        },
        trialEndsAt: { type: Date },
    },

    // Billing configuration
    billingRules: {
        baseMonthlyFee: { type: Number, default: 10000 },
        perStudentFee: { type: Number, default: 5 },
        perStaffFee: { type: Number, default: 200 },
        perClassFee: { type: Number, default: 150 },
        // storageLimitMB: { type: Number, default: 1000 },
    },
    usage: {
        studentsCount: { type: Number, default: 1000 },
        staffCount: { type: Number, default: 10 },
        classCount: { type: Number, default: 14 },
        // storageUsedMB: { type: Number, default: 0 },
        lastUsageCalculated: { type: Date },
    },

    accessStatus: {
        type: String,
        enum: ['active', 'suspended', 'blocked'],
        default: 'active'
    },
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    memberShipAccessStatus: {
        type: Boolean,
        default: true
    },
    blockReason: {
        type: String,
        default: ''
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Method: Compute total bill based on usage
schoolSchema.methods.calculateMonthlyBill = function () {
  const rules = this.billingRules;
  const usage = this.usage;

  let total =
    rules.baseMonthlyFee +
    usage.studentsCount * rules.perStudentFee +
    usage.staffCount * rules.perStaffFee +
    usage.classCount * rules.perClassFee;

  const extraStorage =
    usage.storageUsedMB > rules.storageLimitMB
      ? usage.storageUsedMB - rules.storageLimitMB
      : 0;

  total += extraStorage * rules.pricePerExtraStorageMB;

  return total;
};

// Method: Evaluate if access should be blocked
schoolSchema.methods.evaluateAccess = function () {
  const now = new Date();
  if (
    this.billing.status === "unpaid" ||
    this.billing.status === "canceled"
  ) {
    this.accessStatus = "blocked";
    this.blockReason = "Subscription unpaid or canceled";
  } else if (
    this.billing.nextInvoiceDue &&
    this.billing.nextInvoiceDue < now
  ) {
    this.accessStatus = "suspended";
    this.blockReason = "Payment overdue";
  } else if (
    this.billing.trialEndsAt &&
    this.billing.trialEndsAt < now &&
    this.plan === "FREE"
  ) {
    this.accessStatus = "suspended";
    this.blockReason = "Trial expired. Please upgrade";
  } else {
    this.accessStatus = "active";
    this.blockReason = "";
  }

  return this.save();
};
const School = mongoose.model('School', schoolSchema);
export default School;
