import mongoose from 'mongoose';

const sequenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    validate: {
      validator: function(name) {
        return name && name.length > 0;
      },
      message: 'Sequence name is required'
    }
  },
  // NEW: Sequence code for shorter identification
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 20,
    match: [/^[A-Z0-9_-]+$/, 'Sequence code can only contain letters, numbers, hyphens, and underscores']
  },
  // NEW: Sequence order within term
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    validate: {
      validator: Number.isInteger,
      message: 'Order must be an integer'
    }
  },
  // ENHANCED: Better status management
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  // RENAMED: For consistency with other schemas
  isCurrent: {
    type: Boolean,
    default: false,
    index: true
  },
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
    required: true,
    index: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
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
      // NEW: Validate against term dates
      {
        validator: async function(value) {
          if (!this.term) return true;
          const term = await mongoose.model('Term').findById(this.term);
          return term && value >= term.startDate && value <= term.endDate;
        },
        message: 'Sequence start date must be within term dates'
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
      // NEW: Validate against term dates
      {
        validator: async function(value) {
          if (!this.term) return true;
          const term = await mongoose.model('Term').findById(this.term);
          return term && value >= term.startDate && value <= term.endDate;
        },
        message: 'Sequence end date must be within term dates'
      }
    ]
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
    maximumAssessments: {
      type: Number,
      default: 20,
      min: 1,
      max: 100
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      validate: {
        validator: Number.isInteger,
        message: 'Weight must be an integer'
      }
    }
  },
  // NEW: Additional metadata
  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  objectives: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for common query patterns
sequenceSchema.index({ term: 1, school: 1, name: 1 }, { unique: true });
sequenceSchema.index({ term: 1, school: 1, code: 1 }, { unique: true });
sequenceSchema.index({ term: 1, school: 1, order: 1 }, { unique: true });
sequenceSchema.index({ school: 1, isCurrent: 1 });
sequenceSchema.index({ school: 1, status: 1 });
sequenceSchema.index({ startDate: 1, endDate: 1 });
sequenceSchema.index({ term: 1, startDate: 1 }); // For sorting sequences within term

// NEW: Pre-save middleware for data consistency
sequenceSchema.pre('save', async function(next) {
  try {
    // Auto-update status based on dates
    if (this.startDate && this.endDate) {
      const now = new Date();
      if (now < this.startDate) {
        this.status = 'scheduled';
      } else if (now >= this.startDate && now <= this.endDate) {
        this.status = 'active';
      } else {
        this.status = 'completed';
        this.isCurrent = false; // Auto-deactivate completed sequences
      }
    }

    // Ensure only one current sequence per school
    if (this.isCurrent && this.isModified('isCurrent')) {
      await this.constructor.updateMany(
        { 
          _id: { $ne: this._id },
          school: this.school
        },
        { $set: { isCurrent: false } }
      );
    }

    // Validate that order is unique within term
    if (this.isModified('order')) {
      const existingSequence = await this.constructor.findOne({
        term: this.term,
        school: this.school,
        order: this.order,
        _id: { $ne: this._id }
      });
      
      if (existingSequence) {
        throw new Error(`Sequence order ${this.order} already exists in this term`);
      }
    }

    // Validate term-school consistency
    if (this.term && this.school) {
      const term = await mongoose.model('Term').findById(this.term);
      if (!term) {
        throw new Error('Associated term not found');
      }
      if (term.school.toString() !== this.school.toString()) {
        throw new Error('Term does not belong to the specified school');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// FIXED: Post-save middleware to update term's sequences array
sequenceSchema.post('save', async function(doc) {
  try {
    await mongoose.model('Term').findByIdAndUpdate(
      doc.term,
      { $addToSet: { sequences: doc._id } }
    );
  } catch (error) {
    console.error('Error updating term sequences:', error);
  }
});

// FIXED: Pre-findOneAndUpdate middleware with better validation
sequenceSchema.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate();
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) return next();

    // Handle term or school updates
    if (update.term || update.school) {
      const newTermId = update.term ? update.term.toString() : doc.term.toString();
      const newSchoolId = update.school ? update.school.toString() : doc.school.toString();

      // Validate new term exists and belongs to school
      const newTerm = await mongoose.model('Term').findById(newTermId);
      if (!newTerm) {
        throw new Error('New term not found');
      }
      if (newTerm.school.toString() !== newSchoolId) {
        throw new Error('New term does not belong to the specified school');
      }

      // If term changed, update references
      if (update.term && doc.term.toString() !== newTermId) {
        await mongoose.model('Term').findByIdAndUpdate(
          doc.term,
          { $pull: { sequences: doc._id } }
        );
        await mongoose.model('Term').findByIdAndUpdate(
          newTermId,
          { $addToSet: { sequences: doc._id } }
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// FIXED: Post-delete middleware
sequenceSchema.post(['findOneAndDelete', 'deleteOne'], async function(doc) {
  if (doc) {
    try {
      await mongoose.model('Term').findByIdAndUpdate(
        doc.term,
        { $pull: { sequences: doc._id } }
      );
    } catch (error) {
      console.error('Error cleaning up term sequences:', error);
    }
  }
});

// NEW: Static methods for common queries
sequenceSchema.statics.findCurrentBySchool = function(schoolId) {
  return this.findOne({ school: schoolId, isCurrent: true })
    .populate('term')
    .populate('school');
};

sequenceSchema.statics.findByTerm = function(termId) {
  return this.find({ term: termId })
    .sort({ order: 1 })
    .populate('term');
};

sequenceSchema.statics.findActiveBySchool = function(schoolId) {
  return this.find({ 
    school: schoolId, 
    status: 'active' 
  }).populate('term');
};

sequenceSchema.statics.findByStatusAndTerm = function(termId, status) {
  return this.find({ 
    term: termId, 
    status: status 
  }).sort({ order: 1 });
};

// NEW: Instance methods
sequenceSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

sequenceSchema.methods.getDurationInDays = function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

sequenceSchema.methods.canAcceptGrades = function() {
  return this.settings.allowsGrading && 
         (this.status === 'active' || this.status === 'completed');
};

// NEW: Virtual for sequence progress percentage
sequenceSchema.virtual('progressPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'scheduled') return 0;
  
  const now = new Date();
  const totalDuration = this.endDate - this.startDate;
  const elapsed = now - this.startDate;
  
  return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
});

// NEW: Virtual for remaining days
sequenceSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed') return 0;
  
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

export default Sequence;