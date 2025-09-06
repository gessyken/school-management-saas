import { logAction } from '../utils/logAction.js';

export const requestLogger = async (req, res, next) => {
  const start = Date.now();

  // Hook after response finishes
  res.on('finish', async () => {
    try {
      if (req.skipLog) return; // Allow skipping logging for certain routes

      const duration = Date.now() - start;
      const user = req.user?._id || null;
      const school = req.schoolId || null;

      // Check for custom log via req._manualLog
      const customLog = req.log;

      const logPayload = {
        action: customLog?.action || 'VIEW',
        module: customLog?.module || 'Request',
        description: customLog?.description ||
          `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
        user,
        school: school || '000000000000000000000000', // Default ObjectId if no school
        metadata: customLog?.metadata || {
          query: req.query,
          params: req.params,
          body: req.body
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      await logAction(logPayload);
    } catch (err) {
      console.error('Request logging failed:', err.message);
    }
  });

  next();
};
