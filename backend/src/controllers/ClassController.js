import Classes from '../models/Classes.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import AcademicYear from '../models/AcademicYear.js';

class ClassController {
  // Get all classes for school
  async getAllClasses(req, res) {
    try {
      const { year, status } = req.query;
      const schoolId = req.schoolId;

      const query = { school: schoolId };
      if (year) query.year = year;
      if (status) query.status = status;

      const classes = await Classes.find(query)
        .populate('subjects.subjectInfo')
        .populate('subjects.teacherInfo')
        .populate('mainTeacherInfo');
      // Enhanced logging
      req.log = {
        action: 'VIEW',
        module: 'Classes',
        description: `Fetched classes for school ${schoolId}`,
        metadata: {
          filterYear: year || 'all',
          filterStatus: status || 'all',
          count: classes.length
        }
      }
      res.json({ classes });
    } catch (error) {
      console.error("Fetch classes error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  // Create class
  async createClass(req, res) {
    try {
      const {
        classesName,
        description,
        status,
        capacity,
        level,
        amountFee,
        subjects,
        mainTeacherInfo,
        year
      } = req.body;
      console.log(req.body)
      const schoolId = req.schoolId;

      if (!schoolId) return res.status(403).json({ message: "School context missing" });

      // Validate subjects
      if (subjects && subjects.length > 0) {
        for (const subject of subjects) {
          const exists = await Subject.findOne({ _id: subject.subjectInfo, school: schoolId });
          if (!exists) {
            return res.status(404).json({ message: `Subject ID ${subject.subjectInfo} not found for this school` });
          }
        }
      }

      const newClass = new Classes({
        school: schoolId,
        classesName,
        description,
        status: status || 'Open',
        capacity,
        level,
        amountFee,
        subjects: subjects || [],
        studentList: [],
        mainTeacherInfo,
        year
      });

      await newClass.save();
      await newClass.populate('school', 'name');

      await req.log({
        action: 'CREATE',
        module: 'Classes',
        description: `Created new class '${classesName}' for school ${newClass.school.name}`,
        metadata: {
          classId: newClass._id,
          level,
          year
        }
      });

      res.status(201).json({
        message: 'Class created successfully',
        class: newClass
      });
    } catch (error) {
      console.error("Create class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get single class by ID
  async getClassById(req, res) {
    try {
      const classData = await Classes.findOne({ _id: req.params.id, school: req.schoolId })
        .populate('subjects.subjectInfo')
        .populate('mainTeacherInfo')
        .populate({
          path: 'studentList',
          populate: { path: 'user', model: 'User', select: 'firstName lastName email' }
        });

      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      await req.log({
        action: 'VIEW',
        module: 'Classes',
        description: `Viewed class ${classData.classesName}`,
        metadata: { classId: req.params.id }
      });

      res.json({ class: classData });
    } catch (error) {
      console.error("Get class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update class
  async updateClass(req, res) {
    try {
      const {
        classesName,
        description,
        status,
        capacity,
        level,
        amountFee,
        mainTeacherInfo,
        subjects,
        year
      } = req.body;

      const schoolId = req.schoolId;

      const existingClass = await Classes.findOne({ _id: req.params.id, school: schoolId });
      if (!existingClass) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Validate subject references
      if (subjects && subjects.length > 0) {
        for (const subject of subjects) {
          const validSubject = await Subject.findOne({ _id: subject.subjectInfo, school: schoolId });
          if (!validSubject) {
            return res.status(404).json({ message: `Invalid subject ID ${subject.subjectInfo} for this school` });
          }
        }
      }

      const updated = await Classes.findByIdAndUpdate(
        req.params.id,
        {
          classesName,
          description,
          status,
          capacity,
          level,
          amountFee,
          mainTeacherInfo,
          subjects,
          year
        },
        { new: true }
      )
        .populate('subjects.subjectInfo')
        .populate('subjects.teacherInfo')
        .populate('mainTeacherInfo');
      await req.log({
        action: 'UPDATE',
        module: 'Classes',
        description: `Updated class ${updated.classesName}`,
        metadata: { updatedFields: Object.keys(req.body) }
      });

      res.json({ message: 'Class updated successfully', class: updated });
    } catch (error) {
      console.error("Update class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete class
  async deleteClass(req, res) {
    try {
      const classData = await Classes.findOne({ _id: req.params.id, school: req.schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Remove class reference from students
      await Student.updateMany(
        { classes: req.params.id },
        { $pull: { classes: req.params.id } }
      );

      await classData.remove();
      await req.log({
        action: 'DELETE',
        module: 'Class',
        description: `Deleted class ${classData.classesName}`,
        metadata: { classId: req.params.id }
      });

      res.json({ message: 'Class deleted successfully' });
    } catch (error) {
      console.error("Delete class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Add or update multiple subjects in class
  async addSubjectsToClass(req, res) {
    try {
      const { subjects } = req.body; // array of { subjectInfo, coefficient, teacherInfo }
      const schoolId = req.schoolId;
      const classId = req.params.id;

      if (!Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ message: 'Subjects array is required and cannot be empty.' });
      }

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found for this school.' });
      }

      for (const item of subjects) {
        const { subjectInfo, coefficient, teacherInfo } = item;

        // Validate subject belongs to school
        const subject = await Subject.findOne({ _id: subjectInfo, school: schoolId });
        if (!subject) {
          console.warn(`Subject ${subjectInfo} not found or does not belong to school ${schoolId}`);
          continue; // Skip invalid subject
        }

        // Validate teacher belongs to school if provided
        if (teacherInfo) {
          const teacher = await User.findOne({ _id: teacherInfo, school: schoolId });
          if (!teacher) {
            console.warn(`Teacher ${teacherInfo} not found or does not belong to school ${schoolId}`);
            continue; // Skip invalid teacher
          }
        }

        // Find existing subject index in class
        const subjectIndex = classData.subjects.findIndex(
          (s) => s.subjectInfo.toString() === subjectInfo.toString()
        );

        if (subjectIndex === -1) {
          // Add new subject
          classData.subjects.push({
            subjectInfo,
            coefficient: coefficient ?? 1,
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
      await req.log({
        action: 'UPDATE',
        module: 'Class',
        description: `Updated subjects in class ${classData.classesName}`,
        metadata: req.body
      });

      res.json({
        message: 'Subjects processed successfully',
        class: classData
      });
    } catch (error) {
      console.error("addSubjectsToClass error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update one subject details in a class
  async updateSubjectInClass(req, res) {
    try {
      const { subjectId } = req.params;
      const { coefficient, teacherInfo } = req.body;
      const schoolId = req.schoolId;
      const classId = req.params.id;

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found for this school.' });
      }

      // Find subject index
      const subjectIndex = classData.subjects.findIndex(
        (s) => s._id.toString() === subjectId.toString()
      );

      if (subjectIndex === -1) {
        return res.status(404).json({ message: 'Subject not found in this class' });
      }

      // Validate teacher if updating teacherInfo
      if (teacherInfo) {
        const teacher = await User.findOne({ _id: teacherInfo, school: schoolId });
        if (!teacher) {
          return res.status(404).json({ message: 'Teacher not found or does not belong to this school.' });
        }
      }

      if (coefficient !== undefined) {
        classData.subjects[subjectIndex].coefficient = coefficient;
      }
      if (teacherInfo !== undefined) {
        classData.subjects[subjectIndex].teacherInfo = teacherInfo;
      }

      await classData.save();
      await req.log({
        action: 'UPDATE',
        module: 'Class',
        description: `Updated subject ${subjectId} in class ${classData.classesName}`,
        metadata: { coefficient, teacherInfo }
      });

      res.json({
        message: 'Subject updated successfully',
        class: classData
      });
    } catch (error) {
      console.error("updateSubjectInClass error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Remove subject from class
  async removeSubjectFromClass(req, res) {
    try {
      const { subjectId } = req.params;
      const schoolId = req.schoolId;
      const classId = req.params.id;

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found for this school.' });
      }

      classData.subjects = classData.subjects.filter(
        (s) => s.subjectInfo.toString() !== subjectId.toString()
      );

      await classData.save();
      await req.log({
        action: 'DELETE',
        module: 'Class',
        description: `Removed subject ${subjectId} from class ${classId}`,
        metadata: {}
      });

      res.json({
        message: 'Subject removed from class successfully',
        class: classData
      });
    } catch (error) {
      console.error("removeSubjectFromClass error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Add student to class
  async addStudentToClass(req, res) {
    try {
      const { studentId } = req.body;
      const schoolId = req.schoolId;
      const classId = req.params.id;

      // Validate student within the same school
      const student = await Student.findOne({ _id: studentId, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found or does not belong to your school.' });
      }

      // Validate class within the same school
      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found or does not belong to your school.' });
      }

      // Check if student already in class
      if (classData.studentList.some((id) => id.toString() === studentId.toString())) {
        return res.status(400).json({ message: 'Student already in this class' });
      }

      // Add student to class
      classData.studentList.push(studentId);
      await classData.save();

      // Update student with class reference
      student.classes = classId;
      await student.save();
      await req.log({
        action: 'UPDATE',
        module: 'Class',
        description: `Added student ${studentId} to class ${classId}`,
        metadata: { studentId }
      });

      res.json({
        message: 'Student added to class successfully',
        class: classData
      });
    } catch (error) {
      console.error("addStudentToClass error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Remove student from class
  async removeStudentFromClass(req, res) {
    try {
      const { studentId } = req.params;
      const schoolId = req.schoolId;
      const classId = req.params.id;

      // Validate class within school
      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found or does not belong to your school.' });
      }

      // Remove student from class list
      classData.studentList = classData.studentList.filter(
        (id) => id.toString() !== studentId.toString()
      );
      await classData.save();

      // Update student to remove class reference
      await Student.findOneAndUpdate(
        { _id: studentId, school: schoolId },
        { $unset: { classes: "" } }
      );
      await req.log({
        action: 'UPDATE',
        module: 'Class',
        description: `Removed student ${studentId} from class ${classId}`,
        metadata: { studentId }
      });

      res.json({
        message: 'Student removed from class successfully',
        class: classData
      });
    } catch (error) {
      console.error("removeStudentFromClass error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get class performance analytics for a given academic year
  async getClassPerformanceAnalytics(req, res) {
    try {
      const classId = req.params.id;
      const { year } = req.query;
      const schoolId = req.schoolId;

      if (!year) {
        return res.status(400).json({ message: 'Year parameter is required' });
      }

      // Validate class belongs to school
      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found or does not belong to your school.' });
      }

      // Fetch academic records for the class and year, including student user info
      const academicYears = await AcademicYear.find({
        classes: classId,
        year,
        school: schoolId
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

      // Initialize class stats
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

      let totalAverage = 0;
      let passingCount = 0;

      // Calculate overall statistics
      for (const ay of academicYears) {
        totalAverage += ay.overallAverage || 0;

        if (ay.hasCompleted) {
          passingCount++;
        }

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

      // Calculate term performance averages
      if (academicYears[0].terms && academicYears[0].terms.length > 0) {
        for (let i = 0; i < academicYears[0].terms.length; i++) {
          let termTotal = 0;
          let termCount = 0;

          for (const ay of academicYears) {
            if (ay.terms[i] && typeof ay.terms[i].average === 'number') {
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

      // Calculate subject performance based on first term & first sequence for simplicity
      if (
        academicYears[0].terms &&
        academicYears[0].terms[0] &&
        academicYears[0].terms[0].sequences &&
        academicYears[0].terms[0].sequences[0] &&
        academicYears[0].terms[0].sequences[0].subjects
      ) {
        const firstSequenceSubjects = academicYears[0].terms[0].sequences[0].subjects;

        for (let i = 0; i < firstSequenceSubjects.length; i++) {
          const subjectInfo = firstSequenceSubjects[i].subjectInfo;

          if (!subjectInfo) continue;

          let subjectName = 'Unknown Subject';
          if (typeof subjectInfo === 'object' && subjectInfo.subjectName) {
            subjectName = subjectInfo.subjectName;
          }

          let subjectTotal = 0;
          let subjectCount = 0;
          let passingSubjectCount = 0;

          for (const ay of academicYears) {
            if (
              ay.terms[0] &&
              ay.terms[0].sequences[0] &&
              ay.terms[0].sequences[0].subjects[i] &&
              typeof ay.terms[0].sequences[0].subjects[i].marks?.currentMark === 'number'
            ) {
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
      await req.log({
        action: 'VIEW',
        module: 'Class',
        description: `Fetched performance analytics for class ${classId} - year ${year}`,
        metadata: {
          studentCount: academicYears.length,
          classId,
          year
        }
      });

      res.json({ classPerformance: classStats });
    } catch (error) {
      console.error("getClassPerformanceAnalytics error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new ClassController();
