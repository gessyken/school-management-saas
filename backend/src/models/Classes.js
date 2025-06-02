import mongoose from 'mongoose';

const classesSchema = new mongoose.Schema({
    classesName: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
    },
    capacity: {
        type: Number,
    },
    amountFee: {
        type: Number,
    },
    subjects: [{
        subjectInfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        coefficient: { type: Number, default: 0, min: 0, max: 100 },
        teacherInfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    },{_id:false}],
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
        required: false,
        unique: false,
        match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
        trim: true
    },
}, {
    timestamps: true
});



const Classes = mongoose.model('Classes', classesSchema);

export default Classes;