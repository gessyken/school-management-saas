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
      const subjects = await Subject.find({ school: req.schoolId });
      res.json({ subjects });
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
}

export default new SubjectController();
