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

// studentSchema.pre('save', async function (next) {
//     if (this.classInfo) {
//         try {
//             const Classes = mongoose.model('Classes');
//             const classInfo = await Classes.findById(this.classInfo);
//             if (classInfo) {
//                 if (!classInfo.studentList)
//                     classInfo.studentList = []

//                 if (!classInfo.studentList.includes(this._id)) {
//                     classInfo.studentList.push(this._id);
//                     await classInfo.save();
//                 }
//             }
//         } catch (error) {
//             return next(error);
//         }
//     }
//     next();
// });

const Student = mongoose.model('Student', studentSchema);
export default Student;
