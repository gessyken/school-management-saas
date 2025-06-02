import mongoose from 'mongoose';

const termSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['Term 1', 'Term 2',"Term 3"],
        required: true,
        trim: true
    },
    academicYear: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
        trim: true
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value < this.endDate;
            },
            message: 'Start date must be before end date.'
        }
    },
    sequences: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sequence',
    }],
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date.'
        }
    },
    isActive: {
        type: Boolean,
        default: false // Marks if the semester is currently ongoing
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tracks admin or professor who created it
    }
}, { timestamps: true });

// Add compound index for fast lookups and potential additional indexes
termSchema.index({ academicYear: 1, name: 1 }, { unique: true });
termSchema.index({ academicYear: 1 }); // Index for faster queries by academicYear

// Optional: Middleware to automatically update `isActive` based on dates
termSchema.pre('save', function(next) {
    const currentDate = new Date();
    // Automatically set isActive based on current date and start/end dates
    if (this.startDate <= currentDate && this.endDate >= currentDate) {
        this.isActive = true;
    } else {
        this.isActive = false;
    }
    next();
});

const Term = mongoose.model('Term', termSchema);
export default Term;
