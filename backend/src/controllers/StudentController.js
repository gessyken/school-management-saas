import Student from '../models/Student.js';
import User from '../models/User.js';
import Classes from '../models/Classes.js';

// Helper: Normalize and validate student data (following your Class controller pattern)
function normalizeAndValidateStudent(data) {
  const result = { ...data };

  // Set defaults
  if (!result.status) result.status = 'active';
  if (!result.academicStatus) result.academicStatus = 'regular';
  if (!result.nationality) result.nationality = 'Cameroonian';
  if (result.average === undefined) result.average = 0;
  if (result.attendanceRate === undefined) result.attendanceRate = 0;
  if (result.isActive === undefined) result.isActive = true;
  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'level', 'dateOfBirth', 'gender', 'parentName', 'parentPhone', 'enrollmentDate'];
  const missingFields = requiredFields.filter(field => !result[field]);

  if (missingFields.length > 0) {
    return { error: 'Missing required fields', missingFields };
  }

  if (result.enrollmentYear === undefined) result.enrollmentYear = new Date(result.enrollmentDate).getMonth() >= 8 ? `${new Date(result.enrollmentDate).getFullYear()}-${new Date(result.enrollmentDate).getFullYear() + 1}` : `${new Date(result.enrollmentDate).getFullYear() - 1}-${new Date(result.enrollmentDate).getFullYear()}`;
  // if (result.enrollmentYear === undefined) result.enrollmentYear = result.enrollmentDate.getMonth() >= 8 ? `${result.enrollmentDate.getFullYear()}-${result.enrollmentDate.getFullYear() + 1}` : `${result.enrollmentDate.getFullYear() - 1}-${result.enrollmentDate.getFullYear()}`;
  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (result.email && !emailRegex.test(result.email)) {
    return { error: 'Invalid email format' };
  }

  // Validate gender
  if (!['male', 'female', 'other'].includes(result.gender)) {
    return { error: 'Invalid gender' };
  }

  // Validate status
  if (!['active', 'inactive', 'graduated', 'transferred', 'suspended', 'withdrawn'].includes(result.status)) {
    return { error: 'Invalid status' };
  }

  // Validate academic status
  if (!['regular', 'repeating', 'advanced'].includes(result.academicStatus)) {
    return { error: 'Invalid academic status' };
  }

  // Validate average
  if (result.average < 0 || result.average > 20) {
    return { error: 'Average must be between 0 and 20' };
  }

  // Validate attendance rate
  if (result.attendanceRate < 0 || result.attendanceRate > 100) {
    return { error: 'Attendance rate must be between 0 and 100' };
  }

  // Validate date of birth (reasonable age range for students)
  if (result.dateOfBirth) {
    const birthDate = new Date(result.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 2 || age > 25) {
      return { error: 'Date of birth seems invalid for a student' };
    }
  }

  // Trim string fields
  const stringFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city',
    'parentName', 'parentEmail', 'parentPhone', 'parentOccupation',
    'parentAddress', 'birthPlace', 'nationality'];

  stringFields.forEach(field => {
    if (result[field]) result[field] = result[field].trim();
  });

  return { data: result };
}
// Internal method to add student to class (reusable)
async function addStudentToClassInternal(studentId, classId, schoolId) {
  // Validate class exists in school
  const classData = await Classes.findOne({ _id: classId, school: schoolId });
  if (!classData) {
    throw new Error('Class not found in this school');
  }

  // Validate student exists in school
  const student = await Student.findOne({ _id: studentId, school: schoolId });
  if (!student) {
    throw new Error('Student not found in this school');
  }

  // Check if student is already in this class
  if (classData.studentList.includes(studentId)) {
    throw new Error('Student already in this class');
  }

  // Check class capacity
  if (classData.currentStudents >= classData.capacity) {
    throw new Error('Class is at full capacity');
  }

  // Validate student level matches class level
  if (student.level && classData.level && student.level !== classData.level) {
    throw new Error(`Student level (${student.level}) does not match class level (${classData.level})`);
  }

  // Add student to class studentList
  classData.studentList.push(studentId);
  classData.currentStudents = classData.studentList.length;

  await classData.save();

  return classData;
}
class StudentController {
  // Create student with comprehensive validation
  // Create student with comprehensive validation and class assignment
  async createStudent(req, res) {
    try {
      const studentData = req.body;
      const schoolId = req.schoolId;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      studentData.school = schoolId;
      studentData.createdBy = req.userId;
      console.log("studentData", req.body)

      // Normalize and validate student data
      const norm = normalizeAndValidateStudent(studentData);
      if (norm.error) {
        return res.status(400).json({
          message: norm.error,
          missingFields: norm.missingFields
        });
      }

      // Check if email already exists in school
      const existingStudent = await Student.findOne({
        email: norm.data.email,
        school: schoolId
      });

      if (existingStudent) {
        return res.status(409).json({ message: 'Email already exists in this school' });
      }

      const newStudent = new Student(norm.data);
      const savedStudent = await newStudent.save();

      // If class is assigned, add student to class
      if (savedStudent.class) {
        try {
          await addStudentToClassInternal(savedStudent._id, savedStudent.class, schoolId);
        } catch (error) {
          console.warn('Student created but class assignment failed:', error);
          // Continue with student creation even if class assignment fails
        }
      }

      // Populate the saved student for response
      const populatedStudent = await Student.findById(savedStudent._id)
        .populate('class', 'name level section educationSystem');

      req.log = {
        action: 'CREATE',
        module: 'Students',
        description: `Created new student '${savedStudent.firstName} ${savedStudent.lastName}'`,
        metadata: {
          studentId: savedStudent._id,
          level: savedStudent.level,
          class: savedStudent.class?.name || 'None'
        }
      };

      res.status(201).json({
        message: 'Student created successfully',
        student: populatedStudent
      });
    } catch (error) {
      console.error("Create student error:", error);
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'Duplicate field value entered',
          error: error.keyValue
        });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Create many students with comprehensive validation and class assignment
  async createManyStudents(req, res) {
    try {
      const studentsArray = req.body?.students;
      const schoolId = req.schoolId;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
        return res.status(400).json({ message: 'Request body must be a non-empty array of students' });
      }

      const savedStudents = [];
      const errors = [];

      for (let i = 0; i < studentsArray.length; i++) {
        const studentData = studentsArray[i];

        try {
          // Set school and createdBy
          studentData.school = schoolId;
          studentData.createdBy = req.userId;

          // Normalize and validate
          const norm = normalizeAndValidateStudent(studentData);
          if (norm.error) {
            errors.push({
              index: i,
              error: norm.error,
              missingFields: norm.missingFields
            });
            continue;
          }

          // Check for duplicate email
          const existingStudent = await Student.findOne({
            email: norm.data.email,
            school: schoolId
          });

          if (existingStudent) {
            errors.push({
              index: i,
              error: 'Email already exists in this school'
            });
            continue;
          }

          const student = new Student(norm.data);
          const savedStudent = await student.save();

          // If class is assigned, add student to class
          if (savedStudent.class) {
            try {
              await addStudentToClassInternal(savedStudent._id, savedStudent.class, schoolId);
            } catch (error) {
              console.warn(`Student ${savedStudent._id} created but class assignment failed:`, error);
              // Continue with student creation even if class assignment fails
            }
          }

          savedStudents.push(savedStudent);
        } catch (error) {
          if (error.code === 11000) {
            errors.push({
              index: i,
              error: 'Duplicate matricule or email',
              details: error.keyValue
            });
          } else {
            errors.push({
              index: i,
              error: error.message
            });
          }
        }
      }

      req.log = {
        action: 'CREATE',
        module: 'Students',
        description: `Bulk created students: ${savedStudents.length} success, ${errors.length} errors`,
        metadata: {
          count: savedStudents.length,
          errors: errors.length
        }
      };

      res.status(207).json({
        message: `${savedStudents.length} students created, ${errors.length} errors`,
        savedStudents,
        errors
      });

    } catch (error) {
      console.error("Create many students error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update student with class assignment handling
  async updateStudent(req, res) {
    try {
      const schoolId = req.schoolId;
      const studentId = req.params.id;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const existingStudent = await Student.findOne({ _id: studentId, school: schoolId });
      if (!existingStudent) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      const body = req.body || {};
      const previousClassId = existingStudent.class;

      // Check if email is being changed and if it conflicts
      if (body.email && body.email !== existingStudent.email) {
        const emailExists = await Student.findOne({
          email: body.email,
          school: schoolId,
          _id: { $ne: studentId }
        });

        if (emailExists) {
          return res.status(409).json({ message: 'Email already exists in this school' });
        }
      }

      // Merge with existing data
      // Merge with existing data
      const mergedData = {
        firstName: body.firstName || existingStudent.firstName,
        lastName: body.lastName || existingStudent.lastName,
        dateOfBirth: body.dateOfBirth || existingStudent.dateOfBirth,
        gender: body.gender || existingStudent.gender,
        email: body.email || existingStudent.email,
        phone: body.phone !== undefined ? body.phone : existingStudent.phone,
        address: body.address !== undefined ? body.address : existingStudent.address,
        city: body.city !== undefined ? body.city : existingStudent.city,
        parentName: body.parentName || existingStudent.parentName,
        parentEmail: body.parentEmail !== undefined ? body.parentEmail : existingStudent.parentEmail,
        parentPhone: body.parentPhone || existingStudent.parentPhone,
        parentOccupation: body.parentOccupation !== undefined ? body.parentOccupation : existingStudent.parentOccupation,
        parentAddress: body.parentAddress !== undefined ? body.parentAddress : existingStudent.parentAddress,
        class: body.classesId || body.class || existingStudent.class,
        status: body.status || existingStudent.status,
        academicStatus: body.academicStatus || existingStudent.academicStatus,
        average: body.average !== undefined ? body.average : existingStudent.average,
        attendanceRate: body.attendanceRate !== undefined ? body.attendanceRate : existingStudent.attendanceRate,
        birthPlace: body.birthPlace !== undefined ? body.birthPlace : existingStudent.birthPlace,
        nationality: body.nationality || existingStudent.nationality,
        bloodGroup: body.bloodGroup !== undefined ? body.bloodGroup : existingStudent.bloodGroup,
        allergies: body.allergies !== undefined ? body.allergies : existingStudent.allergies,
        medicalConditions: body.medicalConditions !== undefined ? body.medicalConditions : existingStudent.medicalConditions,
        emergencyContact: body.emergencyContact !== undefined ? body.emergencyContact : existingStudent.emergencyContact,
        avatar: body.avatar !== undefined ? body.avatar : existingStudent.avatar,
        isActive: body.isActive !== undefined ? body.isActive : existingStudent.isActive,
        // Add missing required fields for normalization
        level: body.level || existingStudent.level, // Required field
        enrollmentDate: body.enrollmentDate || existingStudent.enrollmentDate, // Required field
        // Optional fields that might be needed
        enrollmentYear: body.enrollmentYear || existingStudent.enrollmentYear,
        matricule: body.matricule || existingStudent.matricule,
        profilePicture: body.profilePicture !== undefined ? body.profilePicture : existingStudent.profilePicture
      };

      const norm = normalizeAndValidateStudent(mergedData);
      if (norm.error) {
        return res.status(400).json({
          message: norm.error,
          missingFields: norm.missingFields
        });
      }

      const updated = await Student.findByIdAndUpdate(
        studentId,
        norm.data,
        { new: true, runValidators: true }
      ).populate('class', 'name level section');

      // Handle class assignment if class changed
      const newClassId = norm.data.class;
      console.log("newClassId", newClassId)
      console.log("previousClassId", previousClassId)
      if (newClassId && newClassId?.toString() !== previousClassId?.toString()) {
        try {
          // Remove from previous class if any
          if (previousClassId) {
            await Classes.findByIdAndUpdate(previousClassId, {
              $pull: { studentList: studentId }
            });
            console.log("studentId", studentId)
          }

          // Add to new class
          await addStudentToClassInternal(studentId, newClassId, schoolId);
          console.log("studentId", studentId)
        } catch (error) {
          console.warn('Student updated but class assignment failed:', error);
          // Continue with student update even if class assignment fails
        }
      }

      req.log = {
        action: 'UPDATE',
        module: 'Students',
        description: `Updated student ${updated.firstName} ${updated.lastName}`,
        metadata: { updatedFields: Object.keys(body) }
      };

      res.json({
        message: 'Student updated successfully',
        student: updated
      });
    } catch (error) {
      console.error("Update student error:", error);
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'Duplicate field value entered'
        });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all students with filtering and pagination (frontend compatible)
  async getAllStudents(req, res) {
    try {
      const schoolId = req.schoolId;
      const { search, class: classId, status, level, page = 1, limit = 50 } = req.query;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const query = { school: schoolId };

      // Apply filters
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { matricule: { $regex: search, $options: 'i' } }
        ];
      }

      if (classId && classId !== 'all') {
        query.class = classId;
      }

      if (status) {
        query.status = status;
      }

      if (level) {
        query.level = level;
      }

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const students = await Student.find(query)
        .populate('class', 'name level section educationSystem teacher room')
        .sort({ lastName: 1, firstName: 1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Student.countDocuments(query);

      // Transform data for frontend compatibility
      const transformedStudents = students

      req.log = {
        action: 'VIEW',
        module: 'Students',
        description: `Fetched students for school`,
        metadata: {
          filters: { search, class: classId, status, level },
          count: students.length,
          total,
          page: pageNum
        }
      };

      res.json({
        students: transformedStudents,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalStudents: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      console.error("Get all students error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get single student by ID
  async getStudentById(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const student = await Student.findOne({ _id: req.params.id, school: schoolId })
        .populate('class', 'name level section educationSystem teacher room')
        .populate('createdBy', 'firstName lastName');

      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      // Transform for frontend compatibility
      const studentData = {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        class: student.class?.name || '',
        classesId: student.class?._id || '', // For frontend class selection
        average: student.average,
        status: student.status,
        enrollmentDate: student.enrollmentDate,
        address: student.address,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
        birthDate: student.dateOfBirth,
        avatar: student.avatar || student.profilePicture,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        city: student.city,
        nationality: student.nationality,
        parentOccupation: student.parentOccupation,
        bloodGroup: student.bloodGroup,
        allergies: student.allergies,
        medicalConditions: student.medicalConditions,
        emergencyContact: student.emergencyContact,
        level: student.level,
        matricule: student.matricule,
        enrollmentYear: student.enrollmentYear,
        academicStatus: student.academicStatus
      };

      req.log = {
        action: 'VIEW',
        module: 'Students',
        description: `Viewed student ${studentData.name}`,
        metadata: { studentId: req.params.id }
      };

      res.json({ student: studentData });
    } catch (error) {
      console.error("Get student error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Add student to class (with level validation)
  async addStudentToClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const { studentId, classId } = req.body;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      if (!studentId || !classId) {
        return res.status(400).json({ message: 'Student ID and Class ID are required' });
      }

      // Validate student exists in school
      const student = await Student.findOne({ _id: studentId, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      // Validate class exists in school
      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found in this school' });
      }

      // Validate student level matches class level
      if (student.level !== classData.level) {
        return res.status(400).json({
          message: `Student level (${student.level}) does not match class level (${classData.level})`
        });
      }

      // Check if student is already in this class
      if (student.class && student.class.toString() === classId) {
        return res.status(400).json({ message: 'Student is already in this class' });
      }

      // Check class capacity
      if (classData.currentStudents >= classData.capacity) {
        return res.status(400).json({ message: 'Class is at full capacity' });
      }

      // Remove student from previous class if any
      if (student.class) {
        await Classes.findByIdAndUpdate(student.class, {
          $pull: { studentList: studentId }
        });
      }

      // Add student to new class
      student.class = classId;
      await student.save();

      // Update class student list
      await Classes.findByIdAndUpdate(classId, {
        $addToSet: { studentList: studentId }
      });

      const updatedStudent = await Student.findById(studentId)
        .populate('class', 'name level section');

      req.log = {
        action: 'UPDATE',
        module: 'Students',
        description: `Added student to class ${classData.name}`,
        metadata: { studentId, classId, className: classData.name }
      };

      res.json({
        message: 'Student added to class successfully',
        student: updatedStudent
      });
    } catch (error) {
      console.error("Add student to class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Change student's class (with level validation)
  async changeStudentClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const studentId = req.params.id;
      const { classId } = req.body;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      if (!classId) {
        return res.status(400).json({ message: 'Class ID is required' });
      }

      // Validate student exists in school
      const student = await Student.findOne({ _id: studentId, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      // Validate class exists in school
      const newClass = await Classes.findOne({ _id: classId, school: schoolId });
      if (!newClass) {
        return res.status(404).json({ message: 'Class not found in this school' });
      }

      // Validate student level matches class level
      if (student.level !== newClass.level) {
        return res.status(400).json({
          message: `Student level (${student.level}) does not match class level (${newClass.level})`
        });
      }

      // Check if student is already in this class
      if (student.class && student.class.toString() === classId) {
        return res.status(400).json({ message: 'Student is already in this class' });
      }

      // Check new class capacity
      if (newClass.currentStudents >= newClass.capacity) {
        return res.status(400).json({ message: 'New class is at full capacity' });
      }

      // Remove student from previous class if any
      if (student.class) {
        await Classes.findByIdAndUpdate(student.class, {
          $pull: { studentList: studentId }
        });
      }

      // Add student to new class
      student.class = classId;
      await student.save();

      // Update new class student list
      await Classes.findByIdAndUpdate(classId, {
        $addToSet: { studentList: studentId }
      });

      const updatedStudent = await Student.findById(studentId)
        .populate('class', 'name level section');

      req.log = {
        action: 'UPDATE',
        module: 'Students',
        description: `Changed student class to ${newClass.name}`,
        metadata: {
          studentId,
          classId,
          className: newClass.name,
          previousClass: student.class ? student.class.toString() : 'None'
        }
      };

      res.json({
        message: 'Student class changed successfully',
        student: updatedStudent
      });
    } catch (error) {
      console.error("Change student class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Remove student from class
  async removeStudentFromClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const studentId = req.params.id;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      // Validate student exists in school
      const student = await Student.findOne({ _id: studentId, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      if (!student.class) {
        return res.status(400).json({ message: 'Student is not assigned to any class' });
      }

      const classId = student.class;

      // Remove student from class
      student.class = undefined;
      await student.save();

      // Update class student list
      await Classes.findByIdAndUpdate(classId, {
        $pull: { studentList: studentId }
      });

      const updatedStudent = await Student.findById(studentId);

      req.log = {
        action: 'UPDATE',
        module: 'Students',
        description: `Removed student from class`,
        metadata: { studentId, classId }
      };

      res.json({
        message: 'Student removed from class successfully',
        student: updatedStudent
      });
    } catch (error) {
      console.error("Remove student from class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // // Update student with comprehensive validation
  // async updateStudent(req, res) {
  //   try {
  //     const schoolId = req.schoolId;
  //     const studentId = req.params.id;

  //     if (!schoolId) {
  //       return res.status(400).json({ message: 'School context required' });
  //     }

  //     const existingStudent = await Student.findOne({ _id: studentId, school: schoolId });
  //     if (!existingStudent) {
  //       return res.status(404).json({ message: 'Student not found in this school' });
  //     }

  //     const body = req.body || {};

  //     // Check if email is being changed and if it conflicts
  //     if (body.email && body.email !== existingStudent.email) {
  //       const emailExists = await Student.findOne({
  //         email: body.email,
  //         school: schoolId,
  //         _id: { $ne: studentId }
  //       });

  //       if (emailExists) {
  //         return res.status(409).json({ message: 'Email already exists in this school' });
  //       }
  //     }

  //     // Merge with existing data
  //     const mergedData = {
  //       firstName: body.firstName || existingStudent.firstName,
  //       lastName: body.lastName || existingStudent.lastName,
  //       dateOfBirth: body.dateOfBirth || existingStudent.dateOfBirth,
  //       gender: body.gender || existingStudent.gender,
  //       email: body.email || existingStudent.email,
  //       phone: body.phone !== undefined ? body.phone : existingStudent.phone,
  //       address: body.address !== undefined ? body.address : existingStudent.address,
  //       city: body.city !== undefined ? body.city : existingStudent.city,
  //       parentName: body.parentName || existingStudent.parentName,
  //       parentEmail: body.parentEmail !== undefined ? body.parentEmail : existingStudent.parentEmail,
  //       parentPhone: body.parentPhone || existingStudent.parentPhone,
  //       parentOccupation: body.parentOccupation !== undefined ? body.parentOccupation : existingStudent.parentOccupation,
  //       parentAddress: body.parentAddress !== undefined ? body.parentAddress : existingStudent.parentAddress,
  //       level: body.level || existingStudent.level,
  //       class: body.classesId || body.class || existingStudent.class,
  //       status: body.status || existingStudent.status,
  //       academicStatus: body.academicStatus || existingStudent.academicStatus,
  //       average: body.average !== undefined ? body.average : existingStudent.average,
  //       attendanceRate: body.attendanceRate !== undefined ? body.attendanceRate : existingStudent.attendanceRate,
  //       birthPlace: body.birthPlace !== undefined ? body.birthPlace : existingStudent.birthPlace,
  //       nationality: body.nationality || existingStudent.nationality,
  //       bloodGroup: body.bloodGroup !== undefined ? body.bloodGroup : existingStudent.bloodGroup,
  //       allergies: body.allergies !== undefined ? body.allergies : existingStudent.allergies,
  //       medicalConditions: body.medicalConditions !== undefined ? body.medicalConditions : existingStudent.medicalConditions,
  //       emergencyContact: body.emergencyContact !== undefined ? body.emergencyContact : existingStudent.emergencyContact,
  //       avatar: body.avatar !== undefined ? body.avatar : existingStudent.avatar,
  //       profilePicture: body.profilePicture !== undefined ? body.profilePicture : existingStudent.profilePicture,
  //       isActive: body.isActive !== undefined ? body.isActive : existingStudent.isActive,
  //       enrollmentYear: body.enrollmentYear || existingStudent.enrollmentYear
  //     };

  //     const norm = normalizeAndValidateStudent(mergedData);
  //     if (norm.error) {
  //       return res.status(400).json({
  //         message: norm.error,
  //         missingFields: norm.missingFields
  //       });
  //     }

  //     const updated = await Student.findByIdAndUpdate(
  //       studentId,
  //       norm.data,
  //       { new: true, runValidators: true }
  //     ).populate('class', 'name level section');

  //     req.log = {
  //       action: 'UPDATE',
  //       module: 'Students',
  //       description: `Updated student ${updated.firstName} ${updated.lastName}`,
  //       metadata: { updatedFields: Object.keys(body) }
  //     };

  //     res.json({
  //       message: 'Student updated successfully',
  //       student: updated
  //     });
  //   } catch (error) {
  //     console.error("Update student error:", error);
  //     if (error.code === 11000) {
  //       return res.status(409).json({
  //         message: 'Duplicate field value entered'
  //       });
  //     }
  //     res.status(500).json({ message: 'Server error', error: error.message });
  //   }
  // }

  // Delete student
  async deleteStudent(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const student = await Student.findOne({ _id: req.params.id, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      // Remove student from class if assigned
      if (student.class) {
        await Classes.findByIdAndUpdate(student.class, {
          $pull: { studentList: req.params.id }
        });
      }

      await Student.findByIdAndDelete(req.params.id);

      req.log = {
        action: 'DELETE',
        module: 'Students',
        description: `Deleted student ${student.firstName} ${student.lastName}`,
        metadata: { studentId: req.params.id }
      };

      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get student statistics
  async getStudentStatistics(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const stats = await Student.aggregate([
        { $match: { school: schoolId } },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            activeStudents: { $sum: { $cond: ['$isActive', 1, 0] } },
            averageGrade: { $avg: '$average' },
            averageAttendance: { $avg: '$attendanceRate' },
            totalMale: { $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] } },
            totalFemale: { $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] } }
          }
        }
      ]);

      const statusStats = await Student.aggregate([
        { $match: { school: schoolId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const levelStats = await Student.aggregate([
        { $match: { school: schoolId } },
        {
          $group: {
            _id: '$level',
            count: { $sum: 1 },
            averageGrade: { $avg: '$average' }
          }
        }
      ]);

      const classStats = await Student.aggregate([
        { $match: { school: schoolId, class: { $ne: null } } },
        {
          $lookup: {
            from: 'classes',
            localField: 'class',
            foreignField: '_id',
            as: 'classInfo'
          }
        },
        { $unwind: '$classInfo' },
        {
          $group: {
            _id: '$classInfo.name',
            count: { $sum: 1 },
            averageGrade: { $avg: '$average' }
          }
        }
      ]);

      const result = stats[0] || {
        totalStudents: 0,
        activeStudents: 0,
        averageGrade: 0,
        averageAttendance: 0,
        totalMale: 0,
        totalFemale: 0
      };

      const statusBreakdown = statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      const levelBreakdown = levelStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          averageGrade: stat.averageGrade || 0
        };
        return acc;
      }, {});

      const classBreakdown = classStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          averageGrade: stat.averageGrade || 0
        };
        return acc;
      }, {});

      req.log = {
        action: 'VIEW',
        module: 'Students',
        description: 'Fetched student statistics'
      };

      res.json({
        statistics: {
          ...result,
          statusBreakdown,
          levelBreakdown,
          classBreakdown,
          genderRatio: {
            male: result.totalMale,
            female: result.totalFemale,
            other: result.totalStudents - result.totalMale - result.totalFemale
          }
        }
      });
    } catch (error) {
      console.error("Get student statistics error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get students by class
  async getStudentsByClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.classId;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      // Validate class belongs to school
      const classExists = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classExists) {
        return res.status(404).json({ message: 'Class not found in this school' });
      }

      const students = await Student.find({ class: classId, school: schoolId })
        .populate('class', 'name level section')
        .sort({ lastName: 1, firstName: 1 });

      res.json({
        students,
        class: {
          id: classExists._id,
          name: classExists.name,
          level: classExists.level,
          section: classExists.section,
          studentCount: students.length
        }
      });
    } catch (error) {
      console.error("Get students by class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Change student status
  async changeStatus(req, res) {
    try {
      const schoolId = req.schoolId;
      const studentId = req.params.id;
      const { status } = req.body;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      if (!['active', 'inactive', 'graduated', 'transferred', 'suspended', 'withdrawn'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      const student = await Student.findOneAndUpdate(
        { _id: studentId, school: schoolId },
        { status },
        { new: true }
      ).populate('class', 'name level section');

      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      req.log = {
        action: 'UPDATE',
        module: 'Students',
        description: `Changed student status to ${status}`,
        metadata: { studentId, status }
      };

      res.json({
        message: 'Student status updated successfully',
        student
      });
    } catch (error) {
      console.error("Change student status error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Toggle student active status
  async toggleStudentStatus(req, res) {
    try {
      const schoolId = req.schoolId;
      const studentId = req.params.id;

      if (!schoolId) {
        return res.status(400).json({ message: 'School context required' });
      }

      const student = await Student.findOne({ _id: studentId, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      student.isActive = !student.isActive;
      if (!student.isActive) {
        student.status = 'inactive';
      }
      await student.save();

      const populatedStudent = await Student.findById(student._id)
        .populate('class', 'name level section');

      req.log = {
        action: 'UPDATE',
        module: 'Students',
        description: `${student.isActive ? 'Activated' : 'Deactivated'} student ${student.firstName} ${student.lastName}`,
        metadata: { isActive: student.isActive }
      };

      res.json({
        message: `Student ${student.isActive ? 'activated' : 'deactivated'} successfully`,
        student: populatedStudent
      });
    } catch (error) {
      console.error("Toggle student status error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new StudentController();