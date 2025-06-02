import Student from '../models/Student.js';
import User from '../models/User.js';
import { AcademicYear } from '../models/AcademicYear.js';
import Classes from '../models/Classes.js';

// List of required fields for a student creation
const requiredFields = ['matricule', 'firstName', 'lastName', 'email', 'dateOfBirth'];

const validateRequiredFields = (data) => {
  const missingFields = [];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  return missingFields;
};

class StudentController {
  // Student registration and management
  
  // Create single student with validation
  async createStudent(req, res) {
    try {
      const studentData = req.body;

      // Validate required fields
      const missingFields = validateRequiredFields(studentData);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: 'Missing required fields',
          missingFields,
        });
      }

      const newStudent = new Student(studentData);
      const savedStudent = await newStudent.save();

      res.status(201).json({
        message: 'Student created successfully',
        student: savedStudent
      });
    } catch (error) {
      console.error(error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate field value entered', error: error.keyValue });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Create many students sequentially with validation
  async createManyStudents(req, res) {
    try {
      const studentsArray = req.body;

      if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
        return res.status(400).json({ message: 'Request body must be a non-empty array of students' });
      }

      const savedStudents = [];
      const errors = [];

      for (let i = 0; i < studentsArray.length; i++) {
        const studentData = studentsArray[i];

        // Validate required fields for each student
        const missingFields = validateRequiredFields(studentData);
        if (missingFields.length > 0) {
          errors.push({ index: i, missingFields });
          continue; // skip saving this student, go to next
        }

        try {
          const student = new Student(studentData);
          const savedStudent = await student.save();
          savedStudents.push(savedStudent);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(207).json({ // 207 Multi-Status to show partial success/fail
        message: `${savedStudents.length} students created, ${errors.length} errors`,
        savedStudents,
        errors
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async registerStudent(req, res) {
    try {
      const { userId, classesId } = req.body;

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if student already exists
      const existingStudent = await Student.findOne({ user: userId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student already registered' });
      }

      // Check if class exists
      if (classesId) {
        const classes = await Classes.findById(classesId);
        if (!classes) {
          return res.status(404).json({ message: 'Class not found' });
        }
      }

      // Create new student
      const student = new Student({
        user: userId,
        classes: classesId
      });

      await student.save();

      // Update class with new student if class provided
      if (classesId) {
        await Classes.findByIdAndUpdate(
          classesId,
          { $addToSet: { studentList: student._id } }
        );
      }

      res.status(201).json({
        message: 'Student registered successfully',
        student
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getAllStudents(req, res) {
    try {
      const students = await Student.find({})
        // .populate('Classes', 'classesName');

      res.json({ students });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getStudentById(req, res) {
    try {
      const student = await Student.findById(req.params.id)
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('classes', 'classesName')
        .populate('academicYears');

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getStudentByUserId(req, res) {
    try {
      const student = await Student.findOne({ user: req.params.userId })
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('classes', 'classesName')
        .populate('academicYears');

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async updateStudent(req, res) {
    try {
      const { classesId } = req.body;

      // Check if class exists if provided
      if (classesId) {
        const classes = await Classes.findById(classesId);
        if (!classes) {
          return res.status(404).json({ message: 'Class not found' });
        }
      }

      const student = await Student.findByIdAndUpdate(
        req.params.id,
        { classes: classesId },
        { new: true }
      ).populate('user', 'firstName lastName email phoneNumber')
        .populate('classes', 'classesName');

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Update class with new student if class provided
      if (classesId) {
        // Remove student from previous class if exists
        await Classes.updateMany(
          { studentList: student._id },
          { $pull: { studentList: student._id } }
        );

        // Add student to new class
        await Classes.findByIdAndUpdate(
          classesId,
          { $addToSet: { studentList: student._id } }
        );
      }

      res.json({
        message: 'Student updated successfully',
        student
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async deleteStudent(req, res) {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Remove student from classes
      await Classes.updateMany(
        { studentList: student._id },
        { $pull: { studentList: student._id } }
      );

      // Delete student
      await Student.findByIdAndDelete(req.params.id);

      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get student academic performance
  async getStudentAcademicPerformance(req, res) {
    try {
      const studentId = req.params.id;
      const { year } = req.query;

      // Validate student
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Query parameters for academic year
      const query = { student: studentId };
      if (year) {
        query.year = year;
      }

      // Get academic years for student with detailed population
      const academicYears = await AcademicYear.find(query)
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
        })
        .populate('classes');

      if (!academicYears.length) {
        return res.status(404).json({ message: 'No academic records found for this student' });
      }

      res.json({ academicYears });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get students by class
  async getStudentsByClass(req, res) {
    try {
      const classId = req.params.classId;

      // Validate class
      const classExists = await Classes.findById(classId);
      if (!classExists) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Get students in class
      const students = await Student.find({ classes: classId })
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('classes', 'classesName');

      res.json({ students });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get students with academic performance below threshold
  async getStudentsAtRisk(req, res) {
    try {
      const { year, threshold = 10 } = req.query;

      if (!year) {
        return res.status(400).json({ message: 'Academic year is required' });
      }

      const atRiskStudents = await AcademicYear.findStudentsAtRisk(year, threshold);

      // Get detailed student information
      const detailedStudents = await Promise.all(
        atRiskStudents.map(async (record) => {
          const studentInfo = await Student.findById(record.student)
            .populate('user', 'firstName lastName email');

          return {
            studentId: record.student,
            name: studentInfo?.user ? `${studentInfo.user.firstName} ${studentInfo.user.lastName}` : 'Unknown',
            email: studentInfo?.user?.email || 'N/A',
            average: record.overallAverage,
            failingSubjects: record.terms.flatMap(term =>
              term.sequences.flatMap(seq =>
                seq.subjects.filter(subj => subj.marks.currentMark < 10)
                  .map(subj => ({
                    name: subj.subjectInfo?.subjectName || 'Unknown Subject',
                    mark: subj.marks.currentMark
                  }))
              )
            )
          };
        })
      );

      res.json({ atRiskStudents: detailedStudents });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get student attendance summary
  async getStudentAttendance(req, res) {
    try {
      const { id } = req.params;
      const { year } = req.query;

      // Validate student
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Query parameters for academic year
      const query = { student: id };
      if (year) {
        query.year = year;
      }

      const academicYears = await AcademicYear.find(query)
        .populate('terms.termInfo')
        .populate('terms.sequences.sequenceInfo');

      if (!academicYears.length) {
        return res.status(404).json({ message: 'No academic records found for this student' });
      }

      // Calculate attendance statistics
      const attendanceData = academicYears.map(ay => ({
        year: ay.year,
        terms: ay.terms.map(term => ({
          name: term.termInfo?.name || `Term ${term._id}`,
          sequences: term.sequences.map(seq => ({
            name: seq.sequenceInfo?.name || `Sequence ${seq._id}`,
            absences: seq.absences || 0
          })),
          totalAbsences: term.sequences.reduce((total, seq) => total + (seq.absences || 0), 0)
        })),
        totalAbsences: ay.terms.reduce((total, term) =>
          total + term.sequences.reduce((seqTotal, seq) => seqTotal + (seq.absences || 0), 0), 0)
      }));

      res.json({ attendance: attendanceData });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  async updateStudentById(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const student = await Student.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ message: 'Student updated successfully', student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // ✅ Delete student by ID
  async deleteStudentById(req, res) {
    try {
      const { id } = req.params;
      const student = await Student.findByIdAndDelete(id);

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ message: 'Student deleted successfully', student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  async changeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'suspended', 'graduated', 'withdrawn'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      const student = await Student.findByIdAndUpdate(id, { status }, { new: true });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ message: 'Status updated successfully', student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

}

export default new StudentController();