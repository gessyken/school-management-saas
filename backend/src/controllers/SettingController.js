import AcademicYearDetail from '../models/AcademicYearDetail.js';
import Term from '../models/Term.js';
import Sequence from '../models/Sequence.js';

class SettingController {
  /* ───────────── Academic Year Detail ───────────── */

  async createAcademicYear(req, res) {
    try {
      // Assign school from request (e.g., middleware)
      const academicYearData = { ...req.body, school: req.schoolId };
      const academicYear = await AcademicYearDetail.create(academicYearData);
      res.status(201).json(academicYear);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAcademicYears(req, res) {
    try {
      // Restrict to current school and allow optional filters from query
      const filter = { school: req.schoolId, ...req.query };

      const years = await AcademicYearDetail.find(filter)
        .populate({
          path: 'terms',
          populate: {
            path: 'sequences',
          },
        });
      res.json(years);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAcademicYear(req, res) {
    try {
      const academicYear = await AcademicYearDetail.findOne({
        _id: req.params.id,
        school: req.schoolId, // Ensure belongs to school
      });

      if (!academicYear) {
        return res.status(404).json({ error: "Academic year not found or not authorized." });
      }

      academicYear.name = req.body.name ?? academicYear.name;
      academicYear.startDate = req.body.startDate ?? academicYear.startDate;
      academicYear.endDate = req.body.endDate ?? academicYear.endDate;
      academicYear.isCurrent = req.body.isCurrent ?? academicYear.isCurrent;

      const updated = await academicYear.save();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteAcademicYear(req, res) {
    try {
      const academicYear = await AcademicYearDetail.findOneAndDelete({
        _id: req.params.id,
        school: req.schoolId, // Restrict delete to school-owned records
      });

      if (!academicYear) {
        return res.status(404).json({ error: "Academic year not found or not authorized." });
      }

      res.json({ message: 'Academic year deleted.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /* ───────────── Term ───────────── */

  async createTerm(req, res) {
    try {
      const { academicYear: academicYearName } = req.body;
      const school = req.schoolId;
      console.log(academicYearName)
      // Validate required school field
      if (!school) {
        return res.status(400).json({ error: "School is required." });
      }

      // Find the academic year within the specified school
      const academicYear = await AcademicYearDetail.findOne({ name: academicYearName, school });
      if (!academicYear) {
        return res.status(404).json({ error: "Academic year not found for this school." });
      }

      // Set academicYear name and school explicitly to avoid inconsistencies
      req.body.academicYear = academicYear.name;
      req.body.school = school;

      // Create the term
      const term = new Term(req.body);
      console.log(term)
      await term.save()
      // Link term to academic year
      academicYear.terms.push(term._id);
      await academicYear.save();

      res.status(201).json(term);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  async getTerms(req, res) {
    try {
      // Optionally filter by school if provided as a query param
      const filter = {};
      console.log(req.schoolId)
      if (req.schoolId) {
        filter.school = req.schoolId;
      }

      const terms = await Term.find(filter).populate('sequences');
      res.json(terms);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateTerm(req, res) {
    try {
      const term = await Term.findById(req.params.id);
      if (!term) {
        return res.status(404).json({ error: "Term not found." });
      }

      // Prevent changing school or academicYear to inconsistent values
      const updates = { ...req.body };
      if (updates.school && updates.school.toString() !== term.school.toString()) {
        return res.status(400).json({ error: "Cannot change school of the term." });
      }
      if (updates.academicYear && updates.academicYear !== term.academicYear) {
        // Check that the new academicYear exists within the same school
        const validYear = await AcademicYearDetail.findOne({
          name: updates.academicYear,
          school: term.school
        });
        if (!validYear) {
          return res.status(400).json({ error: "Invalid academic year for this school." });
        }
      }

      // Update allowed fields
      Object.keys(updates).forEach(key => {
        term[key] = updates[key];
      });

      const updated = await term.save();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTerm(req, res) {
    try {
      const term = await Term.findById(req.params.id);
      if (!term) {
        return res.status(404).json({ error: "Term not found." });
      }

      // Remove term from academic year’s terms list
      const academicYear = await AcademicYearDetail.findOne({ name: term.academicYear, school: term.school });
      if (academicYear) {
        academicYear.terms = academicYear.terms.filter(
          (termId) => termId.toString() !== term._id.toString()
        );
        await academicYear.save();
      }

      await term.deleteOne();
      res.json({ message: "Term deleted." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  /* ───────────── Create Sequence ───────────── */
  async createSequence(req, res) {
    try {
      const { term: termId, ...rest } = req.body;
      const schoolId = req.schoolId;
      
      if (!termId || !schoolId) {
        return res.status(400).json({ error: 'Term and school are required.' });
      }

      // Verify term exists and belongs to the specified school
      const term = await Term.findOne({ _id: termId, school: schoolId });
      if (!term) {
        return res.status(404).json({ error: 'Term not found or does not belong to the school.' });
      }

      // Create the sequence with school and term
      const sequence = await Sequence.create({ ...rest, term: termId, school: schoolId });

      // Add sequence to term's sequences array if not already present
      if (!term.sequences.includes(sequence._id)) {
        term.sequences.push(sequence._id);
        await term.save();
      }

      res.status(201).json(sequence);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  /* ───────────── Get Sequences ───────────── */
  async getSequences(req, res) {
    try {
      // Optional: you can filter by school or term via query parameters
      const filter = { ...req.query };

      // If school filter exists, ensure it's used correctly
      if (req.schoolId) {
        filter.school = req.schoolId;
      }

      const sequences = await Sequence.find(filter).populate('term');
      res.json(sequences);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  /* ───────────── Update Sequence ───────────── */
  async updateSequence(req, res) {
    try {
      const sequence = await Sequence.findById(req.params.id);
      if (!sequence) {
        return res.status(404).json({ error: 'Sequence not found.' });
      }

      // If term or school is being updated, validate them
      if (req.body.term || req.schoolId) {
        const newTermId = req.body.term ?? sequence.term.toString();
        const newSchoolId = req.schoolId ?? sequence.school.toString();

        const term = await Term.findOne({ _id: newTermId, school: newSchoolId });
        if (!term) {
          return res.status(400).json({ error: 'Term not found or does not belong to the specified school.' });
        }

        // If term changed, update old and new term sequences arrays
        if (req.body.term && sequence.term.toString() !== req.body.term) {
          // Remove from old term
          await Term.findByIdAndUpdate(sequence.term, { $pull: { sequences: sequence._id } });
          // Add to new term
          await Term.findByIdAndUpdate(req.body.term, { $addToSet: { sequences: sequence._id } });
        }
      }

      // Update all allowed fields
      ['name', 'startDate', 'endDate', 'isActive', 'term', 'school'].forEach(field => {
        if (req.body[field] !== undefined) {
          sequence[field] = req.body[field];
        }
      });

      const updated = await sequence.save();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  /* ───────────── Delete Sequence ───────────── */
  async deleteSequence(req, res) {
    try {
      const sequence = await Sequence.findById(req.params.id);
      if (!sequence) {
        return res.status(404).json({ error: 'Sequence not found.' });
      }

      // Remove sequence reference from term
      await Term.findByIdAndUpdate(sequence.term, {
        $pull: { sequences: sequence._id }
      });

      // Delete the sequence
      await sequence.deleteOne();

      res.json({ message: 'Sequence deleted.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SettingController();
