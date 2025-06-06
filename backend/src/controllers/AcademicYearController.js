import Student from '../models/Student.js';
import Term from '../models/Term.js';
import Sequence from '../models/Sequence.js';
import Subject from '../models/Subject.js';
import AcademicYearDetail from '../models/AcademicYearDetail.js';
import AcademicYear from '../models/AcademicYear.js';
import Class from '../models/Classes.js';
import mongoose from 'mongoose';

class AcademicYearController {

  async assignStudentsToClassWithSession(req, res) {
    const session = await mongoose.startSession(); // Start a new session
    session.startTransaction();

    try {
      const { studentList, classId, academicYear } = req.body;
      console.log(req.body);

      if (!Array.isArray(studentList) || !classId || !academicYear) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Invalid input: studentList, classId, academicYear are required.' });
      }

      const classDoc = await Class.findById(classId);
      console.log(await Class.find())
      if (!classDoc) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Class not found.' });
      }

      let created = 0, updated = 0, failed = [];

      for (const studentId of studentList) {
        try {
          const studentDoc = await Student.findById(studentId);
          if (!studentDoc) {
            console.log(`Student with id: ${studentId} does not exist`);
            failed.push({ studentId, error: 'Student not found' });
            continue;
          }

          let academicDoc = await AcademicYear.findOne({
            student: studentId, year: academicYear
          });
          studentDoc.classInfo = classId;

          if (!academicDoc) {
            academicDoc = new AcademicYear({
              student: studentId,
              year: academicYear,
              classes: classId,
              terms: [],
              fees: []
            });

            await academicDoc.save({ session });
            classDoc.student.push(academicDoc._id);
            created++;
          } else {
            academicDoc.classes = classId;
            await academicDoc.save({ session });
            classDoc.student.push(academicDoc._id);
            updated++;
          }

          await studentDoc.save({ session });
        } catch (err) {
          console.log(err)
          failed.push({ studentId, error: err.message });
        }
      }

      await classDoc.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: 'Academic year processing completed.',
        summary: {
          created,
          updated,
          failedCount: failed.length,
          failed
        }
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in assignStudentsToClass:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async assignStudentsToClass(req, res) {
    try {
      const { studentList, classId, academicYear } = req.body;
      console.log(req.body);

      if (!Array.isArray(studentList) || !classId || !academicYear) {
        return res.status(400).json({
          message: 'Invalid input: studentList, classId, academicYear are required.'
        });
      }

      const academicDetailDoc = await AcademicYearDetail.findOne({ name: academicYear });
      if (!academicDetailDoc) {
        return res.status(404).json({ message: 'Academic Year not found.' });
      }
      if (!academicDetailDoc.isCurrent)
        return res.status(404).json({ message: 'Academic Year is not active.' });

      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({ message: 'Class not found.' });
      }

      let created = 0, updated = 0, failed = [];
      for (const studentId of studentList) {
        try {
          const studentDoc = await Student.findById(studentId);
          if (!studentDoc) {
            console.log(`Student with id: ${studentId} does not exist`);
            failed.push({ studentId, error: 'Student not found' });
            continue;
          }
          if (studentDoc.level !== classDoc.level) {
            console.log(`Student ${studentDoc.email} is no in the level for class ${classDoc.className}`);
            failed.push({ studentId, error: 'Student not found' });
            continue;
          }
          let academicDoc = await AcademicYear.findOne({
            student: studentId,
            year: academicYear
          });

          studentDoc.classInfo = classId;

          if (!academicDoc) {
            academicDoc = new AcademicYear({
              student: studentId,
              year: academicYear,
              classes: classId,
              terms: [],
              fees: []
            });

            await academicDoc.save();
            classDoc.studentList.push(academicDoc._id);
            created++;
          } else {
            academicDoc.classes = classId;
            await academicDoc.save();
            classDoc.studentList.push(academicDoc._id);
            updated++;
          }

          await studentDoc.save();
        } catch (err) {
          console.log(err);
          failed.push({ studentId, error: err.message });
        }
      }

      await classDoc.save();
      console.log(
        created,
        updated,
        failed.length,
      )
      return res.status(200).json({
        message: 'Academic year processing completed.',
        summary: {
          created,
          updated,
          failedCount: failed.length,
          failed
        }
      });

    } catch (error) {
      console.error('Error in assignStudentsToClass:', error);
      return res.status(500).json({
        message: 'Server error',
        error: error.message
      });
    }
  }

  async StudentsAcademic(req, res) {
    try {

      const students = await AcademicYear.find(req.query)
        .populate('classes')
        .populate('student')


      res.json({ students });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

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

  // Update student marks
  async updateStudentMarks(req, res) {
    try {
      const { termInfo, sequenceInfo, subjectInfo, newMark } = req.body;

      // Find academic year
      console.log(req.body)
      const academicYear = await AcademicYear.findById(req.params.id);
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }

      // Create modified by object
      // const modifiedBy = {
      //   name: `${req.user.firstName} ${req.user.lastName}`,
      //   userId: req.user.id
      // };
      const modifiedBy = {
        name: `Jessica Doe`,
        userId: "683cc2c64d5579397f53f727"
      };
      // Update mark
      await academicYear.updateMark(termInfo, sequenceInfo, subjectInfo, newMark, modifiedBy);

      // Recalculate averages
      await academicYear.calculateAverages();

      res.json({
        message: 'Mark updated successfully',
        academicYear
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Add fee payment
  async addFeePayment(req, res) {
    try {
      const { billID, type, amount } = req.body;

      // Find academic year
      const academicYear = await AcademicYear.findById(req.params.id);
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }

      // Add fee
      const feeData = {
        billID,
        type,
        amount,
        date: new Date()
      };

      await academicYear.addFee(feeData);

      res.json({
        message: 'Fee payment added successfully',
        academicYear
      });
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