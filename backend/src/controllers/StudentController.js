import Student from '../models/Student.js';
import User from '../models/User.js';
import AcademicYear from '../models/AcademicYear.js';
import Classes from '../models/Classes.js';

// List of required fields for a student creation
const validateRequiredFields = (data) => {
  const requiredFields = ['matricule', 'firstName',
     'lastName', 'email', 'level', 'dateOfBirth',
      'school'];
  const missingFields = requiredFields.filter(field => !data[field]);
  return missingFields;
};

class StudentController {
  async createStudent(req, res) {
    try {
      const studentData = req.body;

      // Ensure school is provided in body or from auth middleware
      if (!studentData.school && !req.schoolId) {
        return res.status(400).json({ message: 'School is required' });
      }
      // Set school from middleware if not provided explicitly
      studentData.school = studentData.school || req.schoolId;

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

  // Create many students sequentially with validation and school association
  async createManyStudents(req, res) {
    try {
      const studentsArray = req.body?.students;
      // console.log(req.body)

      if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
        return res.status(400).json({ message: 'Request body must be a non-empty array of students' });
      }

      const savedStudents = [];
      const errors = [];

      for (let i = 0; i < studentsArray.length; i++) {
        const studentData = studentsArray[i];

        // Ensure school is set from middleware if not provided
        studentData.school = studentData.school || req.schoolId;

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
      console.log( // 207 Multi-Status to show partial success/fail
        // message: `${savedStudents.length} students created, ${errors.length} errors`,
        // savedStudents,
        errors[0]
      )
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

  // Register a student for a school with user and class validation
  async registerStudent(req, res) {
    try {
      const { userId, classesId } = req.body;

      // School from middleware
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if student already exists in this school
      const existingStudent = await Student.findOne({ user: userId, school: schoolId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student already registered in this school' });
      }

      // Check if class exists and belongs to the school
      if (classesId) {
        const classes = await Classes.findOne({ _id: classesId, school: schoolId });
        if (!classes) {
          return res.status(404).json({ message: 'Class not found in this school' });
        }
      }

      // Create new student with school association
      const student = new Student({
        user: userId,
        classInfo: classesId,
        school: schoolId
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

  // Get all students filtered by school
  async getAllStudents(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const students = await Student.find({ school: schoolId })
        .populate({
          path: 'classInfo'
        });

      res.json({ students });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  async getAllStudentsBySchool(req, res) {
    try {
      const schoolId = req.params.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const students = await Student.find({ school: schoolId })
        .populate({
          path: 'classInfo'
        });

      res.json({ students });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get single student by id and ensure it belongs to the school
  async getStudentById(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const student = await Student.findOne({ _id: req.params.id, school: schoolId })
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('classInfo', 'classesName')
        .populate('academicYears');

      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      res.json({ student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getStudentByUserId(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const student = await Student.findOne({ user: req.params.userId, school: schoolId })
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('classInfo', 'classesName')
        .populate('academicYears');

      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      res.json({ student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async updateStudent(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const { classesId } = req.body;

      // Check if class exists and belongs to school if provided
      if (classesId) {
        const classes = await Classes.findOne({ _id: classesId, school: schoolId });
        if (!classes) {
          return res.status(404).json({ message: 'Class not found in this school' });
        }
      }

      // Ensure the student belongs to the school before updating
      const student = await Student.findOneAndUpdate(
        { _id: req.params.id, school: schoolId },
        { classInfo: classesId },
        { new: true }
      )
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('classInfo', 'classesName');

      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      if (classesId) {
        // Remove student from all classes in this school
        await Classes.updateMany(
          { school: schoolId, studentList: student._id },
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
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      // Find student within school
      const student = await Student.findOne({ _id: req.params.id, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      // Remove student from classes within this school
      await Classes.updateMany(
        { school: schoolId, studentList: student._id },
        { $pull: { studentList: student._id } }
      );

      // Delete student
      await Student.findByIdAndDelete(req.params.id);

      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getStudentAcademicPerformance(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const studentId = req.params.id;
      const { year } = req.query;

      // Validate student belongs to school
      const student = await Student.findOne({ _id: studentId, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      // Query academic years for student
      const query = { student: studentId };
      if (year) {
        query.year = year;
      }

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

  async getStudentsByClass(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const classId = req.params.classId;

      // Validate class belongs to school
      const classExists = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classExists) {
        return res.status(404).json({ message: 'Class not found in this school' });
      }

      // Get students in class belonging to school
      const students = await Student.find({ classInfo: classId, school: schoolId })
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('classInfo', 'classesName');

      res.json({ students });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }


  // Get students with academic performance below threshold (school-scoped)
  async getStudentsAtRisk(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const { year, threshold = 10 } = req.query;
      if (!year) {
        return res.status(400).json({ message: 'Academic year is required' });
      }

      // Custom static method should be adapted to also filter by school if needed
      const atRiskStudents = await AcademicYear.findStudentsAtRisk(year, threshold);

      // Filter students that belong to this school
      const filteredAtRiskStudents = [];
      for (const record of atRiskStudents) {
        const studentInfo = await Student.findOne({ _id: record.student, school: schoolId })
          .populate('user', 'firstName lastName email');
        if (!studentInfo) continue; // skip if student not in this school

        filteredAtRiskStudents.push({
          studentId: record.student,
          name: studentInfo.user ? `${studentInfo.user.firstName} ${studentInfo.user.lastName}` : 'Unknown',
          email: studentInfo.user?.email || 'N/A',
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
        });
      }

      res.json({ atRiskStudents: filteredAtRiskStudents });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get student attendance summary (school-scoped)
  async getStudentAttendance(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const { id } = req.params;
      const { year } = req.query;

      // Validate student belongs to this school
      const student = await Student.findOne({ _id: id, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      const query = { student: id };
      if (year) query.year = year;

      const academicYears = await AcademicYear.find(query)
        .populate('terms.termInfo')
        .populate('terms.sequences.sequenceInfo');

      if (!academicYears.length) {
        return res.status(404).json({ message: 'No academic records found for this student' });
      }

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

  // Update student by ID (school-scoped)
  async updateStudentById(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const { id } = req.params;
      const updates = req.body;

      // Ensure student belongs to this school before updating
      const student = await Student.findOneAndUpdate(
        { _id: id, school: schoolId },
        updates,
        { new: true, runValidators: true }
      );

      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      res.json({ message: 'Student updated successfully', student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete student by ID (school-scoped)
  async deleteStudentById(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const { id } = req.params;

      // Ensure student belongs to this school before deletion
      const student = await Student.findOneAndDelete({ _id: id, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      res.json({ message: 'Student deleted successfully', student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Change student status (school-scoped)
  async changeStatus(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'suspended', 'graduated', 'withdrawn'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      // Update only if student belongs to this school
      const student = await Student.findOneAndUpdate(
        { _id: id, school: schoolId },
        { status },
        { new: true }
      );

      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      res.json({ message: 'Status updated successfully', student });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new StudentController();