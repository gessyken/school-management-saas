import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure subjectCode is unique per school
subjectSchema.index({ school: 1, subjectCode: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
