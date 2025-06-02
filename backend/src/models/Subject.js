import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        unique: true,
        trim: true
    },
    subjectName: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true // Marks if the department is still active
    },
}, {
    timestamps: true
});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;