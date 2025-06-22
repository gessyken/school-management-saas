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
        isPaid: { type: Boolean, default: false },
        paymentProvider: { type: String, enum: ['stripe', 'paypal', 'flutterwave'], default: 'stripe' },
        customerId: { type: String },
        subscriptionId: { type: String },
        lastPaymentDate: { type: Date },
        nextPaymentDue: { type: Date },
        paymentStatus: {
            type: String,
            enum: ['trialing', 'active', 'past_due', 'canceled', 'unpaid'],
            default: 'trialing'
        },
        trialEndsAt: { type: Date }
    },

    accessStatus: {
        type: String,
        enum: ['active', 'suspended', 'blocked'],
        default: 'active'
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

// Automatically block access if unpaid and overdue
schoolSchema.methods.evaluateAccess = function () {
    const now = new Date();
    if (this.billing.paymentStatus === 'unpaid' || this.billing.paymentStatus === 'canceled') {
        this.accessStatus = 'blocked';
        this.blockReason = 'Subscription is unpaid or canceled';
    } else if (this.billing.nextPaymentDue && this.billing.nextPaymentDue < now) {
        this.accessStatus = 'suspended';
        this.blockReason = 'Subscription payment overdue';
    } else if (this.billing.trialEndsAt && this.billing.trialEndsAt < now && this.plan === 'FREE') {
        this.accessStatus = 'suspended';
        this.blockReason = 'Trial expired. Please upgrade.';
    } else {
        this.accessStatus = 'active';
        this.blockReason = '';
    }
    return this.save();
};

const School = mongoose.model('School', schoolSchema);
export default School;
