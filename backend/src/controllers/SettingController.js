import AcademicYearDetail from '../models/AcademicYearDetail.js';
import Term from '../models/Term.js';
import Sequence from '../models/Sequence.js';

class SettingController {
  /* ───────────── ACADEMIC YEAR METHODS ───────────── */

  async createAcademicYear(req, res) {
    try {
      const academicYearData = { 
        ...req.body, 
        school: req.schoolId,
        metadata: {
          ...req.body.metadata,
          createdBy: req.user?._id
        }
      };
      
      const academicYear = await AcademicYearDetail.create(academicYearData);
      res.status(201).json(academicYear);
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error.message });
    }
  }

  async getAcademicYears(req, res) {
    try {
      const { status, isCurrent, year } = req.query;
      const filter = { school: req.schoolId };
      console.log("years")
      
      if (status) filter.status = status;
      if (isCurrent !== undefined) filter.isCurrent = isCurrent === 'true';
      if (year) filter.name = year;

      const years = await AcademicYearDetail.find(filter)
        .populate({
          path: 'terms',
          populate: {
            path: 'sequences',
            options: { sort: { order: 1 } }
          },
          options: { sort: { order: 1 } }
        })
        .sort({ startDate: -1 });
      console.log(years)
      res.json(years);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAcademicYearById(req, res) {
    try {
      const academicYear = await AcademicYearDetail.findOne({
        _id: req.params.id,
        school: req.schoolId
      }).populate({
        path: 'terms',
        populate: {
          path: 'sequences',
          options: { sort: { order: 1 } }
        },
        options: { sort: { order: 1 } }
      });

      if (!academicYear) {
        return res.status(404).json({ error: "Academic year not found." });
      }

      res.json(academicYear);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCurrentAcademicYear(req, res) {
    try {
      const academicYear = await AcademicYearDetail.findCurrentBySchool(req.schoolId)
        .populate({
          path: 'terms',
          populate: {
            path: 'sequences',
            options: { sort: { order: 1 } }
          },
          options: { sort: { order: 1 } }
        });

      if (!academicYear) {
        return res.status(404).json({ error: "No current academic year found." });
      }

      res.json(academicYear);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAcademicYear(req, res) {
    try {
      const academicYear = await AcademicYearDetail.findOne({
        _id: req.params.id,
        school: req.schoolId
      });

      if (!academicYear) {
        return res.status(404).json({ error: "Academic year not found." });
      }

      // Update fields
      const allowedUpdates = ['name', 'startDate', 'endDate', 'isCurrent', 'description', 'status'];
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          academicYear[field] = req.body[field];
        }
      });

      // Update metadata
      if (req.user?._id) {
        academicYear.metadata.lastModifiedBy = req.user._id;
        if (req.body.metadata?.notes) {
          academicYear.metadata.notes = req.body.metadata.notes;
        }
      }

      const updated = await academicYear.save();
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteAcademicYear(req, res) {
    try {
      const academicYear = await AcademicYearDetail.findOne({
        _id: req.params.id,
        school: req.schoolId
      });

      if (!academicYear) {
        return res.status(404).json({ error: "Academic year not found." });
      }

      // Check if academic year has terms
      if (academicYear.terms.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete academic year with existing terms. Delete terms first." 
        });
      }

      await AcademicYearDetail.findByIdAndDelete(academicYear._id);
      res.json({ message: 'Academic year deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /* ───────────── TERM METHODS ───────────── */

  async createTerm(req, res) {
    try {
      const { academicYear: academicYearId, ...termData } = req.body;
      const schoolId = req.schoolId;

      if (!academicYearId) {
        return res.status(400).json({ error: "Academic year ID is required." });
      }

      // Validate academic year exists and belongs to school
      const academicYear = await AcademicYearDetail.findOne({
        _id: academicYearId,
        school: schoolId
      });
      
      if (!academicYear) {
        return res.status(404).json({ error: "Academic year not found." });
      }

      // Create term with proper references
      const term = new Term({
        ...termData,
        academicYear: academicYearId,
        school: schoolId,
        createdBy: req.user?._id
      });

      await term.save();

      // Add term to academic year if not already present
      if (!academicYear.terms.includes(term._id)) {
        academicYear.terms.push(term._id);
        await academicYear.save();
      }

      res.status(201).json(term);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTerms(req, res) {
    try {
      const { academicYear, status, isCurrent } = req.query;
      const filter = { school: req.schoolId };
      
      if (academicYear) filter.academicYear = academicYear;
      if (status) filter.status = status;
      if (isCurrent !== undefined) filter.isCurrent = isCurrent === 'true';

      const terms = await Term.find(filter)
        .populate('academicYear')
        .populate({
          path: 'sequences',
          options: { sort: { order: 1 } }
        })
        .sort({ order: 1 });
      
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTermById(req, res) {
    try {
      const term = await Term.findOne({
        _id: req.params.id,
        school: req.schoolId
      })
        .populate('academicYear')
        .populate({
          path: 'sequences',
          options: { sort: { order: 1 } }
        });

      if (!term) {
        return res.status(404).json({ error: "Term not found." });
      }

      res.json(term);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCurrentTerm(req, res) {
    try {
      const term = await Term.findCurrentBySchool(req.schoolId);

      if (!term) {
        return res.status(404).json({ error: "No current term found." });
      }

      res.json(term);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTermsByAcademicYear(req, res) {
    try {
      const { academicYearId } = req.params;
      const terms = await Term.findByAcademicYear(req.schoolId, academicYearId);
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTerm(req, res) {
    try {
      const term = await Term.findOne({
        _id: req.params.id,
        school: req.schoolId
      });

      if (!term) {
        return res.status(404).json({ error: "Term not found." });
      }

      // Update fields
      const allowedUpdates = ['name', 'code', 'order', 'startDate', 'endDate', 'isCurrent', 'status', 'description', 'settings', 'type'];
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          term[field] = req.body[field];
        }
      });

      // Update last modified by
      if (req.user?._id) {
        term.lastModifiedBy = req.user._id;
      }

      const updated = await term.save();
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTerm(req, res) {
    try {
      const term = await Term.findOne({
        _id: req.params.id,
        school: req.schoolId
      });

      if (!term) {
        return res.status(404).json({ error: "Term not found." });
      }

      // Check if term has sequences
      if (term.sequences.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete term with existing sequences. Delete sequences first." 
        });
      }

      // Remove term from academic year
      await AcademicYearDetail.findByIdAndUpdate(
        term.academicYear,
        { $pull: { terms: term._id } }
      );

      await Term.findByIdAndDelete(term._id);
      res.json({ message: "Term deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /* ───────────── SEQUENCE METHODS ───────────── */

  async createSequence(req, res) {
    try {
      const { term: termId, ...sequenceData } = req.body;
      const schoolId = req.schoolId;

      if (!termId) {
        return res.status(400).json({ error: 'Term ID is required.' });
      }

      // Verify term exists and belongs to school
      const term = await Term.findOne({ 
        _id: termId, 
        school: schoolId 
      });
      
      if (!term) {
        return res.status(404).json({ error: 'Term not found.' });
      }

      // Create sequence
      const sequence = await Sequence.create({
        ...sequenceData,
        term: termId,
        school: schoolId,
        createdBy: req.user?._id
      });

      res.status(201).json(sequence);
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error.message });
    }
  }

  async getSequences(req, res) {
    try {
      const { term, status, isCurrent } = req.query;
      const filter = { school: req.schoolId };
      
      if (term) filter.term = term;
      if (status) filter.status = status;
      if (isCurrent !== undefined) filter.isCurrent = isCurrent === 'true';

      const sequences = await Sequence.find(filter)
        .populate('term')
        .sort({ order: 1 });
      
      res.json(sequences);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSequenceById(req, res) {
    try {
      const sequence = await Sequence.findOne({
        _id: req.params.id,
        school: req.schoolId
      }).populate('term');

      if (!sequence) {
        return res.status(404).json({ error: 'Sequence not found.' });
      }

      res.json(sequence);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCurrentSequence(req, res) {
    try {
      const sequence = await Sequence.findCurrentBySchool(req.schoolId);

      if (!sequence) {
        return res.status(404).json({ error: "No current sequence found." });
      }

      res.json(sequence);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSequencesByTerm(req, res) {
    try {
      const { termId } = req.params;
      const sequences = await Sequence.findByTerm(termId);
      res.json(sequences);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateSequence(req, res) {
    try {
      const sequence = await Sequence.findOne({
        _id: req.params.id,
        school: req.schoolId
      });

      if (!sequence) {
        return res.status(404).json({ error: 'Sequence not found.' });
      }

      // Update fields
      const allowedUpdates = ['name', 'code', 'order', 'startDate', 'endDate', 'isCurrent', 'status', 'description', 'objectives', 'settings'];
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          sequence[field] = req.body[field];
        }
      });

      // Update last modified by
      if (req.user?._id) {
        sequence.lastModifiedBy = req.user._id;
      }

      const updated = await sequence.save();
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteSequence(req, res) {
    try {
      const sequence = await Sequence.findOne({
        _id: req.params.id,
        school: req.schoolId
      });

      if (!sequence) {
        return res.status(404).json({ error: 'Sequence not found.' });
      }

      await Sequence.findByIdAndDelete(sequence._id);
      res.json({ message: 'Sequence deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /* ───────────── BULK OPERATION METHODS ───────────── */

  async bulkUpdateTermStatus(req, res) {
    try {
      const { termIds, status } = req.body;

      if (!termIds || !Array.isArray(termIds) || !status) {
        return res.status(400).json({ error: 'Term IDs array and status are required.' });
      }

      const result = await Term.updateMany(
        { 
          _id: { $in: termIds },
          school: req.schoolId 
        },
        { 
          status,
          lastModifiedBy: req.user?._id 
        }
      );

      res.json({ 
        message: `${result.modifiedCount} terms updated successfully.`,
        modifiedCount: result.modifiedCount 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAcademicYearProgress(req, res) {
    try {
      const { id } = req.params;
      const academicYear = await AcademicYearDetail.findOne({
        _id: id,
        school: req.schoolId
      }).populate({
        path: 'terms',
        populate: {
          path: 'sequences',
          options: { sort: { order: 1 } }
        },
        options: { sort: { order: 1 } }
      });

      if (!academicYear) {
        return res.status(404).json({ error: "Academic year not found." });
      }

      // Calculate progress statistics
      const totalTerms = academicYear.terms.length;
      const activeTerms = academicYear.terms.filter(term => term.status === 'active').length;
      const completedTerms = academicYear.terms.filter(term => term.status === 'completed').length;
      
      let totalSequences = 0;
      let completedSequences = 0;
      
      academicYear.terms.forEach(term => {
        totalSequences += term.sequences.length;
        completedSequences += term.sequences.filter(seq => seq.status === 'completed').length;
      });

      const progress = {
        academicYear: academicYear.name,
        totalTerms,
        activeTerms,
        completedTerms,
        totalSequences,
        completedSequences,
        overallProgress: totalSequences > 0 ? Math.round((completedSequences / totalSequences) * 100) : 0
      };

      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /* ───────────── VALIDATION METHODS ───────────── */

  async validateAcademicYearDates(req, res) {
    try {
      const { startDate, endDate, academicYearId } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required.' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.json({ valid: false, error: 'Start date must be before end date.' });
      }

      // Check for overlapping academic years
      const overlapFilter = {
        school: req.schoolId,
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } }
        ]
      };

      if (academicYearId) {
        overlapFilter._id = { $ne: academicYearId };
      }

      const overlappingYears = await AcademicYearDetail.find(overlapFilter);

      if (overlappingYears.length > 0) {
        return res.json({ 
          valid: false, 
          error: 'Dates overlap with existing academic years.',
          overlappingYears: overlappingYears.map(year => year.name)
        });
      }

      res.json({ valid: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SettingController();