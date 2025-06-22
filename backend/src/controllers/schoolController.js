import School from '../models/School.js';
import User from '../models/User.js';
import { generateToken } from '../utils/jwtUtils.js';

// Register a new school
export const registerSchool = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(403).json({ message: 'Invalid user' });

    const { name, email, phone, address, subdomain } = req.body;

    // const existingSchool = await School.findOne({ email });
    // if (existingSchool) return res.status(400).json({ message: 'School already exists' });

    const school = await School.create({
      name,
      email,
      phone,
      address,
      subdomain,
      members:[user._id],
      createdBy: user._id
    });

    // Add school membership to user
    user.memberships.push({
      school: school._id,
      roles: ['ADMIN', 'DIRECTOR'],
      status: 'active'
    });

    await user.save();

    const token = generateToken(user._id, school._id); // now user is tied to school
    res.status(201).json({ token, user, school });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Failed to create school', error: err.message });
  }
};

// Get all schools (for admin panel)
export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 })
    .populate('members');
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schools', error: err.message });
  }
};

// Block or unblock school
export const updateSchoolAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { accessStatus, blockReason } = req.body;

    const school = await School.findById(id);
    if (!school) return res.status(404).json({ message: 'School not found' });

    school.accessStatus = accessStatus;
    school.blockReason = blockReason || '';
    await school.save();

    res.status(200).json({ message: 'School updated', school });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update school access', error: err.message });
  }
};

export const switchSchool = async (req, res) => {
  const { schoolId } = req.body;

  const user = await User.findById(req.userId);
  const membership = user.memberships.find(m => m.school.toString() === schoolId);

  if (!membership) {
    return res.status(403).json({ message: 'User not part of this school' });
  }

  const token = generateToken(user._id, schoolId);
  res.status(200).json({ message: 'Switched school', token });
};
