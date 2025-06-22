import User from '../models/User.js';
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


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password memberships.school memberships.roles ');
    if (!user) return res.status(404).json({ message: 'Invalid credentials' });

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Populate memberships.school with school info (name, etc)
    await user.populate({
      path: 'memberships.school',
      select: 'name email subdomain accessStatus' // select fields you want to expose
    });


    // Return user info WITHOUT password, and schools list
    const userData = user.toObject();
    delete userData.password;
    delete userData.security;

    // Token without school selected yet, user just logged in
    const token = generateToken(user._id, null);

    res.status(200).json({ token, user: userData, });

  } catch (err) {
    console.log(err)
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
