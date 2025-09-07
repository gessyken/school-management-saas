import Classes from '../models/Classes.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import AcademicYear from '../models/AcademicYear.js';

class ClassController {
  // Helpers
  levelAliasToName(alias) {
    if (!alias) return alias;
    const map = new Map([
      // Francophone ids -> display
      ['6eme', '6ème'], ['5eme', '5ème'], ['4eme', '4ème'], ['3eme', '3ème'],
      ['2nde', '2nde'], ['1ere', '1ère'], ['terminale', 'Terminale'],
      // Anglophone ids -> display
      ['form1', 'Form 1'], ['form2', 'Form 2'], ['form3', 'Form 3'],
      ['form4', 'Form 4'], ['form5', 'Form 5'], ['lower6', 'Lower Sixth'], ['upper6', 'Upper Sixth']
    ]);
    // If already one of the display names, keep it
    const values = Array.from(map.values());
    if (values.includes(alias)) return alias;
    return map.get(String(alias)) || alias;
  }

  // Get subjects of a class (populated)
  async getClassSubjects(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) return res.status(403).json({ message: 'School context missing' });
      const classId = req.params.id;
      const classDoc = await Classes.findOne({ _id: classId, school: schoolId })
        .populate('subjects.subjectInfo')
        .populate('subjects.teacherInfo');
      if (!classDoc) return res.status(404).json({ message: 'Class not found' });
      return res.json({ subjects: classDoc.subjects });
    } catch (error) {
      console.error('Get class subjects error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Replace entire subjects list for a class
  async setClassSubjects(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) return res.status(403).json({ message: 'School context missing' });
      const classId = req.params.id;
      const items = Array.isArray(req.body?.subjects) ? req.body.subjects : null;
      if (!items) return res.status(400).json({ message: 'Body must include subjects array' });

      const classDoc = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classDoc) return res.status(404).json({ message: 'Class not found' });

      // Validate each subject exists in this school
      const mapped = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const subjId = it.subjectInfo || it.subjectId || it.id;
        if (!subjId) {
          return res.status(400).json({ message: `subjects[${i}].subjectInfo is required` });
        }
        const subject = await Subject.findOne({ _id: subjId, school: schoolId });
        if (!subject) {
          return res.status(404).json({ message: `Subject ${subjId} not found in this school` });
        }
        const coefficient = Number(it.coefficient ?? subject.baseCoefficient ?? subject.coefficient ?? 1) || 1;
        mapped.push({
          subjectInfo: subject._id,
          coefficient,
          isActive: it.isActive !== undefined ? !!it.isActive : true,
          teacherInfo: it.teacherInfo || undefined
        });
      }

      classDoc.subjects = mapped;
      await classDoc.save();

      const populated = await Classes.findById(classDoc._id)
        .populate('subjects.subjectInfo')
        .populate('subjects.teacherInfo');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Set ${mapped.length} subjects for class ${classDoc.classesName}`,
        metadata: { count: mapped.length }
      };

      return res.json({ message: 'Subjects updated successfully', class: populated });
    } catch (error) {
      console.error('Set class subjects error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Refresh subjects for a class based on current educationSystem, level, and specialty
  async refreshSubjectsForClass(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) return res.status(403).json({ message: 'School context missing' });

      const classId = req.params.id;
      const classDoc = await Classes.findOne({ _id: classId, school: schoolId });
      if (!classDoc) {
        return res.status(404).json({ message: 'Class not found' });
      }

      const { educationSystem, level, specialty } = classDoc;
      // Build query to fetch subjects compatible with the class
      const query = {
        school: schoolId,
        isActive: true,
        $and: [
          {
            $or: [
              { educationSystem: educationSystem },
              { educationSystem: 'both' }
            ]
          },
          {
            $or: [
              { levels: level },
              { levels: 'Général' }
            ]
          }
        ]
      };

      const subjects = await Subject.find(query).sort({ required: -1, subjectName: 1 });
      if (!subjects || subjects.length === 0) {
        return res.status(200).json({
          message: 'No compatible subjects found for this class. Please create subjects first.',
          class: classDoc
        });
      }

      // Compute coefficients (prefer coefficient for specific level, then baseCoefficient, then legacy coefficient)
      const computedSubjects = subjects.map(s => {
        let coef = 0;
        // Support Map type or plain object
        const map = s.coefficientsByLevel;
        const getFromMap = (k) => {
          if (!map) return undefined;
          if (typeof map.get === 'function') return map.get(k);
          if (typeof map === 'object') return map[k];
          return undefined;
        };

        // 1) Try specialty-specific override like "Terminale|C" or "Upper Sixth|Science"
        if (specialty) {
          const specKey = `${level}|${specialty}`;
          const specVal = getFromMap(specKey);
          if (specVal !== undefined) coef = Number(specVal) || 0;
        }
        // 2) Fallback to level-specific
        if (!coef) {
          const lvlVal = getFromMap(level);
          if (lvlVal !== undefined) coef = Number(lvlVal) || 0;
        }
        // 3) Fallback to baseCoefficient or legacy coefficient or 1
        if (!coef) coef = Number(s.baseCoefficient || s.coefficient || 1) || 1;

        return {
          subjectInfo: s._id,
          coefficient: coef,
          isActive: true
        };
      });

      classDoc.subjects = computedSubjects;
      await classDoc.save();

      const populated = await Classes.findById(classDoc._id)
        .populate('subjects.subjectInfo')
        .populate('subjects.teacherInfo');

      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Refreshed subjects for class ${classDoc.classesName}`,
        metadata: { subjects: computedSubjects.length }
      };

      return res.json({ message: 'Subjects refreshed successfully', class: populated });
    } catch (error) {
      console.error('Refresh subjects error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  computeDefaultAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    if (month >= 8) {
      return `${year}-${year + 1}`; // e.g., 2025-2026 starting in Aug
    }
    return `${year - 1}-${year}`; // e.g., 2024-2025 before Aug
  }

  normalizeAndValidate(payload) {
    const result = { ...payload };
    // Normalize level id -> display name
    result.level = this.levelAliasToName(result.level);
    // Ensure section default
    if (!result.section) result.section = 'A';
    // Ensure educationSystem
    if (!result.educationSystem) result.educationSystem = 'francophone';
    // Ensure status
    if (!result.status) result.status = 'Open';
    // Ensure year
    if (!result.year) result.year = this.computeDefaultAcademicYear();
    // Validate classesName
    if (!result.classesName || typeof result.classesName !== 'string' || !result.classesName.trim()) {
      return { error: 'classesName is required' };
    }
    // Validate level enum subset (rough check)
    const allowedLevels = [
      '6ème','5ème','4ème','3ème','2nde','1ère','Terminale',
      'Form 1','Form 2','Form 3','Form 4','Form 5','Lower Sixth','Upper Sixth'
    ];
    if (!allowedLevels.includes(result.level)) {
      return { error: `Invalid level '${result.level}'.` };
    }
    // Validate educationSystem
    if (!['francophone','anglophone'].includes(result.educationSystem)) {
      return { error: `Invalid educationSystem '${result.educationSystem}'.` };
    }
    // Validate specialty rule: only for Terminale (FR) or Upper Sixth (EN)
    const isTerminalLevel = result.level === 'Terminale' || result.level === 'Upper Sixth';
    if (!isTerminalLevel) {
      delete result.specialty;
    }
    // Subjects optional: ensure array
    if (result.subjects && !Array.isArray(result.subjects)) {
      return { error: 'subjects must be an array if provided' };
    }
    return { data: result };
  }
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
       };
      res.json({ classes });
    } catch (error) {
      console.error("Fetch classes error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  // Create class
  async createClass(req, res) {
    try {
      const body = req.body || {};
      // Compute classesName if not provided from level/section/specialty
      if (!body.classesName && body.level && body.section) {
        const lvl = this.levelAliasToName(body.level);
        body.classesName = `${lvl} ${body.section}${(body.specialty ? ` (${body.specialty})` : '')}`.trim();
      }
      const norm = this.normalizeAndValidate(body);
      if (norm.error) {
        return res.status(400).json({ message: norm.error });
      }
      const {
        classesName,
        description,
        status,
        capacity,
        level,
        educationSystem,
        specialty,
        section,
        amountFee,
        subjects,
        mainTeacherInfo,
        year
      } = norm.data;
      console.log('createClass payload:', norm.data)
      const schoolId = req.schoolId;

      if (!schoolId) return res.status(403).json({ message: "School context missing" });

      // Skip subject validation - subjects are now handled as simple strings
      // if (subjects && subjects.length > 0) {
      //   for (const subject of subjects) {
      //     const exists = await Subject.findOne({ _id: subject.subjectInfo, school: schoolId });
      //     if (!exists) {
      //       return res.status(404).json({ message: `Subject ID ${subject.subjectInfo} not found for this school` });
      //     }
      //   }
      // }

      const newClass = new Classes({
        school: schoolId,
        classesName,
        description,
        status: status || 'Open',
        capacity,
        level,
        educationSystem: educationSystem || 'francophone',
        specialty,
        section: section || 'A',
        amountFee,
        subjects: subjects || [],
        studentList: [],
        mainTeacherInfo,
        year
      });

      await newClass.save();
      await newClass.populate('school', 'name');

      req.log = {
        action: 'CREATE',
        module: 'Classes',
        description: `Created new class '${classesName}' for school ${newClass.school.name}`,
        metadata: {
          classId: newClass._id,
          level,
          year
        }
      };

      res.status(201).json({
        message: 'Class created successfully',
        class: newClass
      });
    } catch (error) {
      if (error && error.code === 11000) {
        return res.status(409).json({ message: 'A class with the same name and year already exists in this school.' });
      }
      console.error("Create class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Create many classes quickly
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
          if (!raw.classesName && raw.level && raw.section) {
            const lvl = this.levelAliasToName(raw.level);
            raw.classesName = `${lvl} ${raw.section}${(raw.specialty ? ` (${raw.specialty})` : '')}`.trim();
          }
          const norm = this.normalizeAndValidate(raw);
          if (norm.error) {
            errors.push({ index: i, message: norm.error });
            continue;
          }
          const {
            classesName,
            description,
            status,
            capacity,
            level,
            educationSystem,
            specialty,
            section,
            amountFee,
            subjects,
            mainTeacherInfo,
            year
          } = norm.data;

          const newClass = new Classes({
            school: schoolId,
            classesName,
            description,
            status: status || 'Open',
            capacity,
            level,
            educationSystem: educationSystem || 'francophone',
            specialty,
            section: section || 'A',
            amountFee,
            subjects: subjects || [],
            studentList: [],
            mainTeacherInfo,
            year
          });

          try {
            await newClass.save();
            saved.push(newClass);
          } catch (err) {
            if (err && err.code === 11000) {
              errors.push({ index: i, message: 'Duplicate: class with same name and year already exists' });
            } else {
              throw err;
            }
          }
        } catch (err) {
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

      req.log = {
        action: 'VIEW',
        module: 'Classes',
        description: `Viewed class ${classData.classesName}`,
        metadata: { classId: req.params.id }
      };

      res.json({ class: classData });
    } catch (error) {
      console.error("Get class error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update class
  async updateClass(req, res) {
    try {
      const schoolId = req.schoolId;

      const existingClass = await Classes.findOne({ _id: req.params.id, school: schoolId });
      if (!existingClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
      // Build normalized payload
      const body = req.body || {};
      if (!body.classesName) {
        const lvl = this.levelAliasToName(body.level || existingClass.level);
        const sec = body.section || existingClass.section || 'A';
        const spec = body.specialty || existingClass.specialty;
        const isTerminal = (lvl === 'Terminale' || lvl === 'Upper Sixth');
        body.classesName = `${lvl} ${sec}${(isTerminal && spec) ? ` (${spec})` : ''}`.trim();
      }
      // Merge existing class data with body, ensuring we don't lose required fields
      const mergedData = {
        classesName: body.classesName || existingClass.classesName,
        description: body.description !== undefined ? body.description : existingClass.description,
        status: body.status || existingClass.status,
        capacity: body.capacity !== undefined ? body.capacity : existingClass.capacity,
        level: body.level || existingClass.level,
        educationSystem: body.educationSystem || existingClass.educationSystem,
        specialty: body.specialty !== undefined ? body.specialty : existingClass.specialty,
        section: body.section || existingClass.section,
        amountFee: body.amountFee !== undefined ? body.amountFee : existingClass.amountFee,
        mainTeacherInfo: body.mainTeacherInfo !== undefined ? body.mainTeacherInfo : existingClass.mainTeacherInfo,
        subjects: body.subjects !== undefined ? body.subjects : existingClass.subjects,
        year: body.year || existingClass.year
      };
      const norm = this.normalizeAndValidate(mergedData);
      if (norm.error) {
        return res.status(400).json({ message: norm.error });
      }

      const {
        classesName,
        description,
        status,
        capacity,
        level,
        educationSystem,
        specialty,
        section,
        amountFee,
        mainTeacherInfo,
        subjects,
        year
      } = norm.data;

      const updated = await Classes.findByIdAndUpdate(
        req.params.id,
        {
          classesName,
          description,
          status,
          capacity,
          level,
          educationSystem,
          specialty,
          section,
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
      req.log = {
        action: 'UPDATE',
        module: 'Classes',
        description: `Updated class ${updated.classesName}`,
        metadata: { updatedFields: Object.keys(req.body) }
      };

      res.json({ message: 'Class updated successfully', class: updated });
    } catch (error) {
      if (error && error.code === 11000) {
        return res.status(409).json({ message: 'A class with the same name and year already exists in this school.' });
      }
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
      req.log = {
        action: 'DELETE',
        module: 'Class',
        description: `Deleted class ${classData.classesName}`,
        metadata: { classId: req.params.id }
      };

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

        // Skip subject validation - subjects are now handled as simple strings
        // const subject = await Subject.findOne({ _id: subjectInfo, school: schoolId });
        // if (!subject) {
        //   console.warn(`Subject ${subjectInfo} not found or does not belong to school ${schoolId}`);
        //   continue; // Skip invalid subject
        // }

        // Skip teacher validation for now
        // if (teacherInfo) {
        //   const teacher = await User.findOne({ _id: teacherInfo, school: schoolId });
        //   if (!teacher) {
        //     console.warn(`Teacher ${teacherInfo} not found or does not belong to school ${schoolId}`);
        //     continue; // Skip invalid teacher
        //   }
        // }

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
      req.log = {
        action: 'UPDATE',
        module: 'Class',
        description: `Updated subjects in class ${classData.classesName}`,
        metadata: req.body
      };

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

      // Skip teacher validation for now
      // if (teacherInfo) {
      //   const teacher = await User.findOne({ _id: teacherInfo, school: schoolId });
      //   if (!teacher) {
      //     return res.status(404).json({ message: 'Teacher not found or does not belong to this school.' });
      //   }
      // }

      if (coefficient !== undefined) {
        classData.subjects[subjectIndex].coefficient = coefficient;
      }
      if (teacherInfo !== undefined) {
        classData.subjects[subjectIndex].teacherInfo = teacherInfo;
      }

      await classData.save();
      req.log = {
        action: 'UPDATE',
        module: 'Class',
        description: `Updated subject ${subjectId} in class ${classData.classesName}`,
        metadata: { coefficient, teacherInfo }
      };

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
      req.log = {
        action: 'DELETE',
        module: 'Class',
        description: `Removed subject ${subjectId} from class ${classId}`,
        metadata: {}
      };

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
      req.log = {
        action: 'UPDATE',
        module: 'Class',
        description: `Added student ${studentId} to class ${classId}`,
        metadata: { studentId }
      };

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
      req.log = {
        action: 'UPDATE',
        module: 'Class',
        description: `Removed student ${studentId} from class ${classId}`,
        metadata: { studentId }
      };

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
      req.log = {
        action: 'VIEW',
        module: 'Class',
        description: `Fetched performance analytics for class ${classId} - year ${year}`,
        metadata: {
          studentCount: academicYears.length,
          classId,
          year
        }
      };

      res.json({ classPerformance: classStats });
    } catch (error) {
      console.error("getClassPerformanceAnalytics error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new ClassController();
