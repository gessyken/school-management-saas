import mongoose from 'mongoose';

const academicYearDetailSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    // Add trim and uppercase normalization
    trim: true,
    uppercase: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
    index: true, // Add index for frequent queries on current academic years
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value < this.endDate;
      },
      message: 'Start date must be before end date.',
    },
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date.',
    },
  },
  // NEW: Add status field for better lifecycle management
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming',
    index: true,
  },
  // NEW: Add description field for additional context
  description: {
    type: String,
    maxlength: 500,
    trim: true,
  },
  terms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
  }],
  // NEW: Add metadata for auditing and reporting
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Make optional if not always available
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      maxlength: 1000,
    }
  }
}, {
  timestamps: true,
});

// Compound indexes for common query patterns
academicYearDetailSchema.index({ school: 1, name: 1 }, { unique: true });
academicYearDetailSchema.index({ school: 1, isCurrent: 1 });
academicYearDetailSchema.index({ school: 1, status: 1 });
academicYearDetailSchema.index({ startDate: 1, endDate: 1 });

// Enhanced middleware with better error handling
academicYearDetailSchema.pre('save', async function (next) {
  try {
    // Validate academic year format programmatically
    if (this.name) {
      const years = this.name.split('-');
      if (years.length !== 2 || years[0] >= years[1]) {
        throw new Error('Academic year must be in format YYYY-YYYY where first year is less than second');
      }
    }

    // Auto-update status based on dates
    if (this.startDate && this.endDate) {
      const now = new Date();
      if (now < this.startDate) {
        this.status = 'upcoming';
      } else if (now >= this.startDate && now <= this.endDate) {
        this.status = 'active';
      } else {
        this.status = 'completed';
      }
    }

    // Ensure only one current academic year per school
    if (this.isCurrent && this.isModified('isCurrent')) {
      await this.constructor.updateMany(
        { 
          _id: { $ne: this._id },
          school: this.school
        },
        { $set: { isCurrent: false } }
      );
      
      // Auto-set status to active if marked as current
      if (this.status !== 'active') {
        this.status = 'active';
      }
    }

    // Prevent setting isCurrent: true for completed academic years
    if (this.isCurrent && this.status === 'completed') {
      throw new Error('Cannot set completed academic year as current');
    }

    next();
  } catch (error) {
    next(error);
  }
});

// NEW: Static method to find current academic year by school
academicYearDetailSchema.statics.findCurrentBySchool = function(schoolId) {
  return this.findOne({ school: schoolId, isCurrent: true });
};

// NEW: Static method to find academic years by status
academicYearDetailSchema.statics.findByStatus = function(schoolId, status) {
  return this.find({ school: schoolId, status: status });
};

// NEW: Instance method to check if academic year is active
academicYearDetailSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// NEW: Virtual for duration in days
academicYearDetailSchema.virtual('durationInDays').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// NEW: Add toJSON transform to include virtuals
academicYearDetailSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const AcademicYearDetail = mongoose.model('AcademicYearDetail', academicYearDetailSchema);

export default AcademicYearDetail;