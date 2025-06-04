import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class UserController {
  // Authentication
  async register(req, res) {
    try {
      const { firstName, lastName, email, password, phoneNumber, gender, roles } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      const user = new User({
        firstName, 
        lastName, 
        email, 
        password, 
        phoneNumber, 
        gender,
        roles: roles || 'user'
      });
      
      await user.save();
      
      // Generate JWT token
      const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findOne({ email }).select('+password +security');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check if account is locked
      if (user.isLocked) {
        return res.status(403).json({ 
          message: 'Account locked due to too many failed attempts. Try again later.' 
        });
      }
      
      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment login attempts
        await user.incrementLoginAttempts();
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Reset login attempts on successful login
      if (user.security.loginAttempts > 0) {
        user.security.loginAttempts = 0;
        user.security.lockUntil = undefined;
        await user.save();
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Generate JWT token
      const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // User profile management
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, phoneNumber, gender } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { firstName, lastName, phoneNumber, gender },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ 
        message: 'Profile updated successfully',
        user 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Find user by ID
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // Admin functions for user management
  async getAllUsers(req, res) {
    try {
      console.log(req.query)
      const users = await User.find(req.query);
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  async updateUser(req, res) {
    try {
      const { firstName, lastName, email, phoneNumber, gender, roles, status } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { firstName, lastName, email, phoneNumber, gender, roles, status },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ 
        message: 'User updated successfully',
        user 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new UserController();