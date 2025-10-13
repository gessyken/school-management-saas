import mongoose from 'mongoose';

// Utility function with correct spelling
const getDiscipline = (average) => {
    if (average >= 16) return 'Excellent';
    if (average >= 14) return 'Very Good';
    if (average >= 12) return 'Good';
    if (average >= 10) return 'Average';
    return 'Below Average';
};

// Define subject schema with enhanced validation
const subjectSchema = new mongoose.Schema({
    subjectInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    discipline: {
        type: String,
        enum: ['Excellent', 'Very Good', 'Good', 'Average', 'Below Average', 'Not Available'],
        default: 'Not Available'
    },
    rank: {
        type: Number,
        default: null,
        min: 1
    },
    marks: {
        currentMark: {
            type: Number,
            default: 0,
            min: 0,
            max: 20,
            validate: {
                validator: Number.isFinite,
                message: 'Mark must be a valid number'
            }
        },
        isActive: {
            type: Boolean,
            default: true
        },
        modified: [{
            preMark: {
                type: Number,
                required: true,
                min: 0,
                max: 20
            },
            modMark: {
                type: Number,
                required: true,
                min: 0,
                max: 20
            },
            modifiedBy: {
                name: {
                    type: String,
                    required: true,
                    trim: true
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                }
            },
            dateModified: {
                type: Date,
                default: Date.now
            },
            reason: {
                type: String,
                trim: true,
                maxlength: 200
            }
        }]
    },
}, {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Define sequence schema with enhanced validation
const sequenceSchema = new mongoose.Schema({
    sequenceInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sequence',
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    average: {
        type: Number,
        default: 0,
        min: 0,
        max: 20,
        validate: {
            validator: Number.isFinite,
            message: 'Average must be a valid number'
        }
    },
    rank: {
        type: Number,
        default: null,
        min: 1
    },
    absences: {
        type: Number,
        default: 0,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Absences must be an integer'
        }
    },
    subjects: {
        type: [subjectSchema],
        required: true,
        validate: {
            validator: function (subjects) {
                // Validate unique subjects within sequence
                const subjectIds = subjects.map(s => s.subjectInfo?.toString());
                return new Set(subjectIds).size === subjectIds.length;
            },
            message: 'Duplicate subjects in sequence'
        }
    },
    discipline: {
        type: String,
        enum: ['Excellent', 'Very Good', 'Good', 'Average', 'Below Average', 'Not Available'],
        default: 'Not Available'
    },
}, {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Define term schema with enhanced validation
const termSchema = new mongoose.Schema({
    termInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Term',
        required: true,
        index: true
    },
    average: {
        type: Number,
        default: 0,
        min: 0,
        max: 20,
        validate: {
            validator: Number.isFinite,
            message: 'Average must be a valid number'
        }
    },
    rank: {
        type: Number,
        default: null,
        min: 1
    },
    sequences: {
        type: [sequenceSchema],
        required: true,
        validate: {
            validator: function (sequences) {
                // Validate unique sequences within term
                const sequenceIds = sequences.map(s => s.sequenceInfo?.toString());
                return new Set(sequenceIds).size === sequenceIds.length;
            },
            message: 'Duplicate sequences in term'
        }
    },
    discipline: {
        type: String,
        enum: ['Excellent', 'Very Good', 'Good', 'Average', 'Below Average', 'Not Available'],
        default: 'Not Available'
    },
}, {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Define fee schema with enhanced validation
const feeSchema = new mongoose.Schema({
    billID: {
        type: String,
        trim: true,
        required: true,
        uppercase: true,
        match: [/^[A-Z0-9_-]+$/, 'Bill ID can only contain letters, numbers, hyphens, and underscores']
    },
    type: {
        type: String,
        trim: true,
        required: true,
        enum: ['Tuition', 'Books', 'Uniform', 'Transport', 'Other'],
        default: 'Tuition'
    },
    paymentMethod: {
        type: String,
        trim: true,
        required: true,
        enum: ['Cash', 'Bank Transfer', 'Mobile Money', 'Check', 'Credit Card'],
        default: 'Cash'
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isFinite,
            message: 'Amount must be a valid number'
        }
    },
    paymentDate: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function (date) {
                return date <= new Date();
            },
            message: 'Payment date cannot be in the future'
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Completed'
    },
    reference: {
        type: String,
        trim: true,
        uppercase: true
    }
}, {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Define academic year schema
const academicYearSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    year: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
        trim: true,
        index: true
    },
    classes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classes',
        required: true,
        index: true
    },
    hasRepeated: {
        type: Boolean,
        default: false
    },
    hasCompleted: {
        type: Boolean,
        default: false
    },
    terms: {
        type: [termSchema],
        required: true,
        validate: {
            validator: function (terms) {
                // Validate unique terms within academic year
                const termIds = terms.map(t => t.termInfo?.toString());
                return new Set(termIds).size === termIds.length;
            },
            message: 'Duplicate terms in academic year'
        }
    },
    fees: {
        type: [feeSchema],
        default: []
    },
    rank: {
        type: Number,
        default: null,
        min: 1
    },
    // Additional metadata
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Withdrawn', 'Suspended'],
        default: 'Active'
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    completionDate: {
        type: Date
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 1000
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Enhanced validation for fees
academicYearSchema.path('fees').validate(function (fees) {
    const billIDs = fees.map(f => f.billID);
    const uniqueBillIDs = new Set(billIDs);
    return billIDs.length === uniqueBillIDs.size;
}, 'Duplicate billID found in fees');

// Create indexes for optimal query performance
academicYearSchema.index({ student: 1, year: 1, school: 1 }, { unique: true });
academicYearSchema.index({ classes: 1, year: 1 });
academicYearSchema.index({ school: 1, year: 1, status: 1 });
academicYearSchema.index({ 'terms.termInfo': 1 });
academicYearSchema.index({ 'terms.sequences.sequenceInfo': 1 });
academicYearSchema.index({ 'terms.sequences.subjects.subjectInfo': 1 });
academicYearSchema.index({ hasCompleted: 1 });
academicYearSchema.index({ hasRepeated: 1 });
academicYearSchema.index({ 'fees.billID': 1 });

// Virtual field for calculating overall average across all terms
academicYearSchema.virtual('overallAverage').get(function () {
    if (!this.terms || this.terms.length === 0) return 0;

    const activeTerms = this.terms.filter(term => {
        const activeSequences = term.sequences?.filter(seq => seq.isActive) || [];
        return activeSequences.length > 0;
    });

    if (activeTerms.length === 0) return 0;

    const sum = activeTerms.reduce((total, term) => total + (term.average || 0), 0);
    return parseFloat((sum / activeTerms.length).toFixed(2));
});
academicYearSchema.virtual('overallAbsences').get(function () {
    if (!this.terms || this.terms.length === 0) return 0;

    let totalAbsences = 0;
    let totalSequences = 0;

    this.terms.forEach(term => {
        const activeSequences = term.sequences?.filter(seq =>
            seq.isActive && typeof seq.absences === 'number'
        ) || [];

        activeSequences.forEach(seq => {
            totalAbsences += seq.absences;
            totalSequences++;
        });
    });

    // if (totalSequences === 0) return 0;

    return totalAbsences;
});
// Virtual field for calculating total fees paid
academicYearSchema.virtual('totalFeesPaid').get(function () {
    if (!this.fees || this.fees.length === 0) return 0;

    return this.fees.reduce((total, fee) => {
        return fee.status === 'Completed' ? total + (fee.amount || 0) : total;
    }, 0);
});

// Virtual field for calculating overall status
academicYearSchema.virtual('overallStatus').get(function () {
    return getDiscipline(this.overallAverage);
});

// Virtual field for checking if student has any failing subjects
academicYearSchema.virtual('hasFailingSubjects').get(function () {
    if (!this.terms || this.terms.length === 0) return false;

    for (const term of this.terms) {
        if (!term.sequences || term.sequences.length === 0) continue;

        for (const sequence of term.sequences) {
            if (!sequence.subjects || sequence.subjects.length === 0) continue;

            for (const subject of sequence.subjects) {
                if (subject.isActive && subject.marks.isActive && subject.marks.currentMark < 10) {
                    return true;
                }
            }
        }
    }
    return false;
});

// Virtual for active subjects count
academicYearSchema.virtual('activeSubjectsCount').get(function () {
    let count = 0;
    for (const term of this.terms) {
        for (const sequence of term.sequences) {
            for (const subject of sequence.subjects) {
                if (subject.isActive && subject.marks.isActive) {
                    count++;
                }
            }
        }
    }
    return count;
});

// Pre-save middleware to ensure data consistency
academicYearSchema.pre('save', function (next) {
    // Auto-update completion status
    if (this.overallAverage >= 10 && !this.hasFailingSubjects) {
        this.hasCompleted = true;
        if (!this.completionDate) {
            this.completionDate = new Date();
        }
    }

    // Update overall status
    if (this.hasCompleted && this.status === 'Active') {
        this.status = 'Completed';
    }

    next();
});

// Optimized method to calculate and update all averages
academicYearSchema.methods.calculateAverages = async function () {
    const Classes = mongoose.model('Classes');
    const classDetail = await Classes.findById(this.classes).populate('subjects');

    if (!classDetail) {
        throw new Error('Class not found');
    }

    // Create a map for quick subject coefficient lookup
    const subjectCoefficientMap = new Map();
    classDetail.subjects.forEach(subject => {
        subjectCoefficientMap.set(subject._id.toString(), subject.coefficient || 1);
    });

    // Calculate averages using optimized loops
    for (const term of this.terms) {
        let termTotal = 0;
        let termCount = 0;

        for (const sequence of term.sequences) {
            if (!sequence.isActive) continue;

            let sequenceTotal = 0;
            let sequenceCoefficientSum = 0;

            for (const subject of sequence.subjects) {
                if (!subject.isActive || !subject.marks.isActive) continue;

                const coefficient = subjectCoefficientMap.get(subject.subjectInfo.toString()) || 1;
                sequenceTotal += subject.marks.currentMark * coefficient;
                sequenceCoefficientSum += coefficient;
            }

            sequence.average = sequenceCoefficientSum > 0 ?
                parseFloat((sequenceTotal / sequenceCoefficientSum).toFixed(2)) : 0;
            sequence.discipline = getDiscipline(sequence.average);

            if (sequence.average > 0) {
                termTotal += sequence.average;
                termCount++;
            }
        }

        term.average = termCount > 0 ?
            parseFloat((termTotal / termCount).toFixed(2)) : 0;
        term.discipline = getDiscipline(term.average);
    }

    return this.save();
};

// find all ranks
academicYearSchema.statics.calculateAllRanks = async function (classId, year, termId, sequenceId, subjectId) {
    const academicYears = await this.find({ classes: classId, year });

    // Arrays to hold marks/averages for ranking
    const subjectMarks = [];
    const sequenceAverages = [];
    const termAverages = [];
    const academicAverages = [];

    for (const student of academicYears) {
        // Academic overall average
        academicAverages.push({
            studentId: student._id.toString(),
            average: student.overallAverage || 0
        });

        const term = student.terms.find(t => t.termInfo.toString() === termId.toString());
        if (!term) continue;

        // Term average
        termAverages.push({
            studentId: student._id.toString(),
            average: term.average || 0
        });

        const sequence = term.sequences.find(s => s.sequenceInfo.toString() === sequenceId.toString());
        if (!sequence || !sequence.isActive) continue;

        // Sequence average
        sequenceAverages.push({
            studentId: student._id.toString(),
            average: sequence.average || 0
        });

        const subject = sequence.subjects.find(s => s.subjectInfo.toString() === subjectId.toString());
        if (!subject || !subject.isActive || !subject.marks.isActive) continue;

        // Subject mark
        subjectMarks.push({
            studentId: student._id.toString(),
            mark: subject.marks.currentMark || 0
        });
    }

    // Utility function to assign ranks with tie support
    function assignRanks(arr, keyName, rankField, findStudentFn) {
        arr.sort((a, b) => b[keyName] - a[keyName]);
        let currentRank = 1;
        for (let i = 0; i < arr.length; i++) {
            if (i > 0 && arr[i][keyName] < arr[i - 1][keyName]) {
                currentRank = i + 1;
            }
            const studentDoc = findStudentFn(arr[i].studentId);
            if (!studentDoc) continue;

            // Assign rank to correct nested path
            if (rankField === 'subjectRank') {
                const term = studentDoc.terms.find(t => t.termInfo.toString() === termId.toString());
                if (!term) continue;
                const sequence = term.sequences.find(s => s.sequenceInfo.toString() === sequenceId.toString());
                if (!sequence) continue;
                const subject = sequence.subjects.find(s => s.subjectInfo.toString() === subjectId.toString());
                if (!subject) continue;

                subject.rank = currentRank;
            } else if (rankField === 'sequenceRank') {
                const term = studentDoc.terms.find(t => t.termInfo.toString() === termId.toString());
                if (!term) continue;
                const sequence = term.sequences.find(s => s.sequenceInfo.toString() === sequenceId.toString());
                if (!sequence) continue;

                sequence.rank = currentRank;
            } else if (rankField === 'termRank') {
                const term = studentDoc.terms.find(t => t.termInfo.toString() === termId.toString());
                if (!term) continue;

                term.rank = currentRank;
            } else if (rankField === 'academicRank') {
                studentDoc.rank = currentRank;
            }
        }
    }

    // Helper to find student document by string id
    const findStudentById = (id) => academicYears.find(s => s._id.toString() === id);

    // Assign ranks
    assignRanks(subjectMarks, 'mark', 'subjectRank', findStudentById);
    assignRanks(sequenceAverages, 'average', 'sequenceRank', findStudentById);
    assignRanks(termAverages, 'average', 'termRank', findStudentById);
    assignRanks(academicAverages, 'average', 'academicRank', findStudentById);

    // Save all updated documents at once
    await Promise.all(academicYears.map(s => s.save()));

    return {
        subjectRanks: subjectMarks,
        sequenceRanks: sequenceAverages,
        termRanks: termAverages,
        academicRanks: academicAverages,
    };
};

// Enhanced method to update a student's mark
academicYearSchema.methods.updateMark = async function (termInfo, sequenceInfo, subjectInfo, newMark, modifiedBy, reason = '') {
    // Validate inputs
    if (!termInfo || !sequenceInfo || !subjectInfo || newMark == null || !modifiedBy) {
        throw new Error('Missing required parameters: termInfo, sequenceInfo, subjectInfo, newMark, modifiedBy');
    }

    if (subjectInfo === 'absences') {
        // For absences, convert to integer and validate
        newMark = parseInt(newMark);
        if (isNaN(newMark) || newMark < 0) {
            throw new Error('Absences must be a positive integer');
        }
    } else {
        // For regular subjects, validate mark between 0 and 20
        if (newMark < 0 || newMark > 20) {
            throw new Error('Mark must be between 0 and 20');
        }
    }

    try {
        // Find or create term
        let term = this.terms.find(t => t.termInfo.toString() === termInfo.toString());
        if (!term) {
            term = { termInfo, sequences: [] };
            this.terms.push(term);
        }

        // Find or create sequence
        let sequence = term.sequences.find(s => s.sequenceInfo.toString() === sequenceInfo.toString());
        if (!sequence) {
            sequence = { sequenceInfo, subjects: [], isActive: true };
            term.sequences.push(sequence);
        }

        if (!sequence.isActive) {
            throw new Error('Sequence is not active');
        }

        if (subjectInfo === "absences") {
            sequence.absences = newMark;
        } else {
            // Find or create subject
            let subject = sequence.subjects.find(s => s.subjectInfo.toString() === subjectInfo.toString());
            if (!subject) {
                subject = {
                    subjectInfo,
                    isActive: true,
                    marks: { currentMark: 0, isActive: true, modified: [] }
                };
                sequence.subjects.push(subject);
            }

            const preMark = subject.marks.currentMark;

            // Add to modification history
            subject.marks.modified.push({
                preMark,
                modMark: newMark,
                modifiedBy,
                dateModified: new Date(),
                reason
            });

            // Update current mark
            subject.marks.currentMark = newMark;
            subject.discipline = getDiscipline(newMark);
        }

        // Recalculate averages
        await this.calculateAverages();

    } catch (error) {
        throw new Error(`Failed to update mark: ${error.message}`);
    }

    return this;
};

// Optimized rank calculation methods
academicYearSchema.statics.calculateRanksForClassYear = async function (classId, year) {
    const academicYears = await this.find({
        classes: classId,
        year
    }).populate('student', 'name');

    if (academicYears.length === 0) {
        return { message: 'No students found for ranking' };
    }

    // Create maps for efficient data organization
    const academicRanks = [];
    const termRanksMap = new Map();
    const sequenceRanksMap = new Map();
    const subjectRanksMap = new Map();

    // Single pass to collect all data
    academicYears.forEach(student => {
        // Academic rank data
        academicRanks.push({
            studentId: student._id.toString(),
            studentName: student.student?.name,
            average: student.overallAverage || 0
        });

        // Term, sequence, and subject data
        student.terms.forEach(term => {
            const termKey = term.termInfo.toString();

            if (!termRanksMap.has(termKey)) {
                termRanksMap.set(termKey, []);
            }
            termRanksMap.get(termKey).push({
                studentId: student._id.toString(),
                average: term.average || 0
            });

            term.sequences.forEach(sequence => {
                if (!sequence.isActive) return;

                const seqKey = `${termKey}_${sequence.sequenceInfo.toString()}`;

                if (!sequenceRanksMap.has(seqKey)) {
                    sequenceRanksMap.set(seqKey, []);
                }
                sequenceRanksMap.get(seqKey).push({
                    studentId: student._id.toString(),
                    average: sequence.average || 0
                });

                sequence.subjects.forEach(subject => {
                    if (!subject.isActive || !subject.marks.isActive) return;

                    const subjKey = `${seqKey}_${subject.subjectInfo.toString()}`;

                    if (!subjectRanksMap.has(subjKey)) {
                        subjectRanksMap.set(subjKey, []);
                    }
                    subjectRanksMap.get(subjKey).push({
                        studentId: student._id.toString(),
                        mark: subject.marks.currentMark || 0
                    });
                });
            });
        });
    });

    // Helper function to assign ranks with tie support
    const assignRanks = (data, key) => {
        data.sort((a, b) => b[key] - a[key]);
        let rank = 1;
        data.forEach((item, index) => {
            if (index > 0 && item[key] < data[index - 1][key]) {
                rank = index + 1;
            }
            item.rank = rank;
        });
        return data;
    };

    // Assign academic ranks
    const rankedAcademic = assignRanks(academicRanks, 'average');
    rankedAcademic.forEach(item => {
        const student = academicYears.find(s => s._id.toString() === item.studentId);
        if (student) student.rank = item.rank;
    });

    // Save all students
    await Promise.all(academicYears.map(student => student.save()));

    return {
        academicRanks: rankedAcademic,
        termRanks: Object.fromEntries(termRanksMap),
        sequenceRanks: Object.fromEntries(sequenceRanksMap),
        subjectRanks: Object.fromEntries(subjectRanksMap),
        totalStudents: academicYears.length
    };
};

// Enhanced promotion method
academicYearSchema.statics.promoteStudents = async function (
    classId,
    year,
    promotionConfig
) {
    const {
        currentLevel,
        passedLevel,
        newYear,
        passedClassId,
        failClassId,
        passingThreshold = 10
    } = promotionConfig;

    const Student = mongoose.model('Student');
    const academicYears = await this.find({
        classes: classId,
        year: year,
        status: 'Active'
    }).populate('student');

    const results = {
        promoted: 0,
        repeated: 0,
        errors: []
    };

    for (const academicYear of academicYears) {
        try {
            const isPromoted = academicYear.overallAverage >= passingThreshold &&
                !academicYear.hasFailingSubjects;

            const newAcademicYear = new this({
                student: academicYear.student._id,
                school: academicYear.school,
                year: newYear,
                classes: isPromoted ? passedClassId : failClassId,
                hasRepeated: !isPromoted,
                terms: [],
                status: 'Active',
                enrollmentDate: new Date()
            });

            await newAcademicYear.save();

            // Update student level
            await Student.findByIdAndUpdate(academicYear.student._id, {
                level: isPromoted ? passedLevel : currentLevel,
                currentClass: isPromoted ? passedClassId : failClassId
            });

            // Update current academic year status
            academicYear.status = 'Completed';
            await academicYear.save();

            isPromoted ? results.promoted++ : results.repeated++;

        } catch (error) {
            results.errors.push({
                student: academicYear.student._id,
                error: error.message
            });
        }
    }

    return results;
};

// Enhanced fee management
academicYearSchema.methods.addFee = async function (feeData) {
    // Validate billID uniqueness
    const existingBill = this.fees.find(fee => fee.billID === feeData.billID);
    if (existingBill) {
        throw new Error(`Fee with billID ${feeData.billID} already exists`);
    }

    this.fees.push({
        ...feeData,
        paymentDate: feeData.paymentDate || new Date(),
        status: feeData.status || 'Completed'
    });

    return this.save();
};

// Method to get fee summary
academicYearSchema.methods.getFeeSummary = function () {
    const totalAmount = this.fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = this.fees
        .filter(fee => fee.status === 'Completed')
        .reduce((sum, fee) => sum + fee.amount, 0);

    return {
        totalAmount,
        paidAmount,
        pendingAmount: totalAmount - paidAmount,
        paymentRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
        transactionCount: this.fees.length
    };
};

// Static method to find students at risk with better filtering
academicYearSchema.statics.findStudentsAtRisk = async function (year, threshold = 10) {
    return this.find({
        year: year,
        status: 'Active',
        $or: [
            { overallAverage: { $lt: threshold } },
            { hasFailingSubjects: true },
            { 'terms.average': { $lt: threshold } }
        ]
    })
        .populate('student', 'name email phone')
        .populate('classes', 'name level')
        .sort({ overallAverage: 1 });
};

// Method to get academic performance summary
academicYearSchema.methods.getPerformanceSummary = function () {
    const subjectCount = this.activeSubjectsCount;
    const failingSubjects = this.hasFailingSubjects;
    const overallAvg = this.overallAverage;
    const status = this.overallStatus;

    return {
        subjectCount,
        failingSubjects,
        overallAverage: overallAvg,
        status,
        completionStatus: this.hasCompleted ? 'Completed' : 'In Progress',
        riskLevel: overallAvg < 10 || failingSubjects ? 'High Risk' : 'Low Risk'
    };
};

// Create AcademicYear model
const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
export default AcademicYear;