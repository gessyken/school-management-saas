import mongoose from 'mongoose';

const termSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    // More flexible than enum - allows custom term names like "Semester 1", "Quarter 1", etc.
    validate: {
      validator: function(name) {
        return name && name.length > 0;
      },
      message: 'Term name is required'
    }
  },
  // CHANGED: Reference to AcademicYearDetail instead of string
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYearDetail',
    required: true,
    index: true
  },
  // NEW: Term code for shorter identification (e.g., "T1", "S1", "Q1")
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 10,
    match: [/^[A-Z0-9]+$/, 'Term code can only contain letters and numbers']
  },
  // NEW: Term type for categorization
  type: {
    type: String,
    enum: ['term', 'semester', 'quarter', 'trimester', 'custom'],
    default: 'term'
  },
  // NEW: Term sequence order within academic year
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 12, // Reasonable upper limit
    validate: {
      validator: Number.isInteger,
      message: 'Order must be an integer'
    }
  },
  startDate: {
    type: Date,
    required: true,
    validate: [
      {
        validator: function(value) {
          return value < this.endDate;
        },
        message: 'Start date must be before end date.'
      },
      // NEW: Validate against academic year dates
      {
        validator: async function(value) {
          const AcademicYear = mongoose.model('AcademicYearDetail');
          const academicYear = await AcademicYear.findById(this.academicYear);
          return academicYear && value >= academicYear.startDate && value <= academicYear.endDate;
        },
        message: 'Term start date must be within academic year dates'
      }
    ]
  },
  endDate: {
    type: Date,
    required: true,
    validate: [
      {
        validator: function(value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date.'
      },
      // NEW: Validate against academic year dates
      {
        validator: async function(value) {
          const AcademicYear = mongoose.model('AcademicYearDetail');
          const academicYear = await AcademicYear.findById(this.academicYear);
          return academicYear && value >= academicYear.startDate && value <= academicYear.endDate;
        },
        message: 'Term end date must be within academic year dates'
      }
    ]
  },
  // NEW: Enhanced status management
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming',
    index: true
  },
  // RENAMED: From isActive to isCurrent for consistency with AcademicYear
  isCurrent: {
    type: Boolean,
    default: false,
    index: true
  },
  sequences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sequence',
  }],
  // NEW: Additional metadata
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  // NEW: Academic settings
  settings: {
    allowsGrading: {
      type: Boolean,
      default: true
    },
    allowsAttendance: {
      type: Boolean,
      default: true
    },
    maximumSequences: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    }
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // NEW: Last modified tracking
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Compound indexes for common query patterns
termSchema.index({ school: 1, academicYear: 1, name: 1 }, { unique: true });
termSchema.index({ school: 1, academicYear: 1, code: 1 }, { unique: true });
termSchema.index({ school: 1, academicYear: 1, order: 1 }, { unique: true });
termSchema.index({ school: 1, isCurrent: 1 });
termSchema.index({ school: 1, status: 1 });
termSchema.index({ startDate: 1, endDate: 1 });

// NEW: Pre-save middleware for data consistency and validation
termSchema.pre('save', async function(next) {
  try {
    // Auto-update status based on dates
    if (this.startDate && this.endDate) {
      const now = new Date();
      if (now < this.startDate) {
        this.status = 'upcoming';
      } else if (now >= this.startDate && now <= this.endDate) {
        this.status = 'active';
      } else {
        this.status = 'completed';
        this.isCurrent = false; // Auto-deactivate completed terms
      }
    }

    // Ensure only one current term per school
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

    // Validate that order is unique within academic year
    if (this.isModified('order')) {
      const existingTerm = await this.constructor.findOne({
        school: this.school,
        academicYear: this.academicYear,
        order: this.order,
        _id: { $ne: this._id }
      });
      
      if (existingTerm) {
        throw new Error(`Term order ${this.order} already exists in this academic year`);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// NEW: Pre-remove middleware to handle dependent sequences
termSchema.pre('remove', async function(next) {
  try {
    const Sequence = mongoose.model('Sequence');
    // Remove all associated sequences
    await Sequence.deleteMany({ term: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

// NEW: Static methods for common queries
termSchema.statics.findCurrentBySchool = function(schoolId) {
  return this.findOne({ school: schoolId, isCurrent: true })
    .populate('academicYear')
    .populate('sequences');
};

termSchema.statics.findByAcademicYear = function(schoolId, academicYearId) {
  return this.find({ 
    school: schoolId, 
    academicYear: academicYearId 
  }).sort({ order: 1 })
    .populate('sequences');
};

termSchema.statics.findActiveBySchool = function(schoolId) {
  return this.find({ 
    school: schoolId, 
    status: 'active' 
  }).populate('academicYear');
};

// NEW: Instance methods
termSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

termSchema.methods.getDurationInDays = function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

termSchema.methods.canAcceptGrades = function() {
  return this.settings.allowsGrading && this.status === 'active';
};

// NEW: Virtual for term progress percentage
termSchema.virtual('progressPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'upcoming') return 0;
  
  const now = new Date();
  const totalDuration = this.endDate - this.startDate;
  const elapsed = now - this.startDate;
  
  return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
});

// Configure toJSON transform
termSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const Term = mongoose.model('Term', termSchema);
export default Term;