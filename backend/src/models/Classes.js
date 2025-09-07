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
      // Francophone levels
      '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale',
      // Anglophone levels
      'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'
    ]
  },

  educationSystem: {
    type: String,
    required: true,
    enum: ['francophone', 'anglophone'],
    default: 'francophone'
  },

  specialty: {
    type: String,
    trim: true,
    // Optional field for Terminale and Upper Sixth levels
    validate: {
      validator: function(value) {
        // Only validate if specialty is provided
        if (!value) return true;
        
        const francophonieSpecialties = ['A', 'C', 'D', 'E', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3', 'TI'];
        const anglophonieSpecialties = ['Arts', 'Commercial', 'Industrial', 'Science', 'GCE A-Level Arts', 'GCE A-Level Science'];
        
        if (this.educationSystem === 'francophone' && this.level === 'Terminale') {
          return francophonieSpecialties.includes(value);
        }
        if (this.educationSystem === 'anglophone' && this.level === 'Upper Sixth') {
          return anglophonieSpecialties.includes(value);
        }
        
        // For other levels, specialty should not be set
        return false;
      },
      message: 'Invalid specialty for the selected education system and level'
    }
  },

  section: {
    type: String,
    trim: true,
    default: 'A'
  }

}, {
  timestamps: true
});

// Composite index to ensure uniqueness of class within the school and academic year
classSchema.index({ school: 1, classesName: 1, year: 1 }, { unique: true });

const Classes = mongoose.model('Classes', classSchema);
export default Classes;
