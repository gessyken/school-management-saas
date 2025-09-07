import Subject from '../models/Subject.js';

class SubjectController {
  // Create a single subject
  async createSubject(req, res) {
    try {
      const subjectData = { ...req.body, school: req.schoolId };
      const subject = new Subject(subjectData);
      const savedSubject = await subject.save();
      res.status(201).json({ message: 'Subject created successfully', subject: savedSubject });
    } catch (error) {
      console.error(error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate subject code', error: error.keyValue });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Create many subjects at once
  async createManySubjects(req, res) {
    try {
      const subjectArray = req.body;

      if (!Array.isArray(subjectArray) || subjectArray.length === 0) {
        return res.status(400).json({ message: 'Request body must be a non-empty array of subjects' });
      }

      const savedSubjects = [];
      const errors = [];

      for (let i = 0; i < subjectArray.length; i++) {
        const subjectData = { ...subjectArray[i], school: req.schoolId };
        try {
          const subject = new Subject(subjectData);
          const saved = await subject.save();
          savedSubjects.push(saved);
        } catch (err) {
          errors.push({ index: i, error: err.message });
        }
      }

      res.status(207).json({
        message: `${savedSubjects.length} subjects created, ${errors.length} errors`,
        savedSubjects,
        errors
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all subjects in current school
  async getAllSubjects(req, res) {
    try {
      const subjects = await Subject.find({ school: req.schoolId })
        .populate('teachers', 'firstName lastName email');
      
      // Transform subjects to match frontend expectations
      const transformedSubjects = subjects.map(subject => ({
        id: subject._id,
        name: subject.subjectName,
        code: subject.subjectCode,
        description: subject.description || '',
        baseCoefficient: subject.baseCoefficient || subject.coefficient || 1,
        coefficient: subject.baseCoefficient || subject.coefficient || 1, // Backward compatibility
        coefficientsByLevel: subject.coefficientsByLevel
          ? (typeof subject.coefficientsByLevel.get === 'function'
              ? Object.fromEntries(subject.coefficientsByLevel.entries())
              : subject.coefficientsByLevel)
          : {},
        weeklyHours: subject.weeklyHours || 0,
        teacher: subject.teacher || 'Non assigné',
        teachers: Array.isArray(subject.teachers) ? subject.teachers.map(t => ({
          id: t?._id,
          name: t ? `${t.firstName || ''} ${t.lastName || ''}`.trim() : 'Inconnu',
          email: t?.email || ''
        })) : [],
        teacherNames: Array.isArray(subject.teachers) ? subject.teachers.map(t => `${t.firstName || ''} ${t.lastName || ''}`.trim()).filter(Boolean) : [],
        levels: subject.levels || subject.level || ['Général'],
        level: subject.levels || subject.level || ['Général'], // Backward compatibility
        educationSystem: subject.educationSystem || 'both',
        specialty: subject.specialty || [],
        required: subject.required || false,
        isActive: subject.isActive !== undefined ? subject.isActive : true,
        color: subject.color || '#3B82F6'
      }));
      
      res.json({ subjects: transformedSubjects });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get subject by ID, filtered by school
  async getSubjectById(req, res) {
    try {
      const { id } = req.params;
      const subject = await Subject.findOne({ _id: id, school: req.schoolId });
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      res.json({ subject });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update subject by ID (within current school)
  async updateSubjectById(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedSubject = await Subject.findOneAndUpdate(
        { _id: id, school: req.schoolId },
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json({ message: 'Subject updated successfully', subject: updatedSubject });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete a subject by ID (within current school)
  async deleteSubjectById(req, res) {
    try {
      const { id } = req.params;
      const deletedSubject = await Subject.findOneAndDelete({ _id: id, school: req.schoolId });

      if (!deletedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json({ message: 'Subject deleted successfully', subject: deletedSubject });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Toggle subject's active status
  async toggleActiveStatus(req, res) {
    try {
      const { id } = req.params;
      const subject = await Subject.findOne({ _id: id, school: req.schoolId });

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      subject.isActive = !subject.isActive;
      await subject.save();

      res.json({ message: `Subject ${subject.isActive ? 'activated' : 'deactivated'}`, subject });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete all subjects for the current school, optionally removing references from classes
  async purgeSubjects(req, res) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) return res.status(403).json({ message: 'School context missing' });

      // Delete all subjects for this school
      const result = await Subject.deleteMany({ school: schoolId });

      // Also remove subject references from classes.subjects for this school
      // This avoids dangling references in classes
      try {
        const Classes = (await import('../models/Classes.js')).default;
        await Classes.updateMany(
          { school: schoolId },
          { $set: { subjects: [] } }
        );
      } catch (e) {
        // Log but do not fail purge if classes update fails
        console.warn('Warning: failed to clear class subjects after purge:', e?.message || e);
      }

      return res.json({ message: 'All subjects purged for this school', deletedCount: result.deletedCount || 0 });
    } catch (error) {
      console.error('Purge subjects error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new SubjectController();
