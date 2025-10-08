import Student from '../models/Student.js';
import Term from '../models/Term.js';
import Sequence from '../models/Sequence.js';
import Subject from '../models/Subject.js';
import AcademicYearDetail from '../models/AcademicYearDetail.js';
import AcademicYear from '../models/AcademicYear.js';
import Class from '../models/Classes.js';
import mongoose from 'mongoose';

class AcademicYearController {

  // Create academic years for students who don't have it for a given year
  async createAcademicYearsForStudents(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { studentIds, year, classId } = req.body;
      const schoolId = req.schoolId;

      if (!Array.isArray(studentIds) || !year || !classId || !schoolId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          message: 'Invalid input: studentIds, year, classId, and schoolId are required.' 
        });
      }

      // Validate class exists and belongs to school
      const classDoc = await Class.findOne({ _id: classId, school: schoolId }).session(session);
      if (!classDoc) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Class not found.' });
      }

      // Validate academic year exists and is current
      const academicYearDetail = await AcademicYearDetail.findOne({ 
        name: year, 
        school: schoolId 
      }).session(session);
      
      if (!academicYearDetail) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Academic year not found.' });
      }

      if (!academicYearDetail.isCurrent) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Academic year is not active.' });
      }

      let created = 0;
      let updated = 0;
      let failed = [];

      for (const studentId of studentIds) {
        try {
          const studentDoc = await Student.findOne({ 
            _id: studentId, 
            school: schoolId 
          }).session(session);
          
          if (!studentDoc) {
            failed.push({ studentId, error: 'Student not found' });
            continue;
          }

          // Check if student level matches class level
          if (studentDoc.level !== classDoc.level) {
            failed.push({ 
              studentId, 
              error: `Student level (${studentDoc.level}) does not match class level (${classDoc.level})` 
            });
            continue;
          }

          // Check if academic year already exists for this student
          let academicYearDoc = await AcademicYear.findOne({
            student: studentId,
            year: year,
            school: schoolId
          }).session(session);

          if (academicYearDoc) {
            // Update existing academic year
            academicYearDoc.classes = classId;
            await academicYearDoc.save({ session });
            
            // Update student class info
            studentDoc.classInfo = classId;
            await studentDoc.save({ session });
            
            // Add to class if not already present
            if (!classDoc.studentList.includes(academicYearDoc._id)) {
              classDoc.studentList.push(academicYearDoc._id);
            }
            updated++;
          } else {
            // Create new academic year with initialized terms from academic year detail
            const terms = await this.initializeTermsFromAcademicYear(academicYearDetail, classDoc);
            
            academicYearDoc = new AcademicYear({
              student: studentId,
              year: year,
              classes: classId,
              terms: terms,
              fees: [],
              school: schoolId,
              status: 'Active',
              enrollmentDate: new Date()
            });

            await academicYearDoc.save({ session });
            
            // Update student
            studentDoc.classInfo = classId;
            await studentDoc.save({ session });
            
            // Add to class
            classDoc.studentList.push(academicYearDoc._id);
            created++;
          }
        } catch (err) {
          failed.push({ studentId, error: err.message });
        }
      }

      await classDoc.save({ session });
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: 'Academic years processed successfully.',
        summary: { 
          created, 
          updated, 
          failedCount: failed.length, 
          failed,
          totalProcessed: created + updated
        }
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in createAcademicYearsForStudents:', error);
      return res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Helper method to initialize terms from academic year detail
  async initializeTermsFromAcademicYear(academicYearDetail, classDoc) {
    const terms = [];
    
    // Get terms for this academic year
    const termDocs = await Term.find({ 
      _id: { $in: academicYearDetail.terms },
      school: academicYearDetail.school 
    }).populate('sequences');

    for (const termDoc of termDocs) {
      const sequences = [];
      
      for (const sequenceDoc of termDoc.sequences) {
        const subjects = [];
        
        // Initialize subjects from class subject details
        for (const subjectDetail of classDoc.subjectDetails) {
          if (subjectDetail.isActive) {
            subjects.push({
              subjectInfo: subjectDetail.subject,
              isActive: true,
              discipline: 'Not Available',
              marks: {
                currentMark: 0,
                isActive: true,
                modified: []
              }
            });
          }
        }

        sequences.push({
          sequenceInfo: sequenceDoc._id,
          isActive: true,
          average: 0,
          rank: null,
          absences: 0,
          subjects: subjects,
          discipline: 'Not Available'
        });
      }

      terms.push({
        termInfo: termDoc._id,
        average: 0,
        rank: null,
        sequences: sequences,
        discipline: 'Not Available'
      });
    }

    return terms;
  }

  // Get academic year by student and year
  async getAcademicYearByStudent(req, res) {
    try {
      const { studentId, year } = req.params;
      const schoolId = req.schoolId;

      const academicYear = await AcademicYear.findOne({
        student: studentId,
        year: year,
        school: schoolId
      })
      .populate('student')
      .populate('classes')
      .populate({
        path: 'terms.termInfo',
        populate: {
          path: 'sequences',
          model: 'Sequence'
        }
      })
      .populate({
        path: 'terms.sequences.sequenceInfo',
        model: 'Sequence'
      })
      .populate({
        path: 'terms.sequences.subjects.subjectInfo',
        model: 'Subject'
      });

      if (!academicYear) {
        return res.status(404).json({ 
          message: 'Academic year not found for this student and year.' 
        });
      }

      res.json({ academicYear });
    } catch (error) {
      console.error('Error in getAcademicYearByStudent:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get academic performance summary for a student
  async getStudentPerformanceSummary(req, res) {
    try {
      const { studentId, year } = req.params;
      const schoolId = req.schoolId;

      const academicYear = await AcademicYear.findOne({
        student: studentId,
        year: year,
        school: schoolId
      });

      if (!academicYear) {
        return res.status(404).json({ 
          message: 'Academic year not found for this student and year.' 
        });
      }

      const performanceSummary = academicYear.getPerformanceSummary();
      const feeSummary = academicYear.getFeeSummary();

      res.json({
        student: academicYear.student,
        academicYear: academicYear.year,
        performance: performanceSummary,
        fees: feeSummary,
        overallRank: academicYear.rank,
        hasCompleted: academicYear.hasCompleted,
        hasRepeated: academicYear.hasRepeated
      });
    } catch (error) {
      console.error('Error in getStudentPerformanceSummary:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Bulk update marks for multiple students
  async bulkUpdateMarks(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { updates } = req.body;
      const schoolId = req.schoolId;

      if (!Array.isArray(updates) || updates.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          message: 'Invalid input: updates array is required.' 
        });
      }

      let processed = 0;
      let failed = [];

      for (const update of updates) {
        try {
          const { academicYearId, termInfo, sequenceInfo, subjectInfo, newMark } = update;
          
          const academicYear = await AcademicYear.findOne({ 
            _id: academicYearId, 
            school: schoolId 
          }).session(session);
          
          if (!academicYear) {
            failed.push({ academicYearId, error: 'Academic year not found' });
            continue;
          }

          const modifiedBy = {
            name: req.user?.name || 'System Administrator',
            userId: req.user?._id || new mongoose.Types.ObjectId()
          };

          await academicYear.updateMark(
            termInfo, 
            sequenceInfo, 
            subjectInfo, 
            newMark, 
            modifiedBy,
            'Bulk update'
          );

          await academicYear.calculateAverages();
          processed++;
        } catch (err) {
          failed.push({ 
            academicYearId: update.academicYearId, 
            error: err.message 
          });
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.json({
        message: 'Bulk mark update completed.',
        summary: { 
          processed, 
          failedCount: failed.length, 
          failed 
        }
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in bulkUpdateMarks:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get class academic overview
  async getClassAcademicOverview(req, res) {
    try {
      const { classId, year } = req.query;
      const schoolId = req.schoolId;

      if (!classId || !year) {
        return res.status(400).json({ 
          message: 'Class ID and year parameters are required.' 
        });
      }

      const academicYears = await AcademicYear.find({
        classes: classId,
        year: year,
        school: schoolId
      })
      .populate('student', 'name email phone')
      .populate('classes', 'name level section');

      if (academicYears.length === 0) {
        return res.status(404).json({ 
          message: 'No academic records found for this class and year.' 
        });
      }

      const overview = {
        classInfo: academicYears[0].classes,
        year: year,
        totalStudents: academicYears.length,
        averageClassAverage: 0,
        studentsCompleted: 0,
        studentsAtRisk: 0,
        topPerformers: [],
        performanceDistribution: {
          excellent: 0,
          veryGood: 0,
          good: 0,
          average: 0,
          belowAverage: 0
        }
      };

      let totalAverage = 0;

      academicYears.forEach(ay => {
        totalAverage += ay.overallAverage;
        
        if (ay.hasCompleted) overview.studentsCompleted++;
        if (ay.overallAverage < 10 || ay.hasFailingSubjects) overview.studentsAtRisk++;

        // Count performance distribution
        const status = ay.overallStatus;
        if (overview.performanceDistribution[status.toLowerCase().replace(' ', '')] !== undefined) {
          overview.performanceDistribution[status.toLowerCase().replace(' ', '')]++;
        }
      });

      overview.averageClassAverage = parseFloat((totalAverage / academicYears.length).toFixed(2));

      // Get top 5 performers
      overview.topPerformers = academicYears
        .sort((a, b) => b.overallAverage - a.overallAverage)
        .slice(0, 5)
        .map(ay => ({
          student: ay.student,
          average: ay.overallAverage,
          status: ay.overallStatus,
          rank: ay.rank
        }));

      res.json({ overview });
    } catch (error) {
      console.error('Error in getClassAcademicOverview:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Sync academic year with current class subjects
  async syncAcademicYearWithClass(req, res) {
    try {
      const { academicYearId } = req.params;
      const schoolId = req.schoolId;

      const academicYear = await AcademicYear.findOne({
        _id: academicYearId,
        school: schoolId
      }).populate('classes');

      if (!academicYear) {
        return res.status(404).json({ 
          message: 'Academic year not found.' 
        });
      }

      const classDoc = await Class.findById(academicYear.classes).populate('subjectDetails.subject');
      if (!classDoc) {
        return res.status(404).json({ 
          message: 'Class not found.' 
        });
      }

      let subjectsAdded = 0;
      let subjectsRemoved = 0;

      // Sync subjects across all terms and sequences
      for (const term of academicYear.terms) {
        for (const sequence of term.sequences) {
          if (!sequence.isActive) continue;

          const currentSubjectIds = sequence.subjects.map(s => s.subjectInfo.toString());
          const activeClassSubjectIds = classDoc.subjectDetails
            .filter(sd => sd.isActive)
            .map(sd => sd.subject._id.toString());

          // Add missing subjects
          for (const classSubjectId of activeClassSubjectIds) {
            if (!currentSubjectIds.includes(classSubjectId)) {
              sequence.subjects.push({
                subjectInfo: classSubjectId,
                isActive: true,
                discipline: 'Not Available',
                marks: {
                  currentMark: 0,
                  isActive: true,
                  modified: []
                }
              });
              subjectsAdded++;
            }
          }

          // Remove subjects not in class anymore
          sequence.subjects = sequence.subjects.filter(subject => {
            const shouldKeep = activeClassSubjectIds.includes(subject.subjectInfo.toString());
            if (!shouldKeep) subjectsRemoved++;
            return shouldKeep;
          });
        }
      }

      await academicYear.save();
      await academicYear.calculateAverages();

      res.json({
        message: 'Academic year synced with class subjects successfully.',
        summary: {
          subjectsAdded,
          subjectsRemoved,
          academicYearId: academicYear._id
        }
      });
    } catch (error) {
      console.error('Error in syncAcademicYearWithClass:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get fee analytics for academic year
  async getFeeAnalytics(req, res) {
    try {
      const { year, classId } = req.query;
      const schoolId = req.schoolId;

      if (!year) {
        return res.status(400).json({ 
          message: 'Year parameter is required.' 
        });
      }

      const query = { 
        year: year, 
        school: schoolId 
      };
      
      if (classId) {
        query.classes = classId;
      }

      const academicYears = await AcademicYear.find(query)
        .populate('student', 'name')
        .populate('classes', 'name');

      const analytics = {
        totalStudents: academicYears.length,
        totalFeesExpected: 0,
        totalFeesCollected: 0,
        collectionRate: 0,
        paymentMethods: {},
        feeTypes: {},
        outstandingPayments: []
      };

      academicYears.forEach(ay => {
        const feeSummary = ay.getFeeSummary();
        analytics.totalFeesCollected += feeSummary.paidAmount;
        analytics.totalFeesExpected += feeSummary.totalAmount;

        // Count payment methods
        ay.fees.forEach(fee => {
          if (fee.status === 'Completed') {
            analytics.paymentMethods[fee.paymentMethod] = 
              (analytics.paymentMethods[fee.paymentMethod] || 0) + fee.amount;
            
            analytics.feeTypes[fee.type] = 
              (analytics.feeTypes[fee.type] || 0) + fee.amount;
          }
        });

        // Track outstanding payments
        if (feeSummary.pendingAmount > 0) {
          analytics.outstandingPayments.push({
            student: ay.student,
            class: ay.classes,
            amountDue: feeSummary.pendingAmount,
            paymentRate: feeSummary.paymentRate
          });
        }
      });

      analytics.collectionRate = analytics.totalFeesExpected > 0 ?
        parseFloat(((analytics.totalFeesCollected / analytics.totalFeesExpected) * 100).toFixed(2)) : 0;

      res.json({ analytics });
    } catch (error) {
      console.error('Error in getFeeAnalytics:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Deactivate academic year (for withdrawals or transfers)
  async deactivateAcademicYear(req, res) {
    try {
      const { academicYearId } = req.params;
      const { reason, notes } = req.body;
      const schoolId = req.schoolId;

      const academicYear = await AcademicYear.findOne({
        _id: academicYearId,
        school: schoolId
      });

      if (!academicYear) {
        return res.status(404).json({ 
          message: 'Academic year not found.' 
        });
      }

      academicYear.status = 'Withdrawn';
      academicYear.notes = notes || `Deactivated: ${reason}`;
      
      await academicYear.save();

      res.json({
        message: 'Academic year deactivated successfully.',
        academicYear: {
          id: academicYear._id,
          student: academicYear.student,
          year: academicYear.year,
          status: academicYear.status,
          notes: academicYear.notes
        }
      });
    } catch (error) {
      console.error('Error in deactivateAcademicYear:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Reactivate academic year
  async reactivateAcademicYear(req, res) {
    try {
      const { academicYearId } = req.params;
      const schoolId = req.schoolId;

      const academicYear = await AcademicYear.findOne({
        _id: academicYearId,
        school: schoolId
      });

      if (!academicYear) {
        return res.status(404).json({ 
          message: 'Academic year not found.' 
        });
      }

      academicYear.status = 'Active';
      academicYear.notes = 'Reactivated on ' + new Date().toISOString().split('T')[0];
      
      await academicYear.save();

      res.json({
        message: 'Academic year reactivated successfully.',
        academicYear: {
          id: academicYear._id,
          student: academicYear.student,
          year: academicYear.year,
          status: academicYear.status
        }
      });
    } catch (error) {
      console.error('Error in reactivateAcademicYear:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async assignStudentsToClassWithSession(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { studentList, classId, academicYear, schoolId } = req.body;

      if (!Array.isArray(studentList) || !classId || !academicYear || !schoolId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Invalid input: studentList, classId, academicYear, and schoolId are required.' });
      }

      const classDoc = await Class.findById(classId).session(session);
      if (!classDoc) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Class not found.' });
      }

      let created = 0, updated = 0, failed = [];

      for (const studentId of studentList) {
        try {
          const studentDoc = await Student.findById(studentId).session(session);
          if (!studentDoc) {
            failed.push({ studentId, error: 'Student not found' });
            continue;
          }

          // Find academic year doc filtering by school as well
          let academicDoc = await AcademicYear.findOne({
            student: studentId,
            year: academicYear,
            school: schoolId
          }).session(session);

          studentDoc.classInfo = classId;

          if (!academicDoc) {
            academicDoc = new AcademicYear({
              student: studentId,
              year: academicYear,
              classes: classId,
              terms: [],
              fees: [],
              school: schoolId,
            });
            await academicDoc.save({ session });
            classDoc.studentList.push(academicDoc._id);
            created++;
          } else {
            academicDoc.classes = classId;
            await academicDoc.save({ session });
            if (!classDoc.studentList.includes(academicDoc._id)) {
              classDoc.studentList.push(academicDoc._id);
            }
            updated++;
          }

          await studentDoc.save({ session });
        } catch (err) {
          failed.push({ studentId, error: err.message });
        }
      }

      await classDoc.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: 'Academic year processing completed.',
        summary: { created, updated, failedCount: failed.length, failed }
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in assignStudentsToClassWithSession:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async assignStudentsToClass(req, res) {
    try {
      const { studentList, classId, academicYear } = req.body;
      const schoolId = req.schoolId
      if (!Array.isArray(studentList) || !classId || !academicYear || !schoolId) {
        return res.status(400).json({
          message: 'Invalid input: studentList, classId, academicYear, and schoolId are required.'
        });
      }

      const academicDetailDoc = await AcademicYearDetail.findOne({ name: academicYear, school: schoolId });
      if (!academicDetailDoc) {
        return res.status(404).json({ message: 'Academic Year not found.' });
      }
      if (!academicDetailDoc.isCurrent) {
        return res.status(400).json({ message: 'Academic Year is not active.' });
      }

      const classDoc = await Class.findOne({ _id: classId, school: schoolId });
      if (!classDoc) {
        return res.status(404).json({ message: 'Class not found.' });
      }

      let created = 0, updated = 0, failed = [];

      for (const studentId of studentList) {
        try {
          const studentDoc = await Student.findOne({ _id: studentId, school: schoolId });
          if (!studentDoc) {
            failed.push({ studentId, error: 'Student not found' });
            continue;
          }

          if (studentDoc.level !== classDoc.level) {
            failed.push({ studentId, error: `Student level mismatch for class ${classDoc.className}` });
            continue;
          }

          let academicDoc = await AcademicYear.findOne({
            student: studentId,
            year: academicYear,
            school: schoolId
          });

          studentDoc.classInfo = classId;

          if (!academicDoc) {
            academicDoc = new AcademicYear({
              student: studentId,
              year: academicYear,
              classes: classId,
              terms: [],
              fees: [],
              school: schoolId,
            });
            await academicDoc.save();
            classDoc.studentList.push(academicDoc._id);
            created++;
          } else {
            academicDoc.classes = classId;
            await academicDoc.save();
            if (!classDoc.studentList.includes(academicDoc._id)) {
              classDoc.studentList.push(academicDoc._id);
            }
            updated++;
          }

          await studentDoc.save();
        } catch (err) {
          failed.push({ studentId, error: err.message });
        }
      }

      await classDoc.save();
      console.log(failed)
      return res.status(200).json({
        message: 'Academic year processing completed.',
        summary: { created, updated, failedCount: failed.length, failed }
      });

    } catch (error) {
      console.error('Error in assignStudentsToClass:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async StudentsAcademic(req, res) {
    try {
      const { ...filters } = req.query;
      const schoolId = req.schoolId
      if (!schoolId) {
        return res.status(400).json({ message: 'schoolId query param is required' });
      }

      // Add school filter
      const query = { school: schoolId, ...filters };
      console.log("query",query)
      const students = await AcademicYear.find(query)
        .populate('classes')
        .populate('student');

      res.json({ students });
    } catch (error) {
      console.error('Error in StudentsAcademic:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update student marks
  async updateStudentMarks(req, res) {
    try {
      const { termInfo, sequenceInfo, subjectInfo, newMark } = req.body;
      const { id } = req.params;
      const schoolId = req.schoolId;

      console.log(req.body);

      // Find academic year filtered by school
      const academicYear = await AcademicYear.findOne({ _id: id, school: schoolId });
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found or not accessible.' });
      }

      const modifiedBy = {
        name: `Jessica Doe`,
        userId: "683cc2c64d5579397f53f727"
      };

      await academicYear.updateMark(termInfo, sequenceInfo, subjectInfo, newMark, modifiedBy);

      await academicYear.calculateAverages();

      res.json({
        message: 'Mark updated successfully',
        academicYear
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getFees(req, res) {
    try {
      const { academicYearId } = req.params;
      const schoolId = req.schoolId;

      const academicYear = await AcademicYear.findOne({ _id: academicYearId, school: schoolId });
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found or not accessible.' });
      }
      res.status(200).json(academicYear.fees);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // POST a new fee
  async addFee(req, res) {
    try {
      const { academicYearId } = req.params;
      const schoolId = req.schoolId;
      const { billID, type, amount, paymentMethod, paymentDate } = req.body;

      const academicYear = await AcademicYear.findOne({ _id: academicYearId, school: schoolId });
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found or not accessible.' });
      }

      const feeExists = academicYear.fees.some(f => f.billID === billID);
      if (feeExists) {
        return res.status(400).json({ message: 'Fee with this billID already exists' });
      }

      const feeData = { billID, type, amount, paymentMethod, paymentDate };
      await academicYear.addFee(feeData);

      res.status(201).json({ message: 'Fee added successfully', fees: academicYear.fees });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT update a fee
  async updateFee(req, res) {
    try {
      const { academicYearId, billID } = req.params;
      const schoolId = req.schoolId;
      const { type, amount, paymentDate, paymentMethod } = req.body;

      const academicYear = await AcademicYear.findOne({ _id: academicYearId, school: schoolId });
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found or not accessible.' });
      }

      const fee = academicYear.fees.find(f => f.billID === billID);
      if (!fee) {
        return res.status(404).json({ message: 'Fee not found' });
      }

      if (type !== undefined) fee.type = type;
      if (amount !== undefined) fee.amount = amount;
      if (paymentMethod !== undefined) fee.paymentMethod = paymentMethod;
      if (paymentDate !== undefined) fee.paymentDate = paymentDate;

      await academicYear.save();

      res.status(200).json({ message: 'Fee updated successfully', fee });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // DELETE a fee
  async deleteFee(req, res) {
    try {
      const { academicYearId, billID } = req.params;
      const schoolId = req.schoolId;

      const academicYear = await AcademicYear.findOne({ _id: academicYearId, school: schoolId });
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found or not accessible.' });
      }

      const initialLength = academicYear.fees.length;
      academicYear.fees = academicYear.fees.filter(f => f.billID !== billID);

      if (academicYear.fees.length === initialLength) {
        return res.status(404).json({ message: 'Fee not found' });
      }

      await academicYear.save();
      res.status(200).json({ message: 'Fee deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async calculateSubjectRank(req, res) {
    try {
      const { classId, year, termId, sequenceId, subjectId } = req.body;
      const schoolId = req.schoolId;

      if (!classId || !year || !termId || !sequenceId || !subjectId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Pass schoolId to the model static method (you'll need to update model to accept it)
      const result = await AcademicYear.calculateAllRanks(
        classId,
        year,
        termId,
        sequenceId,
        subjectId,
        schoolId
      );

      return res.status(200).json({
        message: 'Ranks calculated successfully',
        ranks: result
      });
    } catch (error) {
      console.error('Error calculating ranks:', error);
      return res.status(500).json({
        error: 'An error occurred while calculating ranks',
        details: error.message
      });
    }
  }

  async calculateSequenceRank(req, res) {
    try {
      const { classId, year, termId, sequenceId } = req.body;
      const schoolId = req.schoolId;

      if (!classId || !year || !termId || !sequenceId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const result = await AcademicYear.calculateSequenceRank(
        classId,
        year,
        termId,
        sequenceId,
        schoolId
      );

      return res.status(200).json({
        message: 'Ranks calculated successfully',
        ranks: result
      });
    } catch (error) {
      console.error('Error calculating ranks:', error);
      return res.status(500).json({
        error: 'An error occurred while calculating ranks',
        details: error.message
      });
    }
  }

  async calculateTermRank(req, res) {
    try {
      const { classId, year, termId } = req.body;
      const schoolId = req.schoolId;

      if (!classId || !year || !termId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const result = await AcademicYear.calculateTermRank(
        classId,
        year,
        termId,
        schoolId
      );

      return res.status(200).json({
        message: 'Ranks calculated successfully',
        ranks: result
      });
    } catch (error) {
      console.error('Error calculating ranks:', error);
      return res.status(500).json({
        error: 'An error occurred while calculating ranks',
        details: error.message
      });
    }
  }

  async calculateRanksForClassYear(req, res) {
    try {
      const { classId, year } = req.body;
      const schoolId = req.schoolId;

      if (!classId || !year) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const result = await AcademicYear.calculateRanksForClassYear(
        classId,
        year,
        schoolId
      );

      return res.status(200).json({
        message: 'Ranks calculated successfully',
        ranks: result
      });
    } catch (error) {
      console.error('Error calculating ranks:', error);
      return res.status(500).json({
        error: 'An error occurred while calculating ranks',
        details: error.message
      });
    }
  }

  async promoteStudents(req, res) {
    try {
      const { classId, year, currentLevel, passedLevel, newYear, passedClassId, failClassId } = req.body;
      const schoolId = req.schoolId;

      if (!classId || !year || !currentLevel || !passedLevel || !newYear || !passedClassId || !failClassId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      await AcademicYear.promoteStudents(
        classId,
        year,
        currentLevel,
        passedLevel,
        newYear,
        passedClassId,
        failClassId,
        schoolId
      );

      return res.status(200).json({
        message: 'Students promoted successfully',
      });
    } catch (error) {
      console.error('Error promoting students:', error);
      return res.status(500).json({
        error: 'An error occurred while promoting students',
        details: error.message
      });
    }
  }






  // not yet used
  // Academic year management
  async createAcademicYear(req, res) {
    try {
      const { studentId, year, classesId, terms } = req.body;

      // Validate student
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Check if academic year already exists for student
      const existingYear = await AcademicYear.findOne({ student: studentId, year });
      if (existingYear) {
        return res.status(400).json({ message: 'Academic year already exists for this student' });
      }

      // Prepare terms with sequences and subjects
      const processedTerms = [];

      for (const term of terms) {
        const termInfo = await Term.findById(term.termId);
        if (!termInfo) {
          return res.status(404).json({ message: `Term with ID ${term.termId} not found` });
        }

        const processedSequences = [];

        for (const sequence of term.sequences) {
          const sequenceInfo = await Sequence.findById(sequence.sequenceId);
          if (!sequenceInfo) {
            return res.status(404).json({ message: `Sequence with ID ${sequence.sequenceId} not found` });
          }

          const processedSubjects = [];

          for (const subject of sequence.subjects) {
            const subjectInfo = await Subject.findById(subject.subjectId);
            if (!subjectInfo) {
              return res.status(404).json({ message: `Subject with ID ${subject.subjectId} not found` });
            }

            processedSubjects.push({
              subjectInfo: subject.subjectId,
              isActive: true,
              marks: {
                currentMark: 0,
                isActive: true,
                modified: []
              }
            });
          }

          processedSequences.push({
            sequenceInfo: sequence.sequenceId,
            isActive: true,
            average: 0,
            rank: null,
            absences: 0,
            subjects: processedSubjects
          });
        }

        processedTerms.push({
          termInfo: term.termId,
          average: 0,
          rank: null,
          sequences: processedSequences,
          discipline: 'Good'
        });
      }

      // Create new academic year
      const academicYear = new AcademicYear({
        student: studentId,
        year,
        classes: classesId,
        hasRepeated: false,
        hasCompleted: false,
        terms: processedTerms,
        fees: []
      });

      await academicYear.save();

      // Update student with academic year reference
      await Student.findByIdAndUpdate(
        studentId,
        { $addToSet: { academicYears: academicYear._id } }
      );

      res.status(201).json({
        message: 'Academic year created successfully',
        academicYear
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getAcademicYearById(req, res) {
    try {
      const academicYear = await AcademicYear.findById(req.params.id)
        .populate('student')
        .populate('classes')
        .populate({
          path: 'terms.termInfo',
          model: 'Term'
        })
        .populate({
          path: 'terms.sequences.sequenceInfo',
          model: 'Sequence'
        })
        .populate({
          path: 'terms.sequences.subjects.subjectInfo',
          model: 'Subject'
        });

      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }

      res.json({ academicYear });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Check year completion
  async checkYearCompletion(req, res) {
    try {
      // Find academic year
      const academicYear = await AcademicYear.findById(req.params.id);
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }

      // Check completion
      await academicYear.checkYearCompletion();

      res.json({
        message: 'Year completion checked',
        hasCompleted: academicYear.hasCompleted,
        academicYear
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get students at risk
  async getStudentsAtRisk(req, res) {
    try {
      const { year, threshold } = req.query;

      if (!year) {
        return res.status(400).json({ message: 'Year parameter is required' });
      }

      const studentsAtRisk = await AcademicYear.findStudentsAtRisk(
        year,
        threshold ? parseFloat(threshold) : 10
      );

      res.json({ studentsAtRisk });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Generate report card
  async generateReportCard(req, res) {
    try {
      const { id } = req.params;
      const { termIndex } = req.query;

      // Find academic year with all necessary data
      const academicYear = await AcademicYear.findById(id)
        .populate('student')
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            model: 'User',
            select: 'firstName lastName'
          }
        })
        .populate('classes')
        .populate({
          path: 'terms.termInfo',
          model: 'Term'
        })
        .populate({
          path: 'terms.sequences.sequenceInfo',
          model: 'Sequence'
        })
        .populate({
          path: 'terms.sequences.subjects.subjectInfo',
          model: 'Subject'
        });

      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }

      // Generate report card data
      let reportCardData;

      if (termIndex !== undefined) {
        // Generate report for specific term
        if (!academicYear.terms[termIndex]) {
          return res.status(404).json({ message: 'Term not found' });
        }

        const term = academicYear.terms[termIndex];

        reportCardData = {
          student: {
            id: academicYear.student._id,
            name: `${academicYear.student.user.firstName} ${academicYear.student.user.lastName}`,
            class: academicYear.classes ? academicYear.classes.classesName : 'N/A'
          },
          academicYear: academicYear.year,
          term: {
            name: term.termInfo.name,
            average: term.average,
            rank: term.rank,
            discipline: term.discipline,
            sequences: term.sequences.map(sequence => ({
              name: sequence.sequenceInfo.name,
              average: sequence.average,
              rank: sequence.rank,
              subjects: sequence.subjects.map(subject => ({
                name: subject.subjectInfo.subjectName,
                code: subject.subjectInfo.subjectCode,
                mark: subject.marks.currentMark,
                isActive: subject.isActive && subject.marks.isActive
              }))
            }))
          }
        };
      } else {
        // Generate full year report
        reportCardData = {
          student: {
            id: academicYear.student._id,
            name: `${academicYear.student.user.firstName} ${academicYear.student.user.lastName}`,
            class: academicYear.classes ? academicYear.classes.classesName : 'N/A'
          },
          academicYear: academicYear.year,
          overallAverage: academicYear.overallAverage,
          overallStatus: academicYear.overallStatus,
          hasCompleted: academicYear.hasCompleted,
          terms: academicYear.terms.map(term => ({
            name: term.termInfo.name,
            average: term.average,
            rank: term.rank,
            discipline: term.discipline
          })),
          fees: {
            total: academicYear.totalFeesPaid,
            details: academicYear.fees
          }
        };
      }

      res.json({ reportCard: reportCardData });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get class rankings
  async getClassRankings(req, res) {
    try {
      const { classId, year, termIndex } = req.query;

      if (!classId || !year) {
        return res.status(400).json({ message: 'Class ID and year parameters are required' });
      }

      // Find all academic years for the class and year
      const academicYears = await AcademicYear.find({
        classes: classId,
        year
      }).populate({
        path: 'student',
        populate: {
          path: 'user',
          model: 'User',
          select: 'firstName lastName'
        }
      });

      if (!academicYears.length) {
        return res.status(404).json({ message: 'No academic records found for this class and year' });
      }

      let rankings;

      if (termIndex !== undefined) {
        // Get rankings for specific term
        rankings = academicYears
          .filter(ay => ay.terms[termIndex])
          .map(ay => ({
            studentId: ay.student._id,
            studentName: `${ay.student.user.firstName} ${ay.student.user.lastName}`,
            average: ay.terms[termIndex].average,
            termName: ay.terms[termIndex].termInfo ? ay.terms[termIndex].termInfo.name : `Term ${parseInt(termIndex) + 1}`
          }))
          .sort((a, b) => b.average - a.average)
          .map((student, index) => ({
            ...student,
            rank: index + 1
          }));
      } else {
        // Get rankings for overall year
        rankings = academicYears
          .map(ay => ({
            studentId: ay.student._id,
            studentName: `${ay.student.user.firstName} ${ay.student.user.lastName}`,
            average: ay.overallAverage,
            status: ay.overallStatus,
            hasCompleted: ay.hasCompleted
          }))
          .sort((a, b) => b.average - a.average)
          .map((student, index) => ({
            ...student,
            rank: index + 1
          }));
      }

      res.json({ rankings });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Calculate and update averages for an academic year
  async calculateAverages(req, res) {
    try {
      const academicYear = await AcademicYear.findById(req.params.id);

      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }

      await academicYear.calculateAverages();

      res.json({
        message: 'Averages calculated successfully',
        academicYear
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete an academic year
  async deleteAcademicYear(req, res) {
    try {
      const academicYear = await AcademicYear.findById(req.params.id);

      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }

      // Remove reference from student
      await Student.findByIdAndUpdate(
        academicYear.student,
        { $pull: { academicYears: academicYear._id } }
      );

      // Delete the academic year
      await AcademicYear.findByIdAndDelete(req.params.id);

      res.json({ message: 'Academic year deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new AcademicYearController();