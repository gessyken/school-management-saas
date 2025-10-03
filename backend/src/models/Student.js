import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  // School reference (multi-tenancy)
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },

  // Student identification
  matricule: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // Personal information
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  birthPlace: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    trim: true,
    default: 'Cameroonian'
  },

  // Contact information (compatible with frontend)
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[0-9]{7,15}$/, 'Invalid phone number format']
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },

  // Parent/Guardian information (compatible with frontend)
  parentName: {
    type: String,
    required: true,
    trim: true
  },
  parentEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  parentPhone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[0-9]{7,15}$/, 'Invalid phone number format']
  },
  parentOccupation: {
    type: String,
    trim: true
  },
  parentAddress: {
    type: String,
    trim: true
  },

  // Academic information
  level: {
    type: String,
    enum: ['6ème', '5ème', '4ème', '3ème',
      '2nde', '1ère', 'Terminale',
      'Form 1', 'Form 2', 'Form 3',
      'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'
    ],
    required: true
  },

  // Class assignment (links to your Classes model)
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classes',
    index: true
  },

  // Enrollment information
  enrollmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  enrollmentYear: {
    type: String,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    required: true
  },

  // Academic status (compatible with frontend)
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'transferred', 'suspended', 'withdrawn'],
    default: 'active'
  },
  academicStatus: {
    type: String,
    enum: ['regular', 'repeating', 'advanced'],
    default: 'regular'
  },

  // Academic performance (compatible with frontend)
  average: {
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

  // Medical information
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
  },
  allergies: [{
    type: String,
    trim: true
  }],
  medicalConditions: [{
    type: String,
    trim: true
  }],
  emergencyContact: {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Invalid phone number']
    }
  },

  // Documents and files
  profilePicture: {
    type: String,
    default: ''
  },
  avatar: {
    type: String // Alternative field name for frontend compatibility
  },

  // Academic history
  academicYears: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
  }],

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
    transform: function (doc, ret) {
      // Frontend-compatible fields
      ret.name = `${ret.firstName} ${ret.lastName}`;
      ret.phone = ret.phone || '';
      ret.address = ret.address || '';
      ret.avatar = ret.avatar || ret.profilePicture || '';
      ret.parentName = ret.parentName || '';
      ret.parentPhone = ret.parentPhone || '';
      ret.parentEmail = ret.parentEmail || '';
      ret.birthDate = ret.dateOfBirth;

      // Class information for frontend
      if (ret.class && typeof ret.class === 'object') {
        ret.className = ret.class.name;
        ret.classLevel = ret.class.level;
        ret.classSection = ret.class.section;
      } else {
        ret.className = 'Non assigné';
      }

      return ret;
    }
  }
});

// Virtual for full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age calculation
studentSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

// Indexes for efficient queries
studentSchema.index({ school: 1, matricule: 1 }, { unique: true });
studentSchema.index({ school: 1, email: 1 }, { unique: true });
studentSchema.index({ school: 1, class: 1 });
studentSchema.index({ school: 1, status: 1 });
studentSchema.index({ school: 1, level: 1 });
studentSchema.index({ school: 1, lastName: 1, firstName: 1 });
studentSchema.index({ school: 1, enrollmentYear: 1 });

// Pre-save middleware to generate matricule if not provided
studentSchema.pre('save', async function (next) {
  if (!this.matricule) {
    const School = mongoose.model('School');
    const school = await School.findById(this.school);
    const schoolCode = school?.code || 'SCH';

    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);

    this.matricule = `${schoolCode}${year}${random}`;
  }

  // Set enrollment year if not provided
  if (!this.enrollmentYear) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    this.enrollmentYear = month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  // Ensure avatar field is populated
  if (!this.avatar && this.profilePicture) {
    this.avatar = this.profilePicture;
  }

  next();
});

// Post-save middleware to update class student count
studentSchema.post('save', async function () {
  if (this.class) {
    const Classes = mongoose.model('Classes');
    const studentCount = await Student.countDocuments({
      class: this.class,
      status: 'active'
    });

    await Classes.findByIdAndUpdate(this.class, {
      currentStudents: studentCount
    });
  }
});

// Post-remove middleware to update class student count
studentSchema.post('findOneAndDelete', async function (doc) {
  if (doc && doc.class) {
    const Classes = mongoose.model('Classes');
    const Student = mongoose.model('Student');

    const studentCount = await Student.countDocuments({
      class: doc.class,
      status: 'active'
    });

    await Classes.findByIdAndUpdate(doc.class, {
      currentStudents: studentCount
    });
  }
});

// Static method for bulk student creation
studentSchema.statics.bulkCreate = async function (studentsData, schoolId, createdBy) {
  const studentsWithSchool = studentsData.map(studentData => ({
    ...studentData,
    school: schoolId,
    createdBy: createdBy
  }));

  return this.insertMany(studentsWithSchool, { ordered: false });
};

// Static method to find by matricule within school
studentSchema.statics.findByMatricule = function (schoolId, matricule) {
  return this.findOne({ school: schoolId, matricule });
};

// Static method to find by email within school
studentSchema.statics.findByEmail = function (schoolId, email) {
  return this.findOne({ school: schoolId, email });
};

// Method to get academic summary
studentSchema.methods.getAcademicSummary = async function () {
  const AcademicYear = mongoose.model('AcademicYear');
  const academicYears = await AcademicYear.find({ student: this._id })
    .populate('class')
    .sort({ year: -1 });

  return {
    currentClass: this.class,
    academicHistory: academicYears,
    overallAverage: this.average,
    attendanceRate: this.attendanceRate
  };
};

const Student = mongoose.model('Student', studentSchema);
export default Student;