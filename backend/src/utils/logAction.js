import Log from '../models/Log.js';

/**
 * Logs a system or user action into the logs collection
 * @param {Object} params - Log parameters
 * @param {'CREATE'|'UPDATE'|'DELETE'|'LOGIN'|'LOGOUT'|'ERROR'|'VIEW'|'PAYMENT'} params.action - Type of action
 * @param {String} params.module - Affected module (e.g. 'Student', 'Fee', 'AcademicYear')
 * @param {String} params.description - Human-readable description of what happened
 * @param {mongoose.Types.ObjectId} [params.user] - User ID (optional)
 * @param {mongoose.Types.ObjectId} params.school - School ID
 * @param {Object} [params.metadata] - Additional details (e.g. changes, object IDs)
 * @param {String} [params.ipAddress] - IP address (optional)
 * @param {String} [params.userAgent] - Device or browser info (optional)
 */
export async function logAction({
  action,
  module,
  description,
  user = null,
  school,
  metadata = {},
  ipAddress = null,
  userAgent = null,
}) {
  try {
    await Log.create({
      action,
      module,
      description,
      user,
      school,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('Failed to log action:', err.message);
    // You may also want to log to a fallback file or monitoring system here
  }
}
