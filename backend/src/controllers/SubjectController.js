import Subject from '../models/Subject.js';

class SubjectController {
    // Create a new subject
    async createSubject(req, res) {
        try {
            const subjectData = req.body;
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
    // Create a new subject
    async createManySubjects(req, res) {
        try {
            const subjectArray = req.body;

            if (!Array.isArray(subjectArray) || subjectArray.length === 0) {
                return res.status(400).json({ message: 'Request body must be a non-empty array of subjects' });
            }

            const savedSubjects = [];
            const errors = [];

            for (let i = 0; i < subjectArray.length; i++) {
                const subjectData = subjectArray[i];

                try {
                    const subject = new Subject(subjectData);
                    const savedSubject = await subject.save();
                    savedSubjects.push(savedSubject);
                } catch (error) {
                    errors.push({ index: i, error: error.message });
                }
            }

            res.status(207).json({ // 207 Multi-Status to show partial success/fail
                message: `${savedSubjects.length} students created, ${errors.length} errors`,
                savedSubjects,
                errors
            });
        } catch (error) {
            console.error(error);
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Duplicate subject code', error: error.keyValue });
            }
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
    // Get all subjects
    async getAllSubjects(req, res) {
        try {
            const subjects = await Subject.find({});
            res.json({ subjects });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    // Get a subject by ID
    async getSubjectById(req, res) {
        try {
            const { id } = req.params;
            const subject = await Subject.findById(id);
            if (!subject) {
                return res.status(404).json({ message: 'Subject not found' });
            }
            res.json({ subject });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    // Update a subject by ID
    async updateSubjectById(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const updatedSubject = await Subject.findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true
            });

            if (!updatedSubject) {
                return res.status(404).json({ message: 'Subject not found' });
            }

            res.json({ message: 'Subject updated successfully', subject: updatedSubject });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    // Delete a subject by ID
    async deleteSubjectById(req, res) {
        try {
            const { id } = req.params;
            const deletedSubject = await Subject.findByIdAndDelete(id);

            if (!deletedSubject) {
                return res.status(404).json({ message: 'Subject not found' });
            }

            res.json({ message: 'Subject deleted successfully', subject: deletedSubject });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    // Toggle isActive status
    async toggleActiveStatus(req, res) {
        try {
            const { id } = req.params;
            const subject = await Subject.findById(id);

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
