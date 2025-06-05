import mongoose from 'mongoose';

const academicYearDetailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
        unique: true,
    },
    isCurrent: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value < this.endDate;
            },
            message: 'Start date must be before end date.'
        }
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date.'
        }
    },
    terms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Term'
    }]
}, {
    timestamps: true
});

// Middleware to ensure only one document has isCurrent: true
academicYearDetailSchema.pre('save', async function (next) {
    if (this.isCurrent) {
        await this.constructor.updateMany(
            { _id: { $ne: this._id } }, // all documents except the current one
            { $set: { isCurrent: false } }
        );
    }
    next();
});

const AcademicYearDetail = mongoose.model('AcademicYearDetail', academicYearDetailSchema);

export default AcademicYearDetail;

