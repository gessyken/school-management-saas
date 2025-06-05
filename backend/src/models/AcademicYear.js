import mongoose from 'mongoose';

// Define subject schema
const subjectSchema = new mongoose.Schema({
    subjectInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    isActive: { type: Boolean, default: true },
    marks: {
        currentMark: { type: Number, default: 0, min: 0, max: 20 },
        isActive: { type: Boolean, default: true },
        modified: [{
            preMark: { type: Number, required: true, min: 0, max: 20 },
            modMark: { type: Number, required: true, min: 0, max: 20 },
            modifiedBy: {
                name: { type: String, required: true },
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
            },
            dateModified: { type: Date, default: Date.now }
        }]
    },
});

// Define sequence schema
const sequenceSchema = new mongoose.Schema({
    sequenceInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sequence',
        required: true
    },
    isActive: { type: Boolean, default: true },
    average: { type: Number, default: 0, min: 0, max: 20 },
    rank: { type: Number, default: null },
    absences: { type: Number, default: 0, min: 0, max: 20 },
    subjects: { 
        type: [subjectSchema], 
        required: true 
    },
});

// Define term schema
const termSchema = new mongoose.Schema({
    termInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Term',
        required: true
    },
    average: { type: Number, default: 0, min: 0, max: 20 },
    rank: { type: Number, default: null },
    sequences: { 
        type: [sequenceSchema], 
        required: true 
    },
    discipline: { type: String, enum: ['Excellent', 'Good', 'Average', 'Poor'], default: 'Good' }
});

// Define fee schema
const feeSchema = new mongoose.Schema({
    billID: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
    },
    date: { type: Date }
});

// Define academic year schema
const academicYearSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    year: {
        type: String,
        required: false,
        unique: false,
        match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
        trim: true
    },
    classes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classes',
    },
    hasRepeated: { type: Boolean, default: false },
    hasCompleted: { type: Boolean, default: false },
    terms: { 
        type: [termSchema], 
        required: true 
    },
    fees: { 
        type: [feeSchema], 
        required: true 
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create indexes for academic year schema
academicYearSchema.index({ student: 1, year: 1 }, { unique: true }); 
academicYearSchema.index({ year: 1 });
academicYearSchema.index({ hasCompleted: 1 });
academicYearSchema.index({ "terms.average": 1 });

// Virtual field for calculating overall average across all terms
academicYearSchema.virtual('overallAverage').get(function() {
    if (!this.terms || this.terms.length === 0) return 0;
    
    const sum = this.terms.reduce((total, term) => {
        return total + (term.average || 0);
    }, 0);
    
    return parseFloat((sum / this.terms.length).toFixed(2));
});

// Virtual field for calculating total fees paid
academicYearSchema.virtual('totalFeesPaid').get(function() {
    if (!this.fees || this.fees.length === 0) return 0;
    
    return this.fees.reduce((total, fee) => {
        return total + (fee.amount || 0);
    }, 0);
});

// Virtual field for calculating overall rank based on average
academicYearSchema.virtual('overallStatus').get(function() {
    const average = this.overallAverage;
    
    if (average >= 16) return 'Excellent';
    if (average >= 14) return 'Very Good';
    if (average >= 12) return 'Good';
    if (average >= 10) return 'Average';
    return 'Below Average';
});

// Virtual field for checking if student has any failing subjects
academicYearSchema.virtual('hasFailingSubjects').get(function() {
    if (!this.terms || this.terms.length === 0) return false;
    
    return this.terms.some(term => {
        if (!term.sequences || term.sequences.length === 0) return false;
        
        return term.sequences.some(sequence => {
            if (!sequence.subjects || sequence.subjects.length === 0) return false;
            
            return sequence.subjects.some(subject => {
                return subject.marks.currentMark < 10; // Assuming 10 is passing mark
            });
        });
    });
});

// Method to calculate and update all averages in the academic year
academicYearSchema.methods.calculateAverages = async function() {
    // Calculate subject averages within each sequence
    if (this.terms && this.terms.length > 0) {
        this.terms.forEach(term => {
            if (term.sequences && term.sequences.length > 0) {
                term.sequences.forEach(sequence => {
                    if (sequence.subjects && sequence.subjects.length > 0) {
                        let totalMarks = 0;
                        let validSubjects = 0;
                        
                        sequence.subjects.forEach(subject => {
                            if (subject.isActive && subject.marks.isActive) {
                                totalMarks += subject.marks.currentMark;
                                validSubjects++;
                            }
                        });
                        
                        sequence.average = validSubjects > 0 ? 
                            parseFloat((totalMarks / validSubjects).toFixed(2)) : 0;
                    }
                });
                
                // Calculate term average from sequences
                let totalSequenceAvg = 0;
                let validSequences = 0;
                
                term.sequences.forEach(sequence => {
                    if (sequence.isActive) {
                        totalSequenceAvg += sequence.average;
                        validSequences++;
                    }
                });
                
                term.average = validSequences > 0 ? 
                    parseFloat((totalSequenceAvg / validSequences).toFixed(2)) : 0;
            }
        });
    }
    
    return this.save();
};

// Method to update a student's mark for a specific subject
academicYearSchema.methods.updateMark = async function(termIndex, sequenceIndex, subjectIndex, newMark, modifiedBy) {
    if (!this.terms[termIndex] || 
        !this.terms[termIndex].sequences[sequenceIndex] ||
        !this.terms[termIndex].sequences[sequenceIndex].subjects[subjectIndex]) {
        throw new Error('Invalid indices provided');
    }
    
    const subject = this.terms[termIndex].sequences[sequenceIndex].subjects[subjectIndex];
    const preMark = subject.marks.currentMark;
    
    // Add to modification history
    subject.marks.modified.push({
        preMark: preMark,
        modMark: newMark,
        modifiedBy: modifiedBy,
        dateModified: new Date()
    });
    
    // Update current mark
    subject.marks.currentMark = newMark;
    
    // Recalculate averages
    await this.calculateAverages();
    
    return this;
};

// Method to add a new fee record
academicYearSchema.methods.addFee = async function(feeData) {
    this.fees.push(feeData);
    return this.save();
};

// Method to check if student has passed the academic year
academicYearSchema.methods.checkYearCompletion = async function() {
    const passingAverage = 10; // Assuming 10 is passing average
    
    // Check if all terms have passing averages
    const alltermsPassed = this.terms.every(term => term.average >= passingAverage);
    
    // Check if there are no failing core subjects (could be enhanced with subject importance)
    const noFailingCoreSubjects = !this.hasFailingSubjects;
    
    this.hasCompleted = alltermsPassed && noFailingCoreSubjects;
    return this.save();
};

// Static method to find students at risk (with low averages)
academicYearSchema.statics.findStudentsAtRisk = async function(year, threshold = 10) {
    return this.find({
        year: year,
        $or: [
            { 'terms.average': { $lt: threshold } },
            { hasFailingSubjects: true }
        ]
    }).populate('student');
};

// Create AcademicYear model
const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
export default AcademicYear;