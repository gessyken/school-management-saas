// Middleware to check if the school is blocked or suspended
const checkSchoolAccess = async (req, res, next) => {
  const school = req.school; // Assume you've loaded the school earlier from auth or subdomain

  if (!school) {
    return res.status(403).json({ message: 'School not found' });
  }

  if (school.accessStatus === 'blocked') {
    return res.status(403).json({ message: 'School is blocked: ' + school.blockReason });
  }

  if (school.accessStatus === 'suspended') {
    return res.status(403).json({ message: 'School is suspended: ' + school.blockReason });
  }

  next();
};
