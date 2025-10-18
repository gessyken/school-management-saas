// models/Subject.js
import mongoose from 'mongoose';

const coefficientSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0.5,
    max: 10
  }
});

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  year: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
  },
  code: {
    type: String,
    required: true,
    // unique: true,
    uppercase: true,
    trim: true,
    maxlength: 10
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  coefficients: [coefficientSchema],
  weeklyHours: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
    default: 4
  },
  // Main teacher reference
  mainTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    trim: true,
    default: null
  },
  // Additional teachers
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  levels: [{
    type: String,
    enum: [
      '6ème', '5ème', '4ème', '3ème',
      '2nde', '1ère', 'Terminale',
      'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5',
      'Lower Sixth', 'Upper Sixth'
    ]
  }],
  educationSystem: {
    type: String,
    enum: ['francophone', 'anglophone', 'bilingue', 'both'],
    default: 'bilingue'
  },
  specialties: [{
    type: String,
    enum: [
      // Francophone specialties
      'A','B', 'C', 'D', 'E','F', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3', 'TI',
      // Anglophone specialties
      'Arts', 'Commercial', 'Industrial', 'Science',
      'GCE A-Level Arts', 'GCE A-Level Science'
    ]
  }],
  isRequired: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: /^#[0-9A-F]{6}$/i
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      // Remove the virtuals from the JSON output if not needed
      delete ret.allTeachers;
      delete ret.teacherNames;
      
      // Add frontend-compatible fields dynamically
      ret.teacher = ret.mainTeacher?.name || 'Non assigné';
      ret.level = ret.levels || [];
      ret.specialty = ret.specialties || [];
      ret.required = ret.isRequired || false;
      ret.coefficient = doc.getBaseCoefficient(); // Use the method to get base coefficient
      
      return ret;
    }
  }
});

// Index for efficient queries
subjectSchema.index({ school: 1, code: 1 ,year: 1}, { unique: true });
subjectSchema.index({ school: 1, name: 1 });
subjectSchema.index({ school: 1, isActive: 1 });
subjectSchema.index({ school: 1, levels: 1 });
subjectSchema.index({ school: 1, year: 1 }); // Added year index

// Virtual for getting all teachers (main + additional)
subjectSchema.virtual('allTeachers').get(function () {
  const teachers = [];
  if (this.mainTeacher) {
    teachers.push(this.mainTeacher);
  }
  if (this.teachers && this.teachers.length > 0) {
    teachers.push(...this.teachers);
  }
  return [...new Set(teachers)];
});

// Virtual to get teacher names for frontend
subjectSchema.virtual('teacherNames').get(function () {
  const teachers = [];
  if (this.mainTeacher && typeof this.mainTeacher === 'object') {
    teachers.push(this.mainTeacher.name);
  }
  if (this.teachers && this.teachers.length > 0) {
    this.teachers.forEach(teacher => {
      if (teacher && typeof teacher === 'object') {
        teachers.push(teacher.name);
      }
    });
  }
  return teachers;
});

// Method to get base coefficient (fallback logic)
subjectSchema.methods.getBaseCoefficient = function () {
  if (this.coefficients && this.coefficients.length > 0) {
    // Return the first coefficient value as base, or average if multiple
    return this.coefficients[0].value;
  }
  return 1; // Default base coefficient
};

// Method to get coefficient for a specific level/specialty
subjectSchema.methods.getCoefficient = function (level, specialty = null) {
  // First check coefficients array for exact match
  const specificCoefficient = this.coefficients.find(
    coeff => coeff.level === level && coeff.specialty === specialty
  );

  if (specificCoefficient) {
    return specificCoefficient.value;
  }

  // Then check for level-only coefficient
  const levelCoefficient = this.coefficients.find(
    coeff => coeff.level === level && !coeff.specialty
  );

  return levelCoefficient ? levelCoefficient.value : this.getBaseCoefficient();
};

// Static method to validate level-system compatibility
subjectSchema.statics.validateLevelSystem = function (level, system) {
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

// Static method for frontend data normalization
subjectSchema.statics.normalizeForFrontend = function (subject) {
  if (!subject) return null;

  const normalized = subject.toObject ? subject.toObject() : { ...subject };

  // Add frontend-compatible fields
  normalized.teacher = normalized.mainTeacher?.name || 'Non assigné';
  normalized.level = normalized.levels || [];
  normalized.specialty = normalized.specialties || [];
  normalized.required = normalized.isRequired || false;
  normalized.coefficient = subject.getBaseCoefficient ? subject.getBaseCoefficient() : 1;

  return normalized;
};


const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;