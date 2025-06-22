import User from '../models/User.js';
import School from '../models/School.js';
import { generateToken } from '../utils/jwtUtils.js';

// Register a user under a specific school
export const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      gender,
      memberships: [] // No school yet
    });

    await user.save();

    const token = generateToken(user._id, null); // no school yet
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'User registration failed', error: err.message });
  }
};


// Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password, schoolId } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Ensure user is a member of the school
    const membership = user.memberships.find(m => m.school.toString() === schoolId);
    if (!membership) {
      return res.status(403).json({ message: 'User not registered in this school' });
    }

    const token = generateToken(user._id, schoolId);
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Get current user (from token)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};
