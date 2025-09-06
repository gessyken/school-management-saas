import mongoose from 'mongoose';

const termSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3', 'Term 4'],
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
      validator: function (value) {
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
      validator: function (value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date.'
    }
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tracks admin or professor who created it
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  }
}, { timestamps: true });

// Compound unique index to ensure term name is unique per academicYear per school
termSchema.index({ school: 1, academicYear: 1, name: 1 }, { unique: true });
termSchema.index({ school: 1, academicYear: 1 }); // For faster queries by school and academicYear

const Term = mongoose.model('Term', termSchema);
export default Term;
