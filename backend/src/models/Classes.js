import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true,
    default: ''
  },

  status: {
    type: String,
    enum: ['Open', 'Closed', 'Active', 'Inactive'],
    default: 'Open'
  },

  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 30
  },

  currentStudents: {
    type: Number,
    default: 0,
    min: 0,
    // validate: {
    //   validator: function(value) {
    //     console.log("this.capacity",this.capacity)
    //     console.log("value",value)
    //     return value <= this.capacity;
    //   },
    //   message: 'Current students cannot exceed capacity'
    // }
  },

  amountFee: {
    type: Number,
    min: 0,
    default: 0
  },

  // Main teacher reference (for frontend compatibility)
  teacher: {
    type: String,
    required: true,
    trim: true,
    default: 'Non assigné'
  },

  // Main teacher reference (for backend relationship)
  mainTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  room: {
    type: String,
    required: true,
    trim: true
  },

  // Simplified subjects array for frontend compatibility
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],

  // Detailed subjects with coefficients and teachers (for backend processing)
  subjectDetails: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    coefficient: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 10
    },
    isActive: {
      type: Boolean,
      default: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    weeklyHours: {
      type: Number,
      default: 4,
      min: 1,
      max: 20
    }
  }],

  studentList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],

  year: {
    type: String,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    required: true,
    trim: true,
    default: function() {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${currentYear + 1}`;
    }
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

  section: {
    type: String,
    required: true,
    trim: true,
    default: 'A',
    validate: {
      validator: function(value) {
        const francophoneSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const anglophoneSections = ['A', 'B', 'C', 'D'];
        
        if (this.educationSystem === 'francophone') {
          return francophoneSections.includes(value);
        } else {
          return anglophoneSections.includes(value);
        }
      },
      message: 'Invalid section for the selected education system'
    }
  },

  educationSystem: {
    type: String,
    required: true,
    enum: ['francophone', 'anglophone','bilingue'],
    default: 'francophone'
  },

  specialty: {
    type: String,
    trim: true,
    default: '',
    validate: {
      validator: function(value) {
        // Only validate if specialty is provided
        if (!value || value === '') return true;
        
        const francophoneSpecialties = ['A', 'B', 'C', 'D', 'E', 'F', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3', 'TI'];
        const anglophoneSpecialties = ['Arts', 'Commercial', 'Industrial', 'Science', 'GCE A-Level Arts', 'GCE A-Level Science'];
        
        if (this.educationSystem === 'francophone') {
          // For francophone system, specialty is only allowed for Terminale
          if (this.level === 'Terminale') {
            return francophoneSpecialties.includes(value);
          }
          return false;
        } else {
          // For anglophone system, specialty is only allowed for Upper Sixth
          if (this.level === 'Upper Sixth') {
            return anglophoneSpecialties.includes(value);
          }
          return false;
        }
      },
      message: 'Specialty is only allowed for Terminale (francophone) or Upper Sixth (anglophone) levels'
    }
  },

  // Academic metrics for frontend display
  averageGrade: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },

  attendanceRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  schedule: {
    type: String,
    trim: true,
    default: ''
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Ensure frontend-compatible fields are present
      ret.teacher = ret.teacher || 'Non assigné';
      ret.currentStudents = ret.currentStudents || 0;
      ret.capacity = ret.capacity || 30;
      
      // Calculate current students from studentList if not set
      if (!ret.currentStudents && ret.studentList) {
        ret.currentStudents = ret.studentList.length;
      }
      
      return ret;
    }
  }
});

// Virtual for class name generation
classSchema.virtual('generatedName').get(function() {
  let className = `${this.level} ${this.section}`;
  if (this.specialty && this.specialty !== '') {
    className += ` (${this.specialty})`;
  }
  return className;
});

// Pre-save middleware to auto-generate name if not provided
classSchema.pre('save', function(next) {
  if (!this.name || this.isModified('level') || this.isModified('section') || this.isModified('specialty')) {
    this.name = this.generatedName;
  }
  
  // Auto-calculate current students from studentList
  if (this.studentList && this.isModified('studentList')) {
    this.currentStudents = this.studentList.length;
  }
  
  next();
});

// Index for efficient queries
classSchema.index({ school: 1, year: 1, level: 1 });
classSchema.index({ school: 1, educationSystem: 1 });
classSchema.index({ school: 1, status: 1 });
classSchema.index({ school: 1, mainTeacher: 1 });

// Composite index to ensure uniqueness of class within the school and academic year
classSchema.index({ school: 1, name: 1, year: 1 }, { unique: true });

// Static method to validate level-system compatibility
classSchema.statics.validateLevelSystem = function(level, system) {
  const francophoneLevels = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'];
  const anglophoneLevels = ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'];
  
  if (system === 'francophone' && !francophoneLevels.includes(level)) {
    return false;
  }
  if (system === 'anglophone' && !anglophoneLevels.includes(level)) {
    return false;
  }
  return true;
};

// Method to refresh subjects based on level and system
classSchema.methods.refreshSubjects = async function() {
  const Subject = mongoose.model('Subject');
  
  // Find subjects that match this class's level and education system
  const matchingSubjects = await Subject.find({
    levels: this.level,
    educationSystem: this.educationSystem,
    isActive: true
  });
  
  // Update the subjects array
  this.subjects = matchingSubjects.map(subject => subject._id);
  
  // Update subjectDetails with coefficients
  this.subjectDetails = matchingSubjects.map(subject => ({
    subject: subject._id,
    coefficient: subject.coefficient || 1,
    weeklyHours: subject.weeklyHours || 4,
    isActive: true
  }));
  
  return this.save();
};

// Static method for bulk class creation
classSchema.statics.bulkCreate = async function(classesData, schoolId, createdBy) {
  const classesWithSchool = classesData.map(classData => ({
    ...classData,
    school: schoolId,
    createdBy: createdBy
  }));
  
  return this.insertMany(classesWithSchool, { ordered: false });
};

const Classes = mongoose.model('Classes', classSchema);
export default Classes;