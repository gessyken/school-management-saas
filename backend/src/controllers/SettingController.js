import AcademicYearDetail from '../models/AcademicYearDetail.js';
import Term from '../models/Term.js';
import Sequence from '../models/Sequence.js';

class SettingController {
  /* ───────────── Academic Year Detail ───────────── */
  
  async createAcademicYear(req, res) {
    try {
      const academicYear = await AcademicYearDetail.create(req.body);
      res.status(201).json(academicYear);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAcademicYears(req, res) {
    try {
      const years = await AcademicYearDetail.find(req.query)
      .populate({
        path: 'terms',
        populate: {
            path: 'sequences'
        }
    })
      res.json(years);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAcademicYear(req, res) {
    try {
      const academicYear = await AcademicYearDetail.findById(req.params.id);
      if (!academicYear) {
        return res.status(404).json({ error: "Academic year not found." });
      }
  
      // Update fields manually from request body
      academicYear.name = req.body.name ?? academicYear.name;
      academicYear.startDate = req.body.startDate ?? academicYear.startDate;
      academicYear.endDate = req.body.endDate ?? academicYear.endDate;
      academicYear.isCurrent = req.body.isCurrent ?? academicYear.isCurrent;
  
      // Save the updated document
      const updated = await academicYear.save();
  
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }
  

  async deleteAcademicYear(req, res) {
    try {
      await AcademicYearDetail.findByIdAndDelete(req.params.id);
      res.json({ message: 'Academic year deleted.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /* ───────────── Term ───────────── */

  async createTerm(req, res) {
    try {
      const academicYear = await AcademicYearDetail.findOne({ name: req.body.academicYear });
      
      // Link term to academic year
      if (academicYear) {
        req.body.academicYear = academicYear.name
        console.log(req.body)
        const term = await Term.create(req.body);
        academicYear.terms.push(term._id);
        await academicYear.save();
        res.status(201).json(term);
      }else
      res.status(404).json({ error: "academic year select no found" });
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error.message });
    }
  }

  async getTerms(req, res) {
    try {
      const terms = await Term.find(req.query).populate('sequences');
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTerm(req, res) {
    try {
      const term = await Term.findById(req.params.id);
      if (!term) {
        return res.status(404).json({ error: "Term not found." });
      }
      
      // Manually update the fields
      console.log(term)
      Object.keys(req.body).forEach((key) => {
        term[key] = req.body[key];
      });
      console.log(term)
  
      const updated = await term.save();
      console.log(updated)
  
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  

  async deleteTerm(req, res) {
    try {
      const term = await Term.findById(req.params.id);
      if (!term) {
        return res.status(404).json({ error: "Term not found." });
      }
  
      const academicYear = await AcademicYearDetail.findOne({ name: term.academicYear });
      if (academicYear) {
        academicYear.terms = academicYear.terms.filter(
          (termId) => termId.toString() !== term._id.toString()
        );
        await academicYear.save();
      }
  
      await term.deleteOne();
  
      res.json({ message: "Term deleted." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  /* ───────────── Sequence ───────────── */

  async createSequence(req, res) {
    try {
      console.log(req.body)
      const term = await Term.findOne({ _id: req.body.term });
      
      if (term) {  
        const sequence = await Sequence.create(req.body);
        term.sequences.push(sequence._id);
        await term.save()
        res.status(201).json(sequence);
      }else
        res.status(404).json({ error: "term  select no found" });
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error.message });
    }
  }

  async getSequences(req, res) {
    try {
      const sequences = await Sequence.find(req.query).populate('term');
      res.json(sequences);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateSequence(req, res) {
    try {
      // console.log(req.body);
      const sequence = await Sequence.findById(req.params.id);
      if (!sequence) {
        return res.status(404).json({ error: "Sequence not found" });
      }
  
      // Update fields manually
      delete req.body.term
      console.log(req.body)
      Object.keys(req.body).forEach((key) => {
        sequence[key] = req.body[key];
      });
  
      const updated = await sequence.save(); // Save updated document
      res.json(updated);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
  

  async deleteSequence(req, res) {
    try {
      const sequence = await Sequence.findById(req.params.id);
      if (!sequence) {
        return res.status(404).json({ error: "Sequence not found." });
      }
  
      const term = await Term.findOne({ _id: sequence.term });
      console.log(term)
      if (term) {
        term.sequences = term.sequences.filter(
          (seqId) => seqId.toString() !== sequence._id.toString()
        );
        await term.save();
      }
  
      await sequence.deleteOne();
      res.json({ message: 'Sequence deleted.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SettingController();
