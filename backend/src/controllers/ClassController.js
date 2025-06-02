import Classes from '../models/Classes.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import { AcademicYear } from '../models/AcademicYear.js';

class ClassController {
  // Class management
  async createClass(req, res) {
    try {
      const {
        classesName,
        description,
        status,
        capacity,
        amountFee,
        subjects,
        mainTeacherInfo,
        year
      } = req.body;

      // Validate subjects if provided
      if (subjects && subjects.length > 0) {
        for (const subject of subjects) {
          const subjectExists = await Subject.findById(subject.subjectInfo);
          if (!subjectExists) {
            return res.status(404).json({ message: `Subject with ID ${subject.subjectInfo} not found` });
          }
        }
      }

      // Create new class
      const newClass = new Classes({
        classesName,
        description,
        status: status || 'Open',
        capacity,
        amountFee,
        subjects: subjects || [],
        studentList: [],
        mainTeacherInfo,
        year
      });

      await newClass.save();

      res.status(201).json({
        message: 'Class created successfully',
        class: newClass
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getAllClasses(req, res) {
    try {
      const { year, status } = req.query;

      // Build query
      const query = {};
      if (year) query.year = year;
      if (status) query.status = status;

      const classes = await Classes.find(query)
        .populate('subjects.subjectInfo')
        .populate('subjects.teacherInfo')
        .populate('mainTeacherInfo');

      res.json({ classes });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getClassById(req, res) {
    try {
      const classData = await Classes.findById(req.params.id)
        .populate('subjects.subjectInfo')
        .populate('mainTeacherInfo')
        .populate({
          path: 'studentList', populate: { path: 'user', model: 'User', select: 'firstName lastName email' }
        });

      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.json({ class: classData });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async updateClass(req, res) {
    try {
      const { classesName, description, status, capacity, amountFee, mainTeacherInfo, year } = req.body;

      const updatedClass = await Classes.findByIdAndUpdate(req.params.id,
        { classesName, description, status, capacity, amountFee, mainTeacherInfo, year },
        { new: true })
        .populate('subjects.subjectInfo')
        .populate('subjects.teacherInfo')
        .populate('mainTeacherInfo');

      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.json({
        message: 'Class updated successfully',
        class: updatedClass
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async deleteClass(req, res) {
    try {
      const classData = await Classes.findById(req.params.id); if (!classData) { return res.status(404).json({ message: 'Class not found' }); }

      // Update students to remove class reference 
      await Student.updateMany({ classes: req.params.id }, { $unset: { classes: "" } });
      // Delete class
      await Classes.findByIdAndDelete(req.params.id);

      res.json({ message: 'Class deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }

  }

  // Subject management within class 
  async addSubjectsToClass(req, res) {
    try {
      const { subjects } = req.body; // subjects: [{ subjectInfo, coefficient, teacherInfo }, ...]

      if (!Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ message: 'Subjects array is required and cannot be empty.' });
      }

      const classData = await Classes.findById(req.params.id);
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      for (const item of subjects) {
        const { subjectInfo, coefficient, teacherInfo } = item;

        const subject = await Subject.findById(subjectInfo);
        if (!subject) {
          continue; // Skip if subject doesn't exist
        }

        const subjectIndex = classData.subjects.findIndex(
          s => s.subjectInfo.toString() === subjectInfo
        );

        if (subjectIndex === -1) {
          // Add new subject
          classData.subjects.push({
            subjectInfo,
            coefficient: coefficient || 1,
            teacherInfo
          });
        } else {
          // Update existing subject
          if (coefficient !== undefined) {
            classData.subjects[subjectIndex].coefficient = coefficient;
          }
          if (teacherInfo !== undefined) {
            classData.subjects[subjectIndex].teacherInfo = teacherInfo;
          }
        }
      }

      await classData.save();

      res.json({
        message: 'Subjects processed successfully',
        class: classData
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async updateSubjectInClass(req, res) {
    try {
      const { subjectId } = req.params;
      const { coefficient, teacherInfo } = req.body;

      const classData = await Classes.findById(req.params.id);
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }
      // Find subject in class
      const subjectIndex = classData.subjects.findIndex(
        s => s._id.toString() === subjectId
      );

      if (subjectIndex === -1) {
        return res.status(404).json({ message: 'Subject not found in this class' });
      }

      // Update subject
      if (coefficient !== undefined) {
        classData.subjects[subjectIndex].coefficient = coefficient;
      }

      if (teacherInfo !== undefined) {
        classData.subjects[subjectIndex].teacherInfo = teacherInfo;
      }

      await classData.save();

      res.json({
        message: 'Subject updated successfully',
        class: classData
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  async removeSubjectFromClass(req, res) {
    try {
      const { subjectId } = req.params;

      const classData = await Classes.findById(req.params.id);
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }
      console.log(subjectId)
      // Remove subject from class
      classData.subjects = classData.subjects.filter(
        s => s.subjectInfo.toString() !== subjectId
      );

      await classData.save();

      res.json({
        message: 'Subject removed from class successfully',
        class: classData
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Student management within class 
  async addStudentToClass(req, res) {
    try {
      const { studentId } = req.body;

      // Validate student 
      const student = await Student.findById(studentId); if (!student) { return res.status(404).json({ message: 'Student not found' }); }
      // Validate class
      const classData = await Classes.findById(req.params.id);
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Check if student already in class
      const studentExists = classData.studentList.includes(studentId);
      if (studentExists) {
        return res.status(400).json({ message: 'Student already in this class' });
      }

      // Add student to class
      classData.studentList.push(studentId);
      await classData.save();

      // Update student with class reference
      student.classes = req.params.id;
      await student.save();

      res.json({
        message: 'Student added to class successfully',
        class: classData
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  async removeStudentFromClass(req, res) {
    try {
      const { studentId } = req.params;

      // Validate class 
      const classData = await Classes.findById(req.params.id); if (!classData) { return res.status(404).json({ message: 'Class not found' }); }
      // Remove student from class
      classData.studentList = classData.studentList.filter(
        s => s.toString() !== studentId
      );

      await classData.save();

      // Update student to remove class reference
      await Student.findByIdAndUpdate(
        studentId,
        { $unset: { classes: "" } }
      );

      res.json({
        message: 'Student removed from class successfully',
        class: classData
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Class performance analytics 
  async getClassPerformanceAnalytics(req, res) {
    try {
      const { id } = req.params; const { year } = req.query;

      if (!year) { return res.status(400).json({ message: 'Year parameter is required' }); }
      // Validate class
      const classData = await Classes.findById(id);
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Get all academic years for students in this class
      const academicYears = await AcademicYear.find({
        classes: id,
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
        return res.status(404).json({ message: 'No academic records found for this class' });
      }

      // Calculate class statistics
      const classStats = {
        totalStudents: academicYears.length,
        averagePerformance: 0,
        passingRate: 0,
        failingRate: 0,
        excellentStudents: 0,
        goodStudents: 0,
        averageStudents: 0,
        belowAverageStudents: 0,
        termPerformance: [],
        subjectPerformance: {}
      };

      // Calculate overall statistics
      let totalAverage = 0;
      let passingCount = 0;

      for (const ay of academicYears) {
        totalAverage += ay.overallAverage;

        if (ay.hasCompleted) {
          passingCount++;
        }

        // Count by performance level
        if (ay.overallAverage >= 16) {
          classStats.excellentStudents++;
        } else if (ay.overallAverage >= 14) {
          classStats.goodStudents++;
        } else if (ay.overallAverage >= 10) {
          classStats.averageStudents++;
        } else {
          classStats.belowAverageStudents++;
        }
      }

      classStats.averagePerformance = parseFloat((totalAverage / academicYears.length).toFixed(2));
      classStats.passingRate = parseFloat(((passingCount / academicYears.length) * 100).toFixed(2));
      classStats.failingRate = parseFloat((100 - classStats.passingRate).toFixed(2));

      // Calculate term performance
      if (academicYears[0].terms && academicYears[0].terms.length > 0) {
        for (let i = 0; i < academicYears[0].terms.length; i++) {
          let termTotal = 0;
          let termCount = 0;

          for (const ay of academicYears) {
            if (ay.terms[i] && ay.terms[i].average) {
              termTotal += ay.terms[i].average;
              termCount++;
            }
          }

          const termAvg = termCount > 0 ? parseFloat((termTotal / termCount).toFixed(2)) : 0;

          classStats.termPerformance.push({
            term: `Term ${i + 1}`,
            average: termAvg
          });
        }
      }

      // Calculate subject performance
      // This requires deeper analysis of sequences and subjects
      // We'll focus on the first term's first sequence for simplicity
      if (academicYears[0].terms &&
        academicYears[0].terms[0] &&
        academicYears[0].terms[0].sequences &&
        academicYears[0].terms[0].sequences[0]) {

        const firstSequence = academicYears[0].terms[0].sequences[0];

        if (firstSequence.subjects && firstSequence.subjects.length > 0) {
          for (let i = 0; i < firstSequence.subjects.length; i++) {
            const subjectInfo = firstSequence.subjects[i].subjectInfo;

            if (!subjectInfo) continue;

            let subjectName = 'Unknown Subject';
            if (typeof subjectInfo === 'object' && subjectInfo.subjectName) {
              subjectName = subjectInfo.subjectName;
            }

            let subjectTotal = 0;
            let subjectCount = 0;
            let passingSubjectCount = 0;

            for (const ay of academicYears) {
              if (ay.terms[0] &&
                ay.terms[0].sequences[0] &&
                ay.terms[0].sequences[0].subjects[i]) {

                const mark = ay.terms[0].sequences[0].subjects[i].marks.currentMark;
                subjectTotal += mark;
                subjectCount++;

                if (mark >= 10) {
                  passingSubjectCount++;
                }
              }
            }

            const subjectAvg = subjectCount > 0 ? parseFloat((subjectTotal / subjectCount).toFixed(2)) : 0;
            const subjectPassRate = subjectCount > 0 ? parseFloat(((passingSubjectCount / subjectCount) * 100).toFixed(2)) : 0;

            classStats.subjectPerformance[subjectName] = {
              average: subjectAvg,
              passingRate: subjectPassRate
            };
          }
        }
      }

      res.json({ classPerformance: classStats });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new ClassController();
