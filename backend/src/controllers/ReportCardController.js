import { AcademicYear } from '../models/AcademicYear.js';
import Student from '../models/Student.js';
import Classes from '../models/Classes.js';
import AcademicYearDetail from '../models/AcademicYearDetail.js';

class ReportCardController {
  // Generate individual report card
  async generateIndividualReportCard(req, res) {
    try {
      const { studentId, year, termIndex } = req.params;
      
      // Validate student
      const student = await Student.findById(studentId)
        .populate('user', 'firstName lastName');
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Find academic year
      const academicYear = await AcademicYear.findOne({ student: studentId, year })
        .populate('classes')
        .populate({
          path: 'terms.termInfo',
          model: 'Term'
        })
        .populate({
          path: 'terms.sequences.sequenceInfo',
          model: 'Sequence'
        })
        .populate({
          path: 'terms.sequences.subjects.subjectInfo',
          model: 'Subject'
        });
      
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found for this student' });
      }
      
      // Generate report card data
      let reportCardData;
      
      if (termIndex !== undefined) {
        // Generate report for specific term
        if (!academicYear.terms[termIndex]) {
          return res.status(404).json({ message: 'Term not found' });
        }
        
        const term = academicYear.terms[termIndex];
        
        reportCardData = {
          student: {
            id: student._id,
            name: `${student.user.firstName} ${student.user.lastName}`,
            class: academicYear.classes ? academicYear.classes.classesName : 'N/A'
          },
          academicYear: academicYear.year,
          term: {
            name: term.termInfo ? term.termInfo.name : `Term ${parseInt(termIndex) + 1}`,
            average: term.average,
            rank: term.rank,
            discipline: term.discipline,
            sequences: term.sequences.map(sequence => ({
              name: sequence.sequenceInfo ? sequence.sequenceInfo.name : 'Unknown Sequence',
              average: sequence.average,
              rank: sequence.rank,
              subjects: sequence.subjects.map(subject => ({
                name: subject.subjectInfo ? subject.subjectInfo.subjectName : 'Unknown Subject',
                code: subject.subjectInfo ? subject.subjectInfo.subjectCode : 'N/A',
                mark: subject.marks.currentMark,
                isActive: subject.isActive && subject.marks.isActive
              }))
            }))
          }
        };
      } else {
        // Generate full year report
        reportCardData = {
          student: {
            id: student._id,
            name: `${student.user.firstName} ${student.user.lastName}`,
            class: academicYear.classes ? academicYear.classes.classesName : 'N/A'
          },
          academicYear: academicYear.year,
          overallAverage: academicYear.overallAverage,
          overallStatus: academicYear.overallStatus,
          hasCompleted: academicYear.hasCompleted,
          terms: academicYear.terms.map(term => ({
            name: term.termInfo ? term.termInfo.name : 'Unknown Term',
            average: term.average,
            rank: term.rank,
            discipline: term.discipline
          })),
          fees: {
            total: academicYear.totalFeesPaid,
            details: academicYear.fees
          }
        };
      }
      
      res.json({ reportCard: reportCardData });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // Generate class report cards
  async generateClassReportCards(req, res) {
    try {
      const { classId, year, termIndex } = req.params;
      
      // Validate class
      const classData = await Classes.findById(classId);
      if (!classData) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      // Find all academic years for students in this class
      const academicYears = await AcademicYear.find({
        classes: classId,
        year
      })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          model: 'User',
          select: 'firstName lastName'
        }
      });
      
      if (!academicYears.length) {
        return res.status(404).json({ message: 'No academic records found for this class' });
      }
      
      // Generate report cards
      const reportCards = [];
      
      for (const academicYear of academicYears) {
        let reportCardData;
        
        if (termIndex !== undefined) {
          // Generate report for specific term
          if (!academicYear.terms[termIndex]) {
            continue; // Skip if term not found
          }
          
          const term = academicYear.terms[termIndex];
          
          reportCardData = {
            student: {
              id: academicYear.student._id,
              name: `${academicYear.student.user.firstName} ${academicYear.student.user.lastName}`
            },
            average: term.average,
            rank: term.rank,
            discipline: term.discipline
          };
        } else {
          // Generate full year report
          reportCardData = {
            student: {
              id: academicYear.student._id,
              name: `${academicYear.student.user.firstName} ${academicYear.student.user.lastName}`
            },
            overallAverage: academicYear.overallAverage,
            overallStatus: academicYear.overallStatus,
            hasCompleted: academicYear.hasCompleted
          };
        }
        
        reportCards.push(reportCardData);
      }
      
      // Sort by average
      reportCards.sort((a, b) => {
        const aAvg = a.average || a.overallAverage || 0;
        const bAvg = b.average || b.overallAverage || 0;
        return bAvg - aAvg;
      });
      
      // Assign ranks
      reportCards.forEach((card, index) => {
        card.rank = index + 1;
      });
      
      // Calculate class statistics
      const classStats = {
        totalStudents: reportCards.length,
        averagePerformance: 0,
        passingRate: 0,
        failingRate: 0
      };
      
      let totalAverage = 0;
      let passingCount = 0;
      
      for (const card of reportCards) {
        const avg = card.average || card.overallAverage || 0;
        totalAverage += avg;
        
        if ((termIndex !== undefined && avg >= 10) || 
            (termIndex === undefined && card.hasCompleted)) {
          passingCount++;
        }
      }
      
      classStats.averagePerformance = parseFloat((totalAverage / reportCards.length).toFixed(2));
      classStats.passingRate = parseFloat(((passingCount / reportCards.length) * 100).toFixed(2));
      classStats.failingRate = parseFloat((100 - classStats.passingRate).toFixed(2));
      
      res.json({
        class: {
          id: classData._id,
          name: classData.classesName,
          year
        },
        term: termIndex !== undefined ? `Term ${parseInt(termIndex) + 1}` : 'Full Year',
        statistics: classStats,
        reportCards
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // Generate school-wide performance report
  async generateSchoolPerformanceReport(req, res) {
    try {
      const { year } = req.params;
      
      // Validate academic year
      const academicYearDetail = await AcademicYearDetail.findOne({ name: year });
      if (!academicYearDetail) {
        return res.status(404).json({ message: 'Academic year not found' });
      }
      
      // Get all classes for this year
      const classes = await Classes.find({ year });
      
      if (!classes.length) {
        return res.status(404).json({ message: 'No classes found for this academic year' });
      }
      
      // Get all academic years for this year
      const academicYears = await AcademicYear.find({ year })
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            model: 'User',
            select: 'firstName lastName'
          }
        })
        .populate('classes', 'classesName');
      
      if (!academicYears.length) {
        return res.status(404).json({ message: 'No academic records found for this year' });
      }
      
      // Calculate school-wide statistics
      const schoolStats = {
        totalStudents: academicYears.length,
        averagePerformance: 0,
        passingRate: 0,
        failingRate: 0,
        excellentStudents: 0,
        goodStudents: 0,
        averageStudents: 0,
        belowAverageStudents: 0,
        classSummary: []
      };
      
      // Calculate overall statistics
      let totalAverage = 0;
      let passingCount = 0;
      
      for (const ay of academicYears) {
        totalAverage += ay.overallAverage;
        
        if (ay.hasCompleted) {
          passingCount++;
        }
        
        // Count by performance level
        if (ay.overallAverage >= 16) {
          schoolStats.excellentStudents++;
        } else if (ay.overallAverage >= 14) {
          schoolStats.goodStudents++;
        } else if (ay.overallAverage >= 10) {
          schoolStats.averageStudents++;
        } else {
          schoolStats.belowAverageStudents++;
        }
      }
      
      schoolStats.averagePerformance = parseFloat((totalAverage / academicYears.length).toFixed(2));
      schoolStats.passingRate = parseFloat(((passingCount / academicYears.length) * 100).toFixed(2));
      schoolStats.failingRate = parseFloat((100 - schoolStats.passingRate).toFixed(2));
      
      // Calculate class summaries
      const classMap = {};
      
      for (const ay of academicYears) {
        if (!ay.classes) continue;
        
        const classId = ay.classes._id.toString();
        const className = ay.classes.classesName;
        
        if (!classMap[classId]) {
          classMap[classId] = {
            id: classId,
            name: className,
            totalStudents: 0,
            averagePerformance: 0,
            passingRate: 0,
            totalAverage: 0,
            passingCount: 0
          };
        }
        
        classMap[classId].totalStudents++;
        classMap[classId].totalAverage += ay.overallAverage;
        
        if (ay.hasCompleted) {
          classMap[classId].passingCount++;
        }
      }
      
      // Calculate final class statistics
      for (const classId in classMap) {
        const classStat = classMap[classId];
        
        classStat.averagePerformance = parseFloat((classStat.totalAverage / classStat.totalStudents).toFixed(2));
        classStat.passingRate = parseFloat(((classStat.passingCount / classStat.totalStudents) * 100).toFixed(2));
        
        delete classStat.totalAverage;
        delete classStat.passingCount;
        
        schoolStats.classSummary.push(classStat);
      }
      
      // Sort classes by performance
      schoolStats.classSummary.sort((a, b) => b.averagePerformance - a.averagePerformance);
      
      res.json({
        academicYear: year,
        statistics: schoolStats
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // Generate student progress report (comparing multiple terms or years)
  async generateStudentProgressReport(req, res) {
    try {
      const { studentId } = req.params;
      const { years } = req.query;
      
      // Validate student
      const student = await Student.findById(studentId)
        .populate('user', 'firstName lastName');
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Parse years to compare
      let yearsToCompare = [];
      if (years) {
        yearsToCompare = years.split(',');
      } else {
        // If no years specified, get all years for student
        const allAcademicYears = await AcademicYear.find({ student: studentId })
          .distinct('year');
        yearsToCompare = allAcademicYears;
      }
      
      if (!yearsToCompare.length) {
        return res.status(400).json({ message: 'No valid academic years specified' });
      }
      
      // Get academic years data
      const academicYearsData = await Promise.all(
        yearsToCompare.map(async (year) => {
          const academicYear = await AcademicYear.findOne({ student: studentId, year })
            .populate('classes', 'classesName');
          
          if (!academicYear) return null;
          
          return {
            year,
            class: academicYear.classes ? academicYear.classes.classesName : 'N/A',
            overallAverage: academicYear.overallAverage,
            hasCompleted: academicYear.hasCompleted,
            termAverages: academicYear.terms.map((term, index) => ({
              term: `Term ${index + 1}`,
              average: term.average
            }))
          };
        })
      );
      
      // Filter out null values
      const validAcademicYears = academicYearsData.filter(ay => ay !== null);
      
      if (!validAcademicYears.length) {
        return res.status(404).json({ message: 'No academic records found for this student' });
      }
      
      // Generate progress report
      const progressReport = {
        student: {
          id: student._id,
          name: `${student.user.firstName} ${student.user.lastName}`
        },
        yearlyProgress: validAcademicYears.map(ay => ({
          year: ay.year,
          class: ay.class,
          overallAverage: ay.overallAverage,
          hasCompleted: ay.hasCompleted
        })),
        termProgress: {}
      };
      
      // Organize term progress data
      validAcademicYears.forEach(ay => {
        ay.termAverages.forEach(term => {
          if (!progressReport.termProgress[term.term]) {
            progressReport.termProgress[term.term] = [];
          }
          
          progressReport.termProgress[term.term].push({
            year: ay.year,
            average: term.average
          });
        });
      });
      
      res.json({ progressReport });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  // Generate comparative analysis between classes
async generateClassComparison(req, res) {
  try {
    const { year, classIds } = req.body;
    
    if (!year || !classIds || !Array.isArray(classIds) || classIds.length < 2) {
      return res.status(400).json({ 
        message: 'Year and at least two class IDs are required for comparison' 
      });
    }
    
    // Validate classes
    const classes = await Classes.find({ _id: { $in: classIds } });
    if (classes.length !== classIds.length) {
      return res.status(404).json({ message: 'One or more classes not found' });
    }
    
    // Get academic data for all students in these classes
    const classPerformance = await Promise.all(
      classes.map(async (classData) => {
        // Find students in this class
        const students = await Student.find({ classes: classData._id });
        const studentIds = students.map(s => s._id);
        
        // Get academic records for these students
        const academicRecords = await AcademicYear.find({
          student: { $in: studentIds },
          year
        });
        
        // Calculate class statistics
        const classAverage = academicRecords.length > 0 
          ? academicRecords.reduce((sum, record) => sum + record.overallAverage, 0) / academicRecords.length
          : 0;
          
        const passingRate = academicRecords.length > 0
          ? (academicRecords.filter(r => r.hasCompleted).length / academicRecords.length) * 100
          : 0;
          
        // Get subject performance
        const subjectPerformance = {};
        academicRecords.forEach(record => {
          record.terms.forEach(term => {
            term.sequences.forEach(seq => {
              seq.subjects.forEach(subject => {
                const subjectName = subject.subjectInfo?.subjectName || 'Unknown';
                
                if (!subjectPerformance[subjectName]) {
                  subjectPerformance[subjectName] = {
                    totalMarks: 0,
                    count: 0
                  };
                }
                
                subjectPerformance[subjectName].totalMarks += subject.marks.currentMark;
                subjectPerformance[subjectName].count++;
              });
            });
          });
        });
        
        // Calculate average for each subject
        const subjectAverages = Object.entries(subjectPerformance).map(([name, data]) => ({
          subject: name,
          average: data.count > 0 ? parseFloat((data.totalMarks / data.count).toFixed(2)) : 0
        }));
        
        return {
          classId: classData._id,
          className: classData.classesName,
          studentCount: students.length,
          classAverage: parseFloat(classAverage.toFixed(2)),
          passingRate: parseFloat(passingRate.toFixed(2)),
          subjectPerformance: subjectAverages
        };
      })
    );
    
    res.json({
      year,
      classComparison: classPerformance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Generate fee payment status report
async generateFeePaymentReport(req, res) {
  try {
    const { year, classId } = req.query;
    
    if (!year) {
      return res.status(400).json({ message: 'Academic year is required' });
    }
    
    // Build query
    const query = { year };
    let students = [];
    
    if (classId) {
      // Get students in specific class
      const classStudents = await Student.find({ classes: classId });
      students = classStudents.map(s => s._id);
      query.student = { $in: students };
    }
    
    // Get academic records with fee information
    const academicRecords = await AcademicYear.find(query)
      .populate('student')
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('classes', 'classesName');
    
    // Generate fee payment report
    const feeReport = academicRecords.map(record => ({
      studentId: record.student._id,
      studentName: record.student.user 
        ? `${record.student.user.firstName} ${record.student.user.lastName}`
        : 'Unknown',
      class: record.classes?.classesName || 'N/A',
      totalFees: record.fees.reduce((sum, fee) => sum + (fee.amount || 0), 0),
      feeDetails: record.fees.map(fee => ({
        billID: fee.billID,
        type: fee.type,
        amount: fee.amount,
        date: fee.date
      }))
    }));
    
    res.json({
      year,
      feeReport
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
}

export default new ReportCardController();