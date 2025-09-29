import Subject from '../models/Subject.js';
import mongoose from 'mongoose';

class SubjectController {
  // Create a single subject
  async createSubject(req, res) {
    try {
      const subjectData = { 
        ...req.body, 
        school: req.schoolId,
        createdBy: req.userId // Assuming you have user ID in request
      };
      
      // Validate required fields
      if (!subjectData.school || !subjectData.name || !subjectData.code || !subjectData.mainTeacher) {
        return res.status(400).json({ 
          message: 'Missing required fields:school, name, code, and mainTeacher are required' 
        });
      }

      const subject = new Subject(subjectData);
      console.log("subject",subject)
      const savedSubject = await subject.save();
      
      // Populate the saved subject for response
      const populatedSubject = await Subject.findById(savedSubject._id)
        .populate('mainTeacher', 'firstName lastName email')
        .populate('teachers', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName');

      res.status(201).json({ 
        message: 'Subject created successfully', 
        subject: Subject.normalizeForFrontend(populatedSubject)
      });
    } catch (error) {
      console.error('Create subject error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Subject code already exists', 
          error: `Code "${error.keyValue?.code}" is already in use`
        });
      }
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          message: 'Validation error', 
          errors 
        });
      }
      res.status(500).json({ 
        message: 'Server error creating subject', 
        error: error.message 
      });
    }
  }

  // Create many subjects at once
  async createManySubjects(req, res) {
    try {
      const subjectArray = req.body;

      if (!Array.isArray(subjectArray) || subjectArray.length === 0) {
        return res.status(400).json({ 
          message: 'Request body must be a non-empty array of subjects' 
        });
      }

      const subjectsWithSchool = subjectArray.map(subjectData => ({
        ...subjectData,
        school: req.schoolId,
        createdBy: req.userId
      }));

      const savedSubjects = await Subject.insertMany(subjectsWithSchool, {
        ordered: false // Continue inserting even if some fail
      });

      // Get all saved subjects with population
      const subjectIds = savedSubjects.map(subject => subject._id);
      const populatedSubjects = await Subject.find({ _id: { $in: subjectIds } })
        .populate('mainTeacher', 'firstName lastName email')
        .populate('teachers', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName');

      res.status(201).json({
        message: `${savedSubjects.length} subjects created successfully`,
        subjects: populatedSubjects.map(subject => Subject.normalizeForFrontend(subject))
      });
    } catch (error) {
      console.error('Create many subjects error:', error);
      
      if (error.writeErrors) {
        // Handle bulk write errors
        const errors = error.writeErrors.map(writeError => ({
          index: writeError.index,
          code: writeError.err.code,
          message: writeError.err.errmsg
        }));
        
        return res.status(207).json({
          message: `Partial success: ${error.insertedIds.length} subjects created, ${errors.length} failed`,
          createdCount: error.insertedIds.length,
          errors
        });
      }
      
      res.status(500).json({ 
        message: 'Server error creating subjects', 
        error: error.message 
      });
    }
  }

  // Get all subjects for current school with filtering
  async getAllSubjects(req, res) {
    try {
      const { 
        search, 
        status, 
        system, 
        level, 
        teacher, 
        year,
        page = 1, 
        limit = 50 
      } = req.query;

      // Build filter object
      const filter = { school: req.schoolId };
      
      // Search filter
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Status filter
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }
      
      // Education system filter
      if (system && ['francophone', 'anglophone', 'bilingue', 'both'].includes(system)) {
        filter.educationSystem = system;
      }
      
      // Level filter
      if (level) {
        filter.levels = level;
      }
      
      // Year filter
      if (year) {
        filter.year = year;
      }
      
      // Teacher filter (by teacher ID)
      if (teacher && mongoose.Types.ObjectId.isValid(teacher)) {
        filter.$or = [
          { mainTeacher: teacher },
          { teachers: teacher }
        ];
      }

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Execute query with population and pagination
      const subjects = await Subject.find(filter)
        .populate('mainTeacher', 'firstName lastName email avatar')
        .populate('teachers', 'firstName lastName email avatar')
        .populate('createdBy', 'firstName lastName')
        .sort({ name: 1, code: 1 })
        .skip(skip)
        .limit(limitNum);

      // Get total count for pagination
      const total = await Subject.countDocuments(filter);
      const totalPages = Math.ceil(total / limitNum);

      // Transform subjects for frontend
      const transformedSubjects = subjects.map(subject => 
        Subject.normalizeForFrontend(subject)
      );

      res.json({
        subjects: transformedSubjects,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalSubjects: total,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      console.error('Get all subjects error:', error);
      res.status(500).json({ 
        message: 'Server error fetching subjects', 
        error: error.message 
      });
    }
  }

  // Get subject by ID for current school
  async getSubjectById(req, res) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid subject ID' });
      }

      const subject = await Subject.findOne({ _id: id, school: req.schoolId })
        .populate('mainTeacher', 'firstName lastName email avatar phone')
        .populate('teachers', 'firstName lastName email avatar phone')
        .populate('createdBy', 'firstName lastName email')
        .populate('school', 'name code');

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json({ 
        subject: Subject.normalizeForFrontend(subject)
      });
    } catch (error) {
      console.error('Get subject by ID error:', error);
      res.status(500).json({ 
        message: 'Server error fetching subject', 
        error: error.message 
      });
    }
  }

  // Get subjects by level
  async getSubjectsByLevel(req, res) {
    try {
      const { level } = req.params;
      const { system, activeOnly = 'true' } = req.query;

      const filter = { 
        school: req.schoolId,
        levels: level 
      };

      if (activeOnly === 'true') {
        filter.isActive = true;
      }

      if (system && ['francophone', 'anglophone', 'bilingue', 'both'].includes(system)) {
        filter.educationSystem = system;
      }

      const subjects = await Subject.find(filter)
        .populate('mainTeacher', 'firstName lastName email')
        .populate('teachers', 'firstName lastName email')
        .sort({ name: 1 });

      res.json({
        subjects: subjects.map(subject => Subject.normalizeForFrontend(subject)),
        level,
        count: subjects.length
      });
    } catch (error) {
      console.error('Get subjects by level error:', error);
      res.status(500).json({ 
        message: 'Server error fetching subjects by level', 
        error: error.message 
      });
    }
  }

  // Get subjects by teacher
  async getSubjectsByTeacher(req, res) {
    try {
      const { teacherId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: 'Invalid teacher ID' });
      }

      const subjects = await Subject.find({
        school: req.schoolId,
        $or: [
          { mainTeacher: teacherId },
          { teachers: teacherId }
        ]
      })
      .populate('mainTeacher', 'firstName lastName email')
      .populate('teachers', 'firstName lastName email')
      .sort({ name: 1 });

      res.json({
        subjects: subjects.map(subject => Subject.normalizeForFrontend(subject)),
        teacherId,
        count: subjects.length
      });
    } catch (error) {
      console.error('Get subjects by teacher error:', error);
      res.status(500).json({ 
        message: 'Server error fetching subjects by teacher', 
        error: error.message 
      });
    }
  }

  // Get subjects for a specific school (admin function)
  async getSubjectsForSchool(req, res) {
    try {
      const { schoolId } = req.params;
      const { year, activeOnly } = req.query;

      if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID' });
      }

      // Check if user has permission to access this school's data
      // This would depend on your authorization middleware

      const filter = { school: schoolId };
      
      if (year) {
        filter.year = year;
      }
      
      if (activeOnly === 'true') {
        filter.isActive = true;
      }

      const subjects = await Subject.find(filter)
        .populate('mainTeacher', 'firstName lastName email')
        .populate('teachers', 'firstName lastName email')
        .populate('school', 'name code')
        .sort({ year: -1, name: 1 });

      res.json({
        subjects: subjects.map(subject => Subject.normalizeForFrontend(subject)),
        schoolId,
        count: subjects.length
      });
    } catch (error) {
      console.error('Get subjects for school error:', error);
      res.status(500).json({ 
        message: 'Server error fetching subjects for school', 
        error: error.message 
      });
    }
  }

  // Update subject by ID
  async updateSubjectById(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid subject ID' });
      }

      // Prevent changing school ID
      if (updates.school) {
        delete updates.school;
      }

      const updatedSubject = await Subject.findOneAndUpdate(
        { _id: id, school: req.schoolId },
        updates,
        { new: true, runValidators: true }
      )
      .populate('mainTeacher', 'firstName lastName email')
      .populate('teachers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

      if (!updatedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json({ 
        message: 'Subject updated successfully', 
        subject: Subject.normalizeForFrontend(updatedSubject)
      });
    } catch (error) {
      console.error('Update subject error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Subject code already exists', 
          error: `Code "${error.keyValue?.code}" is already in use`
        });
      }
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          message: 'Validation error', 
          errors 
        });
      }
      res.status(500).json({ 
        message: 'Server error updating subject', 
        error: error.message 
      });
    }
  }

  // Delete subject by ID
  async deleteSubjectById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid subject ID' });
      }

      const deletedSubject = await Subject.findOneAndDelete({ 
        _id: id, 
        school: req.schoolId 
      });

      if (!deletedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json({ 
        message: 'Subject deleted successfully', 
        subject: Subject.normalizeForFrontend(deletedSubject)
      });
    } catch (error) {
      console.error('Delete subject error:', error);
      res.status(500).json({ 
        message: 'Server error deleting subject', 
        error: error.message 
      });
    }
  }

  // Toggle subject active status
  async toggleActiveStatus(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid subject ID' });
      }

      const subject = await Subject.findOne({ _id: id, school: req.schoolId });

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      subject.isActive = !subject.isActive;
      await subject.save();

      const populatedSubject = await Subject.findById(subject._id)
        .populate('mainTeacher', 'firstName lastName email')
        .populate('teachers', 'firstName lastName email');

      res.json({ 
        message: `Subject ${subject.isActive ? 'activated' : 'deactivated'}`, 
        subject: Subject.normalizeForFrontend(populatedSubject)
      });
    } catch (error) {
      console.error('Toggle active status error:', error);
      res.status(500).json({ 
        message: 'Server error toggling subject status', 
        error: error.message 
      });
    }
  }

  // Bulk update subjects
  async bulkUpdateSubjects(req, res) {
    try {
      const { subjectIds, updates } = req.body;

      if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
        return res.status(400).json({ message: 'subjectIds must be a non-empty array' });
      }

      // Validate all IDs
      const validIds = subjectIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length !== subjectIds.length) {
        return res.status(400).json({ message: 'One or more invalid subject IDs' });
      }

      // Prevent changing school ID
      if (updates.school) {
        delete updates.school;
      }

      const result = await Subject.updateMany(
        { _id: { $in: validIds }, school: req.schoolId },
        updates,
        { runValidators: true }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'No subjects found for update' });
      }

      // Get updated subjects
      const updatedSubjects = await Subject.find({ _id: { $in: validIds } })
        .populate('mainTeacher', 'firstName lastName email')
        .populate('teachers', 'firstName lastName email');

      res.json({
        message: `${result.modifiedCount} subjects updated successfully`,
        updatedCount: result.modifiedCount,
        subjects: updatedSubjects.map(subject => Subject.normalizeForFrontend(subject))
      });
    } catch (error) {
      console.error('Bulk update subjects error:', error);
      res.status(500).json({ 
        message: 'Server error bulk updating subjects', 
        error: error.message 
      });
    }
  }

  // Get subject statistics
  async getSubjectStatistics(req, res) {
    try {
      const stats = await Subject.aggregate([
        { $match: { school: new mongoose.Types.ObjectId(req.schoolId) } },
        {
          $group: {
            _id: null,
            totalSubjects: { $sum: 1 },
            activeSubjects: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactiveSubjects: { $sum: { $cond: ['$isActive', 0, 1] } },
            totalWeeklyHours: { $sum: '$weeklyHours' },
            bySystem: {
              $push: {
                system: '$educationSystem',
                isActive: '$isActive'
              }
            },
            byLevel: {
              $push: '$levels'
            }
          }
        }
      ]);

      const systemStats = await Subject.aggregate([
        { $match: { school: new mongoose.Types.ObjectId(req.schoolId) } },
        {
          $group: {
            _id: '$educationSystem',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]);

      const result = stats[0] || {
        totalSubjects: 0,
        activeSubjects: 0,
        inactiveSubjects: 0,
        totalWeeklyHours: 0
      };

      // Process system statistics
      const systemBreakdown = systemStats.reduce((acc, stat) => {
        acc[stat._id] = {
          total: stat.count,
          active: stat.active,
          inactive: stat.count - stat.active
        };
        return acc;
      }, {});

      res.json({
        statistics: {
          ...result,
          systemBreakdown,
          averageWeeklyHours: result.totalSubjects > 0 
            ? (result.totalWeeklyHours / result.totalSubjects).toFixed(1)
            : 0
        }
      });
    } catch (error) {
      console.error('Get subject statistics error:', error);
      res.status(500).json({ 
        message: 'Server error fetching statistics', 
        error: error.message 
      });
    }
  }

  // Purge all subjects for current school
  async purgeSubjects(req, res) {
    try {
      const schoolId = req.schoolId;
      
      // Confirm action with a confirmation token or password in production
      const { confirmation } = req.body;
      if (!confirmation || confirmation !== 'CONFIRM_DELETE_ALL') {
        return res.status(400).json({ 
          message: 'Confirmation required. Send confirmation: "CONFIRM_DELETE_ALL" in request body' 
        });
      }

      const result = await Subject.deleteMany({ school: schoolId });

      // Optional: Clear subject references in other collections
      try {
        const Classes = (await import('../models/Classes.js')).default;
        await Classes.updateMany(
          { school: schoolId },
          { $set: { subjects: [] } }
        );
      } catch (e) {
        console.warn('Warning: Failed to clear class subjects:', e.message);
      }

      res.json({ 
        message: 'All subjects purged for this school', 
        deletedCount: result.deletedCount 
      });
    } catch (error) {
      console.error('Purge subjects error:', error);
      res.status(500).json({ 
        message: 'Server error purging subjects', 
        error: error.message 
      });
    }
  }
}

export default new SubjectController();