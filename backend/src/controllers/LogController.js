import Log from '../models/Log.js';

class LogController {
    // GET: All logs (with optional filters like module, user, action, school, date range)
    async getAllLogs(req, res) {
        try {
            const { action, module, userId, schoolId, fromDate, toDate } = req.query;

            const query = {};
            if (action) query.action = action;
            if (module) query.module = module;
            if (userId) query.user = userId;
            if (schoolId) query.school = schoolId;
            if (fromDate || toDate) {
                query.createdAt = {};
                if (fromDate) query.createdAt.$gte = new Date(fromDate);
                if (toDate) query.createdAt.$lte = new Date(toDate);
            }

            const logs = await Log.find(query)
                .sort({ createdAt: -1 })
                .populate('user', 'firstName lastName email')
                .populate('school', 'name');

            res.json({ logs });
        } catch (err) {
            console.error('Failed to fetch logs:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    // GET: Logs for a specific school (based on req.schoolId)
    // GET logs by schoolId from req.schoolId with optional filters
    async getLogsBySchool(req, res) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId) {
                return res.status(403).json({ message: 'School ID missing in request' });
            }

            const { action, module, userId, fromDate, toDate } = req.query;

            const query = { school: schoolId };

            if (action) query.action = action;
            if (module) query.module = module;
            if (userId) query.user = userId;
            if (fromDate || toDate) {
                query.createdAt = {};
                if (fromDate) query.createdAt.$gte = new Date(fromDate);
                if (toDate) query.createdAt.$lte = new Date(toDate);
            }

            const logs = await Log.find(query)
                .sort({ createdAt: -1 })
                .populate('user', 'firstName lastName email');

            res.json(logs);
        } catch (err) {
            console.error('Failed to fetch logs by school:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

}

export default new LogController();
