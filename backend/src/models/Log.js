import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ERROR', 'VIEW', 'PAYMENT'],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  module: {
    type: String,
    required: true,
    trim: true,
    // enum: ['Student', 'Teacher', 'AcademicYear', 'Fee', 'Class', 'Sequence', 'Subject', 'System', 'Auth']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // optional for system logs or unauthenticated access
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  metadata: {
    type: Object, // Additional context for the log (optional)
    default: {}
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
}, {
  timestamps: true // adds createdAt and updatedAt
});

const Log = mongoose.model('Log', logSchema);
export default Log;
