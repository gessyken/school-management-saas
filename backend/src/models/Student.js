import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  matricule: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
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
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  level: {
    type: String,
    enum: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'],
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[0-9]{7,15}$/, 'Invalid phone number format']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  emergencyContact: {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Invalid phone number']
    }
  },

  // **Add reference to the School the student belongs to**
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },

  // Academic Info
  academicYears: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
  }],
  classInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classes',
  },
  profilePicture: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'graduated', 'withdrawn'],
    default: 'active'
  }

}, { timestamps: true });

// Optional: You can add indexes for common queries like by school and matricule
studentSchema.index({ school: 1, matricule: 1 }, { unique: true });
studentSchema.index({ school: 1, email: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
