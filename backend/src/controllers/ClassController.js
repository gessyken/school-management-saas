import Classes from '../models/Classes.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import AcademicYear from '../models/AcademicYear.js';
import User from '../models/User.js';

// Helper: Normalize and validate class data
function normalizeAndValidate(payload) {
  const result = { ...payload };

  // Normalize level
  result.level = levelAliasToName(result.level);

  // Set defaults
  if (!result.section) result.section = 'A';
  if (!result.educationSystem) result.educationSystem = 'francophone';
  if (!result.status) result.status = 'Open';
  if (!result.year) result.year = computeDefaultAcademicYear();
  if (!result.capacity) result.capacity = 30;
  if (result.currentStudents === undefined) result.currentStudents = 0;
  if (!result.teacher) result.teacher = 'Non assigné';
  if (!result.room) result.room = '';
  if (result.isActive === undefined) result.isActive = true;
  
  // Handle mainTeacher - ensure it's either a valid ObjectId or undefined
  if (result.mainTeacher === '' || result.mainTeacher === null) {
    result.mainTeacher = undefined;
  }

  // Validate required fields
  if (!result.level) {
    return { error: 'Le niveau est requis' };
  }

  // Validate level enum
  const allowedLevels = [
    '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale',
    'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'
  ];
  if (!allowedLevels.includes(result.level)) {
    return { error: `Niveau invalide '${result.level}'.` };
  }

  // Validate educationSystem
  if (!['francophone', 'anglophone', 'bilingue'].includes(result.educationSystem)) {
    return { error: `Système éducatif invalide '${result.educationSystem}'.` };
  }

  // Validate section based on education system
  const francophoneSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const anglophoneSections = ['A', 'B', 'C', 'D'];
  const bilingualSections = ['A', 'B', 'C', 'D', 'E'];

  const sectionMap = {
    'francophone': francophoneSections,
    'anglophone': anglophoneSections,
    'bilingue': bilingualSections
  };

  const allowedSections = sectionMap[result.educationSystem];
  if (!allowedSections) {
    return { error: `Système éducatif non supporté '${result.educationSystem}'.` };
  }

  if (!allowedSections.includes(result.section)) {
    return { error: `Section invalide '${result.section}' pour le système ${result.educationSystem}. Sections autorisées: ${allowedSections.join(', ')}` };
  }

  // Validate specialty rules
  const isTerminalLevel = result.level === 'Terminale' || result.level === 'Upper Sixth';
  if (result.specialty) {
    if (!isTerminalLevel) {
      return { error: 'La spécialité est seulement autorisée pour les niveaux Terminale ou Upper Sixth' };
    }
    
    // Validate specialty format based on education system
    if (result.educationSystem === 'francophone') {
      const francophoneSpecialties = ['A', 'B', 'C', 'D', 'E', 'F', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3', 'TI'];
      if (!francophoneSpecialties.includes(result.specialty)) {
        return { error: `Spécialité invalide '${result.specialty}' pour le système francophone.` };
      }
    } else if (result.educationSystem === 'anglophone') {
      const anglophoneSpecialties = ['Arts', 'Commercial', 'Industrial', 'Science', 'GCE A-Level Arts', 'GCE A-Level Science'];
      if (!anglophoneSpecialties.includes(result.specialty)) {
        return { error: `Spécialité invalide '${result.specialty}' pour le système anglophone.` };
      }
    }
    // For bilingual system, accept specialties from both systems
  }

  // Validate capacity
  if (result.capacity < 1 || result.capacity > 100) {
    return { error: 'La capacité doit être comprise entre 1 et 100' };
  }

  // Validate current students
  if (result.currentStudents < 0) {
    return { error: 'Le nombre d\'étudiants actuels ne peut pas être négatif' };
  }
  if (result.currentStudents > result.capacity) {
    return { error: `Le nombre d'étudiants actuels (${result.currentStudents}) ne peut pas dépasser la capacité (${result.capacity})` };
  }

  // Validate teacher field
  if (!result.teacher || result.teacher.trim() === '') {
    return { error: 'Le nom du professeur principal est requis' };
  }

  // Validate room field
  if (!result.room || result.room.trim() === '') {
    return { error: 'La salle est requise' };
  }

  // Validate mainTeacher format if provided
  if (result.mainTeacher && result.mainTeacher !== undefined) {
    // Check if it's a valid MongoDB ObjectId format (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(result.mainTeacher)) {
      return { error: 'Format invalide pour le professeur titulaire' };
    }
  }

  // Validate academic year format
  const yearRegex = /^\d{4}-\d{4}$/;
  if (result.year && !yearRegex.test(result.year)) {
    return { error: 'Format d\'année académique invalide. Utilisez le format: YYYY-YYYY' };
  }

  // Validate year range (reasonable academic years)
  if (result.year) {
    const [startYear, endYear] = result.year.split('-').map(Number);
    const currentYear = new Date().getFullYear();
    
    if (startYear >= endYear) {
      return { error: 'L\'année de début doit être inférieure à l\'année de fin' };
    }
    
    if (startYear < currentYear - 5 || startYear > currentYear + 2) {
      return { error: 'L\'année académique semble invalide. Vérifiez les dates.' };
    }
  }

  // Trim string fields
  if (result.teacher) result.teacher = result.teacher.trim();
  if (result.room) result.room = result.room.trim();
  if (result.description) result.description = result.description.trim();
  if (result.name) result.name = result.name.trim();
  result.name = result.level+result.section
  return { data: result };
}

// Helper: Convert level alias to display name
function levelAliasToName(alias) {
  if (!alias) return alias;
  const map = new Map([
    // Francophone ids -> display
    ['6eme', '6ème'], ['5eme', '5ème'], ['4eme', '4ème'], ['3eme', '3ème'],
    ['2nde', '2nde'], ['1ere', '1ère'], ['terminale', 'Terminale'],
    // Anglophone ids -> display
    ['form1', 'Form 1'], ['form2', 'Form 2'], ['form3', 'Form 3'],
    ['form4', 'Form 4'], ['form5', 'Form 5'], ['lower6', 'Lower Sixth'], ['upper6', 'Upper Sixth']
  ]);
  const values = Array.from(map.values());
  if (values.includes(alias)) return alias;
  return map.get(String(alias)) || alias;
}

// Helper: Compute default academic year
function computeDefaultAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

class ClassController {




  // GET /classes - Get all classes with filtering
  async getAllClasses(req, res) {
    try {
      const { year, status, level, educationSystem, search, page = 1, limit = 50 } = req.query;
      const schoolId = req.schoolId;

      const query = { school: schoolId };

      // Apply filters
      if (year) query.year = year;
      if (status) query.status = status;
      if (level) query.level = levelAliasToName(level);
      if (educationSystem) query.educationSystem = educationSystem;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { teacher: { $regex: search, $options: 'i' } },
          { room: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const classes = await Classes.find(query)
        .populate('subjects', 'name code coefficient color')
        .populate('subjectDetails.subject', 'name code coefficient weeklyHours color')
        .populate('mainTeacher', 'firstName lastName email')
        .populate('studentList', 'firstName lastName studentId')
        .sort({ level: 1, section: 1, name: 1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Classes.countDocuments(query);

      req.log = {
        action: 'VIEW',
        module: 'Classes',
        description: `Fetched classes for school`,
        metadata: {
          filters: { year, status, level, educationSystem, search },
          count: classes.length,
          total,
          page: pageNum
        }
      };

      res.json({
        classes,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalClasses: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      console.error("Get all classes error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // GET /classes/stats - Get class statistics
  async getClassStatistics(req, res) {
    try {
      const schoolId = req.schoolId;

      const stats = await Classes.aggregate([
        { $match: { school: schoolId } },
        {
          $group: {
            _id: null,
            totalClasses: { $sum: 1 },
            totalStudents: { $sum: '$currentStudents' },
            totalCapacity: { $sum: '$capacity' },
            activeClasses: { $sum: { $cond: ['$isActive', 1, 0] } },
            openClasses: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
            averageAttendance: { $avg: '$attendanceRate' },
            averageGrade: { $avg: '$averageGrade' }
          }
        }
      ]);

      const systemStats = await Classes.aggregate([
        { $match: { school: schoolId } },
        {
          $group: {
            _id: '$educationSystem',
            count: { $sum: 1 },
            students: { $sum: '$currentStudents' },
            capacity: { $sum: '$capacity' }
          }
        }
      ]);

      const levelStats = await Classes.aggregate([
        { $match: { school: schoolId } },
        {
          $group: {
            _id: '$level',
            count: { $sum: 1 },
            students: { $sum: '$currentStudents' }
          }
        }
      ]);

      const result = stats[0] || {
        totalClasses: 0,
        totalStudents: 0,
        totalCapacity: 0,
        activeClasses: 0,
        openClasses: 0,
        averageAttendance: 0,
        averageGrade: 0
      };

      // Process statistics
      const systemBreakdown = systemStats.reduce((acc, stat) => {
        acc[stat._id] = {
          classes: stat.count,
          students: stat.students,
          capacity: stat.capacity,
          utilization: stat.capacity > 0 ? Math.round((stat.students / stat.capacity) * 100) : 0
        };
        return acc;
      }, {});

      const levelBreakdown = levelStats.reduce((acc, stat) => {
        acc[stat._id] = {
          classes: stat.count,
          students: stat.students
        };
        return acc;
      }, {});

      req.log = {
        action: 'VIEW',
        module: 'Classes',
        description: 'Fetched class statistics'
      };

      res.json({
        statistics: {
          ...result,
          systemBreakdown,
          levelBreakdown,
          utilizationRate: result.totalCapacity > 0 ?
            Math.round((result.totalStudents / result.totalCapacity) * 100) : 0
        }
      });
    } catch (error) {
      console.error("Get class statistics error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // GET /classes/level/:level - Get classes by level
  async getClassesByLevel(req, res) {
    try {
      const { level } = req.params;
      const { educationSystem, activeOnly, year } = req.query;
      const schoolId = req.schoolId;

      const query = {
        school: schoolId,
        level: levelAliasToName(level)
      };

      if (educationSystem) query.educationSystem = educationSystem;
      if (activeOnly === 'true') query.isActive = true;
      if (year) query.year = year;

      const classes = await Classes.find(query)
        .populate('subjects', 'name code color')
        .populate('mainTeacher', 'firstName lastName')
        .populate('studentList', 'firstName lastName')
        .sort({ section: 1 });

      req.log = {
        action: 'VIEW',
        module: 'Classes',
        description: `Fetched classes for level ${level}`,
        metadata: { level, count: classes.length }
      };

      res.json({
        classes,
        level,
        count: classes.length
      });
    } catch (error) {
      console.error("Get classes by level error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // GET /classes/teacher/:teacherId - Get classes by teacher
  async getClassesByTeacher(req, res) {
    try {
      const { teacherId } = req.params;
      const schoolId = req.schoolId;

      // Verify teacher exists
      const teacher = await User.findOne({ _id: teacherId, school: schoolId, role: 'teacher' });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      const classes = await Classes.find({
        school: schoolId,
        $or: [
          { mainTeacher: teacherId },
          { 'subjectDetails.teacher': teacherId }
        ]
      })
        .populate('subjects', 'name code')
        .populate('mainTeacher', 'firstName lastName')
        .populate('studentList', 'firstName lastName')
        .sort({ level: 1, section: 1 });

      req.log = {
        action: 'VIEW',
        module: 'Classes',
        description: `Fetched classes for teacher ${teacherId}`,
        metadata: { teacherId, count: classes.length }
      };

      res.json({
        classes,
        teacher: {
          id: teacher._id,
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email
        },
        count: classes.length
      });
    } catch (error) {
      console.error("Get classes by teacher error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // GET /classes/:id - Get single class by ID
  async getClassById(req, res) {
    try {
      const classData = await Classes.findOne({ _id: req.params.id, school: req.schoolId })
        .populate('subjects', 'name code coefficient weeklyHours color description')
        .populate('subjectDetails.subject', 'name code coefficient weeklyHours color description')
        .populate('subjectDetails.teacher', 'firstName lastName email')
        .populate('mainTeacher', 'firstName lastName email phone')
        .populate('studentList', 'firstName lastName studentId dateOfBirth gender')
        .populate('createdBy', 'firstName lastName');

      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      req.log = {
        action: 'VIEW',
        module: 'Classes',
        description: `Viewed class ${classData.name}`,
        metadata: { classId: req.params.id }
      };

      res.json({ class: classData });
    } catch (error) {
      console.error("Get class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // POST /classes - Create class
  async createClass(req, res) {
    try {
      const body = req.body || {};
      const schoolId = req.schoolId;

      if (!schoolId) return res.status(403).json({ message: "School context missing" });

      // Auto-generate name if not provided
      if (!body.name && body.level && body.section) {
        const lvl = levelAliasToName(body.level);
        body.name = `${lvl} ${body.section}${(body.specialty ? ` (${body.specialty})` : '')}`.trim();
      }

      const norm = normalizeAndValidate(body);
      if (norm.error) {
        return res.status(400).json({ message: norm.error });
      }

      const classData = new Classes({
        ...norm.data,
        school: schoolId,
        createdBy: req.userId,
        studentList: [] // Initialize empty student list
      });

      await classData.save();

      // Populate the saved class
      const populatedClass = await Classes.findById(classData._id)
        .populate('subjects', 'name code')
        .populate('mainTeacher', 'firstName lastName');

      req.log = {
        action: 'CREATE',
        module: 'Classes',
        description: `Created new class '${classData.name}'`,
        metadata: {
          classId: classData._id,
          level: classData.level,
          educationSystem: classData.educationSystem,
          year: classData.year
        }
      };

      res.status(201).json({
        message: 'Class created successfully',
        class: populatedClass
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'A class with the same name and year already exists in this school.'
        });
      }
      console.error("Create class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // POST /classes/bulk - Bulk create classes
  async createManyClasses(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) return res.status(403).json({ message: "School context missing" });

      const items = Array.isArray(req.body?.classes) ? req.body.classes : [];
      if (items.length === 0) {
        return res.status(400).json({ message: 'Request body must include a non-empty array in "classes"' });
      }

      const saved = [];
      const errors = [];

      for (let i = 0; i < items.length; i++) {
        try {
          const raw = { ...(items[i] || {}) };

          // Auto-generate name if not provided
          if (!raw.name && raw.level && raw.section) {
            const lvl = levelAliasToName(raw.level);
            raw.name = `${lvl} ${raw.section}${(raw.specialty ? ` (${raw.specialty})` : '')}`.trim();
          }
          console.log("norm.data raw",raw)

          const norm = normalizeAndValidate(raw);
          if (norm.error) {
            console.log("err", norm.error)
            errors.push({ index: i, message: norm.error });
            continue;
          }
          console.log("norm.data",norm.data)
          const classData = new Classes({
            ...norm.data,
            school: schoolId,
            createdBy: req.userId,
            studentList: []
          });

          try {
            await classData.save();
            saved.push(classData);
          } catch (err) {
            console.log("err", err)
            if (err.code === 11000) {
              errors.push({ index: i, message: 'Duplicate: class with same name and year already exists' });
            } else {
              errors.push({ index: i, message: err.message });
            }
          }
        } catch (err) {
          console.log("err", err)
          errors.push({ index: i, message: err.message });
        }
      }

      req.log = {
        action: 'CREATE',
        module: 'Classes',
        description: `Bulk created classes: ${saved.length} success, ${errors.length} errors`,
        metadata: { count: saved.length, errors: errors.length }
      };

      return res.status(207).json({
        message: `${saved.length} classes created, ${errors.length} errors`,
        savedClasses: saved,
        errors
      });
    } catch (error) {
      console.error('Bulk create classes error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT /classes/:id - Update class
  async updateClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.id;

      const existingClass = await Classes.findOne({ _id: classId, school: schoolId });
      if (!existingClass) {
        return res.status(404).json({ message: 'Class not found' });
      }

      const body = req.body || {};
      console.log("body",body)
      // Auto-generate name if level, section, or specialty changed
      if ((body.level || body.section || body.specialty) && !body.name) {
        const lvl = levelAliasToName(body.level || existingClass.level);
        const sec = body.section || existingClass.section;
        const spec = body.specialty || existingClass.specialty;
        body.name = `${lvl} ${sec}${(spec ? ` (${spec})` : '')}`.trim();
      }

      // Merge with existing data
      const mergedData = {
        name: body.name || existingClass.name,
        description: body.description !== undefined ? body.description : existingClass.description,
        status: body.status || existingClass.status,
        capacity: body.capacity !== undefined ? body.capacity : existingClass.capacity,
        currentStudents: body.currentStudents !== undefined ? body.currentStudents : existingClass.currentStudents,
        teacher: body.teacher !== undefined ? body.teacher : existingClass.teacher,
        mainTeacher: body.mainTeacher !== undefined ? body.mainTeacher : existingClass.mainTeacher,
        room: body.room !== undefined ? body.room : existingClass.room,
        level: body.level || existingClass.level,
        educationSystem: body.educationSystem || existingClass.educationSystem,
        specialty: body.specialty !== undefined ? body.specialty : existingClass.specialty,
        section: body.section || existingClass.section,
        amountFee: body.amountFee !== undefined ? body.amountFee : existingClass.amountFee,
        subjects: body.subjects !== undefined ? body.subjects : existingClass.subjects,
        subjectDetails: body.subjectDetails !== undefined ? body.subjectDetails : existingClass.subjectDetails,
        year: body.year || existingClass.year,
        isActive: body.isActive !== undefined ? body.isActive : existingClass.isActive,
        averageGrade: body.averageGrade !== undefined ? body.averageGrade : existingClass.averageGrade,
        attendanceRate: body.attendanceRate !== undefined ? body.attendanceRate : existingClass.attendanceRate,
        schedule: body.schedule !== undefined ? body.schedule : existingClass.schedule
      };
      console.log("mergedData",mergedData)

      const norm = normalizeAndValidate(mergedData);
      if (norm.error) {
        return res.status(400).json({ message: norm.error });
      }
      console.log("norm.data",norm.data)

      const updated = await Classes.findByIdAndUpdate(
        classId,
        norm.data,
        { new: true, runValidators: true }
      )
        .populate('subjects', 'name code')
        .populate('subjectDetails.subject', 'name code')
        .populate('mainTeacher', 'firstName lastName');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Updated class ${updated.name}`,
        metadata: { updatedFields: Object.keys(body) }
      };

      res.json({ message: 'Class updated successfully', class: updated });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'A class with the same name and year already exists in this school.'
        });
      }
      console.error("Update class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PATCH /classes/:id/toggle-status - Toggle class status
  async toggleClassStatus(req, res) {
    try {
      const classData = await Classes.findOne({ _id: req.params.id, school: req.schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      classData.isActive = !classData.isActive;
      classData.status = classData.isActive ? 'Open' : 'Closed';
      await classData.save();

      const populatedClass = await Classes.findById(classData._id)
        .populate('subjects', 'name code')
        .populate('mainTeacher', 'firstName lastName');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `${classData.isActive ? 'Activated' : 'Deactivated'} class ${classData.name}`,
        metadata: { isActive: classData.isActive }
      };

      res.json({
        message: `Class ${classData.isActive ? 'activated' : 'deactivated'} successfully`,
        class: populatedClass
      });
    } catch (error) {
      console.error("Toggle class status error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // DELETE /classes/:id - Delete class
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

      await Classes.findByIdAndDelete(req.params.id);

      req.log = {
        action: 'DELETE',
        module: 'Classes',
        description: `Deleted class ${classData.name}`,
        metadata: { classId: req.params.id }
      };

      res.json({ message: 'Class deleted successfully' });
    } catch (error) {
      console.error("Delete class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // DELETE /classes/purge/all - Purge all classes
  async purgeClasses(req, res) {
    try {
      const schoolId = req.schoolId;

      const { confirmation } = req.body;
      if (!confirmation || confirmation !== 'CONFIRM_DELETE_ALL') {
        return res.status(400).json({
          message: 'Confirmation required. Send confirmation: "CONFIRM_DELETE_ALL" in request body'
        });
      }

      const result = await Classes.deleteMany({ school: schoolId });

      // Clear class references from students
      await Student.updateMany(
        { school: schoolId },
        { $set: { classes: [] } }
      );

      req.log = {
        action: 'DELETE',
        module: 'Classes',
        description: `Purged all classes for school`,
        metadata: { deletedCount: result.deletedCount }
      };

      res.json({
        message: 'All classes purged for this school',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error("Purge classes error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // POST /classes/:id/refresh-subjects - Refresh subjects based on level/system
  async refreshClassSubjects(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.id;

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Use the class method to refresh subjects
      await classData.refreshSubjects();

      const updatedClass = await Classes.findById(classId)
        .populate('subjects', 'name code coefficient color')
        .populate('subjectDetails.subject', 'name code coefficient weeklyHours color');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Refreshed subjects for class ${classData.name}`,
        metadata: {
          subjectsCount: updatedClass.subjects.length,
          level: classData.level,
          system: classData.educationSystem
        }
      };

      res.json({
        message: 'Subjects refreshed successfully',
        class: updatedClass
      });
    } catch (error) {
      console.error("Refresh class subjects error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // GET /classes/:id/subjects - Get class subjects
  async getClassSubjects(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.id;

      const classData = await Classes.findOne({ _id: classId, school: schoolId })
        .populate('subjects', 'name code coefficient weeklyHours color description')
        .populate('subjectDetails.subject', 'name code coefficient weeklyHours color description')
        .populate('subjectDetails.teacher', 'firstName lastName email');

      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.json({
        subjects: classData.subjects,
        subjectDetails: classData.subjectDetails
      });
    } catch (error) {
      console.error("Get class subjects error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT /classes/:id/subjects - Set/replace all subjects
  async setClassSubjects(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.id;
      const { subjects } = req.body;

      if (!Array.isArray(subjects)) {
        return res.status(400).json({ message: 'Subjects must be an array' });
      }

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Validate subjects exist in school
      const subjectIds = subjects.map(s => s.subject || s.subjectInfo || s);
      const validSubjects = await Subject.find({
        _id: { $in: subjectIds },
        school: schoolId
      });

      if (validSubjects.length !== subjectIds.length) {
        return res.status(400).json({ message: 'One or more subjects not found in this school' });
      }

      classData.subjects = subjectIds;
      classData.subjectDetails = subjects.map(subject => ({
        subject: subject.subject || subject.subjectInfo,
        coefficient: subject.coefficient || 1,
        teacher: subject.teacher || subject.teacherInfo,
        weeklyHours: subject.weeklyHours || 4,
        isActive: subject.isActive !== undefined ? subject.isActive : true
      }));

      await classData.save();

      const updatedClass = await Classes.findById(classId)
        .populate('subjects', 'name code')
        .populate('subjectDetails.subject', 'name code');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Set ${subjects.length} subjects for class ${classData.name}`,
        metadata: { subjectsCount: subjects.length }
      };

      res.json({
        message: 'Subjects updated successfully',
        class: updatedClass
      });
    } catch (error) {
      console.error("Set class subjects error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT /classes/:id/add-subjects - Add subjects to class
  async addSubjectsToClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.id;
      const { subjects } = req.body;

      if (!Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ message: 'Subjects array is required and cannot be empty' });
      }

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Add new subjects
      for (const subject of subjects) {
        const subjectId = subject.subject || subject.subjectInfo;

        if (!classData.subjects.includes(subjectId)) {
          classData.subjects.push(subjectId);
        }

        // Add to subjectDetails if not exists
        const existingDetail = classData.subjectDetails.find(
          detail => detail.subject.toString() === subjectId.toString()
        );

        if (!existingDetail) {
          classData.subjectDetails.push({
            subject: subjectId,
            coefficient: subject.coefficient || 1,
            teacher: subject.teacher || subject.teacherInfo,
            weeklyHours: subject.weeklyHours || 4,
            isActive: subject.isActive !== undefined ? subject.isActive : true
          });
        }
      }

      await classData.save();

      const updatedClass = await Classes.findById(classId)
        .populate('subjects', 'name code')
        .populate('subjectDetails.subject', 'name code');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Added ${subjects.length} subjects to class ${classData.name}`,
        metadata: { subjectsCount: subjects.length }
      };

      res.json({
        message: 'Subjects added successfully',
        class: updatedClass
      });
    } catch (error) {
      console.error("Add subjects to class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT /classes/:id/update-subject/:subjectId - Update subject in class
  async updateSubjectInClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.id;
      const subjectId = req.params.subjectId;
      const updates = req.body;

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Find and update subject details
      const subjectDetail = classData.subjectDetails.find(
        detail => detail.subject.toString() === subjectId.toString()
      );

      if (!subjectDetail) {
        return res.status(404).json({ message: 'Subject not found in this class' });
      }

      if (updates.coefficient !== undefined) subjectDetail.coefficient = updates.coefficient;
      if (updates.teacher !== undefined) subjectDetail.teacher = updates.teacher;
      if (updates.weeklyHours !== undefined) subjectDetail.weeklyHours = updates.weeklyHours;
      if (updates.isActive !== undefined) subjectDetail.isActive = updates.isActive;

      await classData.save();

      const updatedClass = await Classes.findById(classId)
        .populate('subjects', 'name code')
        .populate('subjectDetails.subject', 'name code')
        .populate('subjectDetails.teacher', 'firstName lastName');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Updated subject in class ${classData.name}`,
        metadata: { subjectId, updates }
      };

      res.json({
        message: 'Subject updated successfully',
        class: updatedClass
      });
    } catch (error) {
      console.error("Update subject in class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // DELETE /classes/:id/remove-subject/:subjectId - Remove subject from class
  async removeSubjectFromClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.id;
      const subjectId = req.params.subjectId;

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Remove from subjects array
      classData.subjects = classData.subjects.filter(
        subject => subject.toString() !== subjectId.toString()
      );

      // Remove from subjectDetails
      classData.subjectDetails = classData.subjectDetails.filter(
        detail => detail.subject.toString() !== subjectId.toString()
      );

      await classData.save();

      const updatedClass = await Classes.findById(classId)
        .populate('subjects', 'name code')
        .populate('subjectDetails.subject', 'name code');

      req.log = {
        action: 'DELETE',
        module: 'Classes',
        description: `Removed subject from class ${classData.name}`,
        metadata: { subjectId }
      };

      res.json({
        message: 'Subject removed successfully',
        class: updatedClass
      });
    } catch (error) {
      console.error("Remove subject from class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT /classes/:id/add-student - Add student to class
  async addStudentToClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.id;
      const { studentId } = req.body;

      if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
      }

      // Validate student exists in school
      const student = await Student.findOne({ _id: studentId, school: schoolId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found in this school' });
      }

      // Validate class exists
      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Check if student already in class
      if (classData.studentList.includes(studentId)) {
        return res.status(400).json({ message: 'Student already in this class' });
      }

      // Check capacity
      if (classData.currentStudents >= classData.capacity) {
        return res.status(400).json({ message: 'Class is at full capacity' });
      }

      // Add student to class
      classData.studentList.push(studentId);
      classData.currentStudents = classData.studentList.length;
      await classData.save();

      // Update student with class reference
      student.classes = classId;
      await student.save();

      const updatedClass = await Classes.findById(classId)
        .populate('studentList', 'firstName lastName studentId');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Added student to class ${classData.name}`,
        metadata: { studentId, classId }
      };

      res.json({
        message: 'Student added to class successfully',
        class: updatedClass
      });
    } catch (error) {
      console.error("Add student to class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // DELETE /classes/:id/remove-student/:studentId - Remove student from class
  async removeStudentFromClass(req, res) {
    try {
      const schoolId = req.schoolId;
      const classId = req.params.id;
      const studentId = req.params.studentId;

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Remove student from class
      classData.studentList = classData.studentList.filter(
        id => id.toString() !== studentId.toString()
      );
      classData.currentStudents = classData.studentList.length;
      await classData.save();

      // Remove class reference from student
      await Student.findByIdAndUpdate(studentId, {
        $unset: { classes: "" }
      });

      const updatedClass = await Classes.findById(classId)
        .populate('studentList', 'firstName lastName studentId');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Removed student from class ${classData.name}`,
        metadata: { studentId, classId }
      };

      res.json({
        message: 'Student removed from class successfully',
        class: updatedClass
      });
    } catch (error) {
      console.error("Remove student from class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // GET /classes/:id/performance - Get class performance analytics
  async getClassPerformanceAnalytics(req, res) {
    try {
      const classId = req.params.id;
      const { year } = req.query;
      const schoolId = req.schoolId;

      if (!year) {
        return res.status(400).json({ message: 'Year parameter is required' });
      }

      const classData = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Fetch academic records for performance analytics
      const academicYears = await AcademicYear.find({
        class: classId,
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

      // Calculate performance statistics
      const performanceStats = {
        totalStudents: academicYears.length,
        averageGrade: classData.averageGrade || 0,
        attendanceRate: classData.attendanceRate || 0,
        subjectPerformance: {},
        gradeDistribution: {
          excellent: 0, // 16-20
          good: 0,      // 14-15.9
          average: 0,   // 10-13.9
          belowAverage: 0 // 0-9.9
        }
      };

      // Calculate grade distribution
      academicYears.forEach(record => {
        const grade = record.overallAverage || 0;
        if (grade >= 16) performanceStats.gradeDistribution.excellent++;
        else if (grade >= 14) performanceStats.gradeDistribution.good++;
        else if (grade >= 10) performanceStats.gradeDistribution.average++;
        else performanceStats.gradeDistribution.belowAverage++;
      });

      req.log = {
        action: 'VIEW',
        module: 'Classes',
        description: `Fetched performance analytics for class ${classData.name}`,
        metadata: { classId, year, studentCount: academicYears.length }
      };

      res.json({
        classPerformance: performanceStats
      });
    } catch (error) {
      console.error("Get class performance analytics error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new ClassController();