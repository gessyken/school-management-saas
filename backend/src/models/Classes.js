import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },

  classesName: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },

  capacity: {
    type: Number,
    min: 1
  },

  amountFee: {
    type: Number,
    min: 0,
    default: 0
  },

  subjects: [{
    subjectInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    coefficient: {
      type: Number,
      default: 1,
      min: 0,
      max: 100
    },
    isActive: {
      type: Boolean,
      default: true
    },
    teacherInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  studentList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],

  mainTeacherInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  year: {
    type: String,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    required: true,
    trim: true
  },

  level: {
    type: String,
    required: true,
    enum: [
      // Système anglophone
      'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth',
      // Système francophone
      '6e', '5e', '4e', '3e', '2nde', '1ère', 'Terminale'
    ]
  }

}, {
  timestamps: true
});

// Composite index to ensure uniqueness of class within the school and academic year
classSchema.index({ school: 1, classesName: 1, year: 1 }, { unique: true });

const Classes = mongoose.model('Classes', classSchema);
export default Classes;
