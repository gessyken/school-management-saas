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
    baseCoefficient: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 10
    },
    coefficientsByLevel: {
      type: Map,
      of: Number,
      default: new Map()
    },
    weeklyHours: {
      type: Number,
      default: 2,
      min: 1,
      max: 10
    },
    teachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: undefined
    }],
    levels: {
      type: [String],
      enum: [
        // Francophone levels
        '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale',
        // Anglophone levels
        'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth',
        // Général (pour toutes les classes)
        'Général'
      ],
      default: ['Général']
    },
    educationSystem: {
      type: String,
      enum: ['francophone', 'anglophone', 'both'],
      default: 'both'
    },
    specialty: {
      type: [String],
      default: []
    },
    required: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: '#3B82F6'
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
