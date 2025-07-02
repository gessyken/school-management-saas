import mongoose from 'mongoose';

const sequenceSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Sequence 1', 'Sequence 2', 'Sequence 3', 'Sequence 4'],
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true,
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Unique compound index: term + school + name
sequenceSchema.index({ term: 1, school: 1, name: 1 }, { unique: true });
sequenceSchema.index({ term: 1, school: 1 });

// Middleware to ensure term belongs to the same school
sequenceSchema.pre('validate', async function (next) {
  try {
    if (this.term && this.school) {
      const term = await mongoose.model('Term').findById(this.term).exec();
      if (!term) {
        return next(new Error('Associated term not found.'));
      }
      if (term.school.toString() !== this.school.toString()) {
        return next(new Error('Term does not belong to the specified school.'));
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Middleware to add module (sequence) to term
sequenceSchema.post('save', async function (doc) {
  await mongoose.model('Term').findByIdAndUpdate(doc.term, {
    $addToSet: { modules: doc._id }
  });
});

// Middleware to update term reference on update
sequenceSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.term || update.school) {
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) return next();

    // If term or school is being updated, validate new term's school consistency
    const newTermId = update.term ? update.term.toString() : doc.term.toString();
    const newSchoolId = update.school ? update.school.toString() : doc.school.toString();

    if (update.term || update.school) {
      const newTerm = await mongoose.model('Term').findById(newTermId);
      if (!newTerm) {
        return next(new Error('New term not found.'));
      }
      if (newTerm.school.toString() !== newSchoolId) {
        return next(new Error('New term does not belong to the specified school.'));
      }
    }

    // If term changed, update references in old and new terms
    if (update.term && doc.term.toString() !== update.term.toString()) {
      await mongoose.model('Term').findByIdAndUpdate(doc.term, {
        $pull: { modules: doc._id }
      });
      await mongoose.model('Term').findByIdAndUpdate(update.term, {
        $addToSet: { modules: doc._id }
      });
    }
  }
  next();
});

// Middleware to remove module reference on delete
sequenceSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await mongoose.model('Term').findByIdAndUpdate(doc.term, {
      $pull: { modules: doc._id }
    });
  }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

export default Sequence;
