import mongoose from 'mongoose';

const getDiscipline = (average) => {
    if (average >= 16) return 'Excellent';
    if (average >= 14) return 'Very Good';
    if (average >= 12) return 'Good';
    if (average >= 10) return 'Average';
    return 'Below Average';
}

// Define subject schema
const subjectSchema = new mongoose.Schema({
    subjectInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    isActive: { type: Boolean, default: true },
    discipline: { type: String, enum: ['Excellent', 'Very Good', 'Good', 'Average', 'Below Average', "Not Avaliable"], default: 'Not Avaliable' },
    rank: { type: Number, default: null },
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
}, { _id: false });

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
    discipline: { type: String, enum: ['Excellent', 'Very Good', 'Good', 'Average', 'Below Average', "Not Avaliable"], default: 'Not Avaliable' },
}, { _id: false });

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
    discipline: { type: String, enum: ['Excellent', 'Very Good', 'Good', 'Average', 'Below Average', "Not Avaliable"], default: 'Not Avaliable' },
}, { _id: false });

// Define fee schema
const feeSchema = new mongoose.Schema({
    billID: {
        type: String,
        trim: true,
        // unique: true,
    },
    type: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
    },
    paymentDate: { type: Date }
}, { _id: false });

// Define academic year schema
const academicYearSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
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
    rank: { type: Number, default: null },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

academicYearSchema.path('fees').validate(function (fees) {
  const billIDs = fees.map(f => f.billID);
  const uniqueBillIDs = new Set(billIDs);
  return billIDs.length === uniqueBillIDs.size;
}, 'Duplicate billID found in fees');

// Create indexes for academic year schema
academicYearSchema.index({ student: 1, year: 1, school: 1 }, { unique: true });
academicYearSchema.index({ year: 1 });
academicYearSchema.index({ hasCompleted: 1 });
academicYearSchema.index({ "terms.average": 1 });
academicYearSchema.index({ school: 1 });

// Virtual field for calculating overall average across all terms
academicYearSchema.virtual('overallAverage').get(function () {
    if (!this.terms || this.terms.length === 0) return 0;

    const sum = this.terms.reduce((total, term) => {
        return total + (term.average || 0);
    }, 0);

    return parseFloat((sum / this.terms.length).toFixed(2));
});

// Virtual field for calculating total fees paid
academicYearSchema.virtual('totalFeesPaid').get(function () {
    if (!this.fees || this.fees.length === 0) return 0;

    return this.fees.reduce((total, fee) => {
        return total + (fee.amount || 0);
    }, 0);
});

// Virtual field for calculating overall rank based on average
academicYearSchema.virtual('overallStatus').get(function () {
    const average = this.overallAverage;

    if (average >= 16) return 'Excellent';
    if (average >= 14) return 'Very Good';
    if (average >= 12) return 'Good';
    if (average >= 10) return 'Average';
    return 'Below Average';
});

// Virtual field for checking if student has any failing subjects
academicYearSchema.virtual('hasFailingSubjects').get(function () {
    // const Classes = mongoose.model('Classes');
    // const classDetail =  Classes.findById(this.classes);
    // console.log()
    if (!this.terms || this.terms.length === 0) return false;

    return this.terms.some(term => {
        if (!term.sequences || term.sequences.length === 0) return false;

        return term.sequences.some(sequence => {
            if (!sequence.subjects || sequence.subjects.length === 0) return false;

            return sequence.subjects.some(subject => {
                // const subjectDetail = classDetail.subjects.find(s => s.subjectInfo?._id.toString() === subject.subjectInfo.toString());
                // if (subjectDetail.isActive && subject.isActive && subject.marks.isActive) {
                return subject.marks.currentMark < 10; // Assuming 10 is passing mark
                // }else
                // return false
            });
        });
    });
});

// Method to calculate and update all averages in the academic year
academicYearSchema.methods.calculateAverages = async function () {
    const Classes = mongoose.model('Classes');
    const classDetail = await Classes.findById(this.classes);

    // Calculate subject averages within each sequence
    if (this.terms && this.terms.length > 0) {
        this.terms.forEach(term => {
            if (term.sequences && term.sequences.length > 0) {
                term.sequences.forEach(sequence => {
                    if (sequence.subjects && sequence.subjects.length > 0) {
                        let totalMarks = 0;
                        let validSubjects = 0;

                        sequence.subjects.forEach(subject => {
                            const subjectDetail = classDetail.subjects.find(s => s.subjectInfo?._id.toString() === subject.subjectInfo.toString());
                            console.log(subjectDetail);
                            if (subjectDetail.isActive && subject.isActive && subject.marks.isActive) {
                                totalMarks += subject.marks.currentMark * subjectDetail.coefficient;
                                validSubjects += subjectDetail.coefficient;
                            }
                        });

                        sequence.average = validSubjects > 0 ?
                            parseFloat((totalMarks / validSubjects).toFixed(2)) : 0;
                        sequence.discipline = getDiscipline(sequence.average)
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
                term.discipline = getDiscipline(term.average)
            }
        });
    }

    return this.save();
};

// Method to update a student's mark for a specific subject
academicYearSchema.methods.updateMark = async function (termInfo, sequenceInfo, subjectInfo, newMark, modifiedBy) {
    if (!termInfo || !sequenceInfo || !subjectInfo || !newMark || !modifiedBy) {
        throw new Error('Invalid indices provided');
    }
    try {
        const Term = mongoose.model('Term');
        const termDetail = await Term.findById(termInfo).populate('sequences');
        if (!termDetail) {
            throw new Error('Invalid Term ref provided');
        }
        const termExist = this.terms.some(t => t.termInfo.toString() === termDetail._id.toString())
        if (!termExist) {
            this.terms.push({
                termInfo: termDetail._id,
                sequences: []
            })
        }
        const term = this.terms.find(t => t.termInfo.toString() === termDetail._id.toString())
        const seqDetail = termDetail.sequences.find(s => s._id.toString() === sequenceInfo.toString())
        console.log(seqDetail)
        if (!seqDetail) {
            throw new Error('Invalid Sequence ref provided');
        }
        if (!seqDetail.isActive) {
            throw new Error(' Sequence is not Active.');
        }
        const seqExist = term.sequences.some(s => s.sequenceInfo.toString() === seqDetail._id.toString())
        if (!seqExist) {
            term.sequences.push({
                sequenceInfo: seqDetail._id,
                subjects: []
            })
        }
        const sequence = term.sequences.find(s => s.sequenceInfo.toString() === seqDetail._id.toString())
        console.log("this.term")
        if (subjectInfo === "absences") {
            sequence.absences = newMark
        } else {
            const subjectExist = sequence.subjects.some(s => s.subjectInfo.toString() === subjectInfo.toString())
            if (!subjectExist) {
                sequence.subjects.push({
                    subjectInfo: subjectInfo
                })
            }
            const subject = sequence.subjects.find(s => s.subjectInfo.toString() === subjectInfo.toString())
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
            subject.discipline = getDiscipline(newMark)
        }
        // Recalculate averages
        await this.calculateAverages();

    } catch (error) {
        throw error;
    }

    return this;
};
// method to find rank of students of a given class in a given subject
academicYearSchema.statics.calculateSubjectRank = async function (classId, year, termId, sequenceId, subjectId) {
    const academicYears = await this.find({ classes: classId, year });

    const academicAverages = [];
    const termAverages = [];
    const sequenceAverages = [];
    const subjectMarks = [];

    for (const student of academicYears) {
        academicAverages.push({
            studentId: student._id.toString(),
            average: student.overallAverage
        });
        const term = student.terms.find(t => t.termInfo.toString() === termId.toString());
        if (!term) continue;
        termAverages.push({
            studentId: student._id.toString(),
            average: term.average
        });
        const sequence = term.sequences.find(s => s.sequenceInfo.toString() === sequenceId.toString());
        if (!sequence || !sequence.isActive) continue;
        sequenceAverages.push({
            studentId: student._id,
            average: sequence.average
        });
        const subject = sequence.subjects.find(s => s.subjectInfo.toString() === subjectId.toString());
        if (!subject || !subject.isActive || !subject.marks.isActive) continue;

        subjectMarks.push({
            studentId: student._id,
            mark: subject.marks.currentMark
        });
    }

    // Sort by mark descending
    subjectMarks.sort((a, b) => b.mark - a.mark);

    // Assign ranks with tie support
    let currentRank = 1;
    for (let i = 0; i < subjectMarks.length; i++) {
        if (i > 0 && subjectMarks[i].mark < subjectMarks[i - 1].mark) {
            currentRank = i + 1;
        }

        const studentDoc = academicYears.find(s => s._id.toString() === subjectMarks[i].studentId.toString());
        const term = studentDoc.terms.find(t => t.termInfo.toString() === termId.toString());
        const sequence = term.sequences.find(s => s.sequenceInfo.toString() === sequenceId.toString());
        const subject = sequence.subjects.find(s => s.subjectInfo.toString() === subjectId.toString());

        subject.rank = currentRank;
        await studentDoc.save();
    }

    return subjectMarks;
};
// methed to sequence average of sequence of a given student
academicYearSchema.methods.calculateSequenceAverage = async function (termId, sequenceId) {
    const Classes = mongoose.model('Classes');
    const classDetail = await Classes.findById(this.classes);

    if (!classDetail) {
        throw new Error('Class not found');
    }

    const term = this.terms.find(t => t.termInfo.toString() === termId.toString());
    if (!term) throw new Error('Term not found');

    const sequence = term.sequences.find(s => s.sequenceInfo.toString() === sequenceId.toString());
    if (!sequence || !sequence.subjects) throw new Error('Sequence not found or has no subjects');

    let totalWeightedMarks = 0;
    let totalCoefficients = 0;

    sequence.subjects.forEach(subject => {
        const subjectDetail = classDetail.subjects.find(s =>
            s.subjectInfo.toString() === subject.subjectInfo.toString()
        );

        if (
            subjectDetail &&
            subjectDetail.isActive &&
            subject.isActive &&
            subject.marks.isActive
        ) {
            const coefficient = subjectDetail.coefficient || 1;
            totalWeightedMarks += subject.marks.currentMark * coefficient;
            totalCoefficients += coefficient;
        }
    });

    sequence.average = totalCoefficients > 0
        ? parseFloat((totalWeightedMarks / totalCoefficients).toFixed(2))
        : 0;
    sequence.discipline = getDiscipline(sequence.average)
    return this.save(); // Save updated average
};
// method to find rank of students of a given class in a given sequence
academicYearSchema.statics.calculateSequenceRank = async function (classId, year, termId, sequenceId) {
    const academicYears = await this.find({ classes: classId, year });

    // Build a list of students with their sequence average
    const sequenceAverages = [];

    for (const student of academicYears) {
        const term = student.terms.find(t => t.termInfo.toString() === termId.toString());
        if (!term) continue;

        const sequence = term.sequences.find(s => s.sequenceInfo.toString() === sequenceId.toString());
        if (!sequence || !sequence.isActive) continue;

        sequenceAverages.push({
            studentId: student._id,
            average: sequence.average || 0
        });
    }

    // Sort by average descending
    sequenceAverages.sort((a, b) => b.average - a.average);

    // Assign ranks
    let currentRank = 1;
    for (let i = 0; i < sequenceAverages.length; i++) {
        if (i > 0 && sequenceAverages[i].average < sequenceAverages[i - 1].average) {
            currentRank = i + 1;
        }

        // Update the student document's sequence rank
        const studentDoc = academicYears.find(s => s._id.toString() === sequenceAverages[i].studentId.toString());
        const term = studentDoc.terms.find(t => t.termInfo.toString() === termId.toString());
        const sequence = term.sequences.find(s => s.sequenceInfo.toString() === sequenceId.toString());

        sequence.rank = currentRank;
        await studentDoc.save();
    }

    return sequenceAverages;
};
// methed to sequence average of term of a given student
academicYearSchema.methods.calculateTermAverage = async function (termId) {
    const term = this.terms.find(t => t.termInfo.toString() === termId.toString());

    if (!term) throw new Error('Term not found');

    if (!term.sequences || term.sequences.length === 0) {
        term.average = 0;
        return this.save();
    }

    let total = 0;
    let count = 0;

    term.sequences.forEach(seq => {
        if (seq.isActive && typeof seq.average === 'number') {
            total += seq.average;
            count++;
        }
    });

    term.average = count > 0 ? parseFloat((total / count).toFixed(2)) : 0;
    term.discipline = getDiscipline(term.average)

    return this.save(); // Save updated average
};
// method to find rank of students of a given class in a given term
academicYearSchema.statics.calculateTermRank = async function (classId, year, termId) {
    const AcademicYear = this;

    // Fetch all students from the same class and academic year
    const allStudents = await AcademicYear.find({
        classes: classId,
        year: year
    });

    // Extract term averages for the specified term
    const averages = allStudents.map(student => {
        const term = student.terms.find(t => t.termInfo.toString() === termId.toString());
        return {
            studentId: student._id.toString(),
            average: term ? term.average || 0 : 0
        };
    });

    // Sort descending by average
    averages.sort((a, b) => b.average - a.average);

    // Assign rank (1-based)
    averages.forEach((entry, index) => {
        const student = allStudents.find(s => s._id.toString() === entry.studentId);
        const term = student.terms.find(t => t.termInfo.toString() === termId.toString());
        if (term) {
            term.rank = index + 1;
        }
    });

    // Save all students after updating their rank
    await Promise.all(allStudents.map(s => s.save()));
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
// calculate Ranks For all students in Class in a given Year
academicYearSchema.statics.calculateRanksForClassYear = async function (classId, year) {
    const academicYears = await this.find({ classes: classId, year });

    // We'll gather marks/averages for:
    // - all terms: { termId: [{ studentId, average }] }
    // - all sequences: { termId_sequenceId: [{ studentId, average }] }
    // - all subjects: { termId_sequenceId_subjectId: [{ studentId, mark }] }
    // Also gather academic averages for ranking
    const academicAverages = [];
    const termAveragesMap = new Map();
    const sequenceAveragesMap = new Map();
    const subjectMarksMap = new Map();

    for (const student of academicYears) {
        // Academic overall average
        academicAverages.push({
            studentId: student._id.toString(),
            average: student.overallAverage || 0
        });

        for (const term of student.terms) {
            if (!term.average) continue;

            // Term average for ranking
            if (!termAveragesMap.has(term.termInfo.toString())) {
                termAveragesMap.set(term.termInfo.toString(), []);
            }
            termAveragesMap.get(term.termInfo.toString()).push({
                studentId: student._id.toString(),
                average: term.average || 0
            });

            for (const sequence of term.sequences) {
                if (!sequence.isActive || !sequence.average) continue;

                const seqKey = `${term.termInfo.toString()}_${sequence.sequenceInfo.toString()}`;
                if (!sequenceAveragesMap.has(seqKey)) {
                    sequenceAveragesMap.set(seqKey, []);
                }
                sequenceAveragesMap.get(seqKey).push({
                    studentId: student._id.toString(),
                    average: sequence.average || 0
                });

                for (const subject of sequence.subjects) {
                    if (!subject.isActive || !subject.marks.isActive) continue;

                    const subjKey = `${term.termInfo.toString()}_${sequence.sequenceInfo.toString()}_${subject.subjectInfo.toString()}`;
                    if (!subjectMarksMap.has(subjKey)) {
                        subjectMarksMap.set(subjKey, []);
                    }
                    subjectMarksMap.get(subjKey).push({
                        studentId: student._id.toString(),
                        mark: subject.marks.currentMark || 0
                    });
                }
            }
        }
    }

    // Helper function to assign ranks with tie support
    function assignRanks(arr, keyName, rankField, findStudentFn, extraIds = {}) {
        arr.sort((a, b) => b[keyName] - a[keyName]);
        let currentRank = 1;
        for (let i = 0; i < arr.length; i++) {
            if (i > 0 && arr[i][keyName] < arr[i - 1][keyName]) {
                currentRank = i + 1;
            }
            const studentDoc = findStudentFn(arr[i].studentId);
            if (!studentDoc) continue;

            if (rankField === 'academicRank') {
                studentDoc.rank = currentRank;
            } else if (rankField === 'termRank') {
                const term = studentDoc.terms.find(t => t.termInfo.toString() === extraIds.termId);
                if (!term) continue;
                term.rank = currentRank;
            } else if (rankField === 'sequenceRank') {
                const term = studentDoc.terms.find(t => t.termInfo.toString() === extraIds.termId);
                if (!term) continue;
                const sequence = term.sequences.find(s => s.sequenceInfo.toString() === extraIds.sequenceId);
                if (!sequence) continue;
                sequence.rank = currentRank;
            } else if (rankField === 'subjectRank') {
                const term = studentDoc.terms.find(t => t.termInfo.toString() === extraIds.termId);
                if (!term) continue;
                const sequence = term.sequences.find(s => s.sequenceInfo.toString() === extraIds.sequenceId);
                if (!sequence) continue;
                const subject = sequence.subjects.find(s => s.subjectInfo.toString() === extraIds.subjectId);
                if (!subject) continue;

                subject.rank = currentRank;
            }
        }
    }

    // Helper to find student document by string id
    const findStudentById = (id) => academicYears.find(s => s._id.toString() === id);

    // Assign academic ranks
    assignRanks(academicAverages, 'average', 'academicRank', findStudentById);

    // Assign term ranks
    for (const [termId, averages] of termAveragesMap.entries()) {
        assignRanks(averages, 'average', 'termRank', findStudentById, { termId });
    }

    // Assign sequence ranks
    for (const [seqKey, averages] of sequenceAveragesMap.entries()) {
        const [termId, sequenceId] = seqKey.split('_');
        assignRanks(averages, 'average', 'sequenceRank', findStudentById, { termId, sequenceId });
    }

    // Assign subject ranks
    for (const [subjKey, marks] of subjectMarksMap.entries()) {
        const [termId, sequenceId, subjectId] = subjKey.split('_');
        assignRanks(marks, 'mark', 'subjectRank', findStudentById, { termId, sequenceId, subjectId });
    }

    // Save all updated student documents
    await Promise.all(academicYears.map(s => s.save()));

    return {
        academicRanks: academicAverages,
        termRanks: Object.fromEntries(termAveragesMap),
        sequenceRanks: Object.fromEntries(sequenceAveragesMap),
        subjectRanks: Object.fromEntries(subjectMarksMap),
    };
};

academicYearSchema.statics.promoteStudents = async function (
    classId,
    year,
    currentLevel,
    passedLevel,
    newYear,
    passedClassId,
    failClassId
) {
    const AcademicYear = this;
    const Student = mongoose.model('Student');

    // Fetch all AcademicYear docs for this class and year
    const studentsAcademicYears = await AcademicYear.find({
        classes: classId,
        year: year
    });

    // For each student in the current academic year
    for (const studentRecord of studentsAcademicYears) {
        const studentId = studentRecord.student; // assuming you have a ref to student

        // Check overallAverage (assuming it's a field on AcademicYear doc)
        const overallAverage = studentRecord.overallAverage || 0;

        // Determine if promoted or repeated
        const isPromoted = overallAverage > 10;

        // Prepare new AcademicYear document for next year
        const newAcademicYear = new AcademicYear({
            student: studentId,
            year: newYear,
            classes: isPromoted ? passedClassId : failClassId,
            level: isPromoted ? passedLevel : currentLevel,
            hasRepeated: !isPromoted,
            // Copy any other needed fields, e.g. reset terms, averages, etc.
            terms: [], // reset terms for new year
            overallAverage: 0
        });

        // Save the new academic year record
        await newAcademicYear.save();

        // Update the Student document's level attribute
        await Student.findByIdAndUpdate(studentId, {
            $set: {
                levels: isPromoted ? passedLevel : currentLevel
            }
        });
    }
};

// Method to add a new fee record
academicYearSchema.methods.addFee = async function (feeData) {
    this.fees.push(feeData);
    return this.save();
};

// Method to check if student has passed the academic year
academicYearSchema.methods.checkYearCompletion = async function () {
    const passingAverage = 10; // Assuming 10 is passing average

    // Check if all terms have passing averages
    const alltermsPassed = this.terms.every(term => term.average >= passingAverage);

    // Check if there are no failing core subjects (could be enhanced with subject importance)
    const noFailingCoreSubjects = !this.hasFailingSubjects;

    this.hasCompleted = alltermsPassed && noFailingCoreSubjects;
    return this.save();
};

// Static method to find students at risk (with low averages)
academicYearSchema.statics.findStudentsAtRisk = async function (year, threshold = 10) {
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