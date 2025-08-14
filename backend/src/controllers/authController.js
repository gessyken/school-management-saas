import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to generate JWT token
const generateToken = (userId, schoolId = null) => {
  return jwt.sign(
    { userId, schoolId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// Helper function for error responses
const errorResponse = (res, status, enMessage, frMessage) => {
  return res.status(status).json({
    message: { en: enMessage, fr: frMessage }
  });
};

// Authentication Controller
export const authController = {
  // User Login
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email })
        .select('+password +security.loginAttempts +security.lockUntil email firstName lastName memberships.school memberships.roles roles status');

      if (!user) {
        return errorResponse(res, 404,
          'Invalid credentials',
          'Identifiants invalides');
      }

      // Check if account is locked
      if (user.security.lockUntil && user.security.lockUntil > Date.now()) {
        return errorResponse(res, 403,
          'Account temporarily locked due to too many failed attempts. Please try again later.',
          'Compte temporairement verrouillé en raison de trop nombreuses tentatives infructueuses. Veuillez réessayer plus tard.');
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment failed login attempts
        await user.incrementLoginAttempts();
        return errorResponse(res, 401,
          'Invalid credentials',
          'Identifiants invalides');
      }

      // Reset login attempts on successful login
      await User.updateOne(
        { _id: user._id },
        { $set: { 'security.loginAttempts': 0, lastLogin: new Date() } }
      );

      // Populate memberships.school with school info
      await user.populate({
        path: 'memberships.school',
        select: 'name email subdomain accessStatus'
      });

      // Return user info WITHOUT password and security fields
      const userData = user.toObject();
      delete userData.password;
      delete userData.security;

      // Generate token
      const token = generateToken(user._id, null);

      res.status(200).json({
        token,
        user: userData,
        message: {
          en: 'Login successful',
          fr: 'Connexion réussie'
        }
      });

    } catch (err) {
      console.error(err);
      errorResponse(res, 500,
        'Login failed',
        'Échec de la connexion');
    }
  },

  // User Registration
  registerUser: async (req, res) => {
    try {
      const { firstName, lastName, email, password, phoneNumber, gender } = req.body;
      console.log(req.body)
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return errorResponse(res, 400,
          'User already exists with this email',
          'Un utilisateur existe déjà avec cet email');
      }

      // Create new user with default role
      const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        gender,
        roles: ['USER'] // Default role
      });
      console.log(newUser)

      await newUser.save();

      // Return user without sensitive data
      const userData = newUser.toObject();
      delete userData.password;
      delete userData.security;
      const token = generateToken(newUser._id, null);

      res.status(201).json({
        token,
        user: userData,
        message: {
          en: 'Registration successful',
          fr: 'Inscription réussie'
        }
      });

    } catch (err) {
      console.error(err);
      errorResponse(res, 500,
        'Registration failed',
        'Échec de l\'inscription');
    }
  },

  // Get User Profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.userId)
        .populate({
          path: 'memberships.school',
          select: 'name email subdomain accessStatus'
        });

      if (!user) {
        return errorResponse(res, 404,
          'User not found',
          'Utilisateur non trouvé');
      }

      // Return user without sensitive data
      const userData = user.toObject();
      delete userData.password;
      delete userData.security;

      res.status(200).json(userData);

    } catch (err) {
      console.error(err);
      errorResponse(res, 500,
        'Failed to fetch profile',
        'Échec de la récupération du profil');
    }
  },

  // Update User Profile
  updateProfile: async (req, res) => {
    try {
      const updates = req.body;

      // Remove restricted fields
      delete updates.roles;
      delete updates.status;
      delete updates.security;

      console.log(updates)
      // Fetch the user
      const user = await User.findById(req.userId);
      console.log(user)
      if (!user) {
        return errorResponse(res, 404,
          'User not found',
          'Utilisateur non trouvé'
        );
      }

      // Update attributes one by one
      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key) && key in user) {
          user[key] = updates[key];
        }
      }

      // Save user to apply validators
      await user.save();
      const userData = user.toObject();
      delete userData.password;
      delete userData.security;

      res.status(200).json({
        user: userData,
        message: {
          en: 'Profile updated successfully',
          fr: 'Profil mis à jour avec succès'
        }
      });

    } catch (err) {
      console.error(err);
      errorResponse(res, 500,
        'Failed to update profile',
        'Échec de la mise à jour du profil'
      );
    }
  },


  // Change Password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.userId).select('+password');

      if (!user) {
        return errorResponse(res, 404,
          'User not found',
          'Utilisateur non trouvé');
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return errorResponse(res, 401,
          'Current password is incorrect',
          'Le mot de passe actuel est incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        message: {
          en: 'Password changed successfully',
          fr: 'Mot de passe changé avec succès'
        }
      });

    } catch (err) {
      console.error(err);
      errorResponse(res, 500,
        'Failed to change password',
        'Échec du changement de mot de passe');
    }
  },

  // Admin: Add/Update User Roles
  updateUserRoles: async (req, res) => {
    try {
      const { userId } = req.params;
      const { roles } = req.body;

      // Check if requesting user is admin
      const requestingUser = await User.findById(req.userId);
      if (!requestingUser || !requestingUser.roles.includes('ADMIN')) {
        return errorResponse(res, 403,
          'Only admins can update roles',
          'Seuls les administrateurs peuvent mettre à jour les rôles');
      }

      // Validate roles
      const validRoles = ['USER', 'ADMIN', 'STUDENT'];
      if (!roles.every((role) => validRoles.includes(role))) {
        return errorResponse(res, 400,
          'Invalid role(s) provided',
          'Rôle(s) invalide(s) fourni(s)');
      }

      // Update user roles
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { roles } },
        { new: true }
      ).select('-password -security');

      if (!user) {
        return errorResponse(res, 404,
          'User not found',
          'Utilisateur non trouvé');
      }

      res.status(200).json({
        user,
        message: {
          en: 'User roles updated successfully',
          fr: 'Rôles utilisateur mis à jour avec succès'
        }
      });

    } catch (err) {
      console.error(err);
      errorResponse(res, 500,
        'Failed to update user roles',
        'Échec de la mise à jour des rôles utilisateur');
    }
  },

  // Admin: Get All Users
  getAllUsers: async (req, res) => {
    try {
      // Check if requesting user is admin
      const requestingUser = await User.findById(req.userId);
      if (!requestingUser || !requestingUser.roles.includes('ADMIN')) {
        return errorResponse(res, 403,
          'Only admins can access this resource',
          'Seuls les administrateurs peuvent accéder à cette ressource');
      }

      const users = await User.find({})
        .select('-password -security')
        .populate({
          path: 'memberships.school',
          select: 'name'
        });

      res.status(200).json(users);

    } catch (err) {
      console.error(err);
      errorResponse(res, 500,
        'Failed to fetch users',
        'Échec de la récupération des utilisateurs');
    }
  },

  // Forgot Password - Initiate reset
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal whether email exists or not
        return res.status(200).json({
          message: {
            en: 'If an account exists with this email, a reset link has been sent',
            fr: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé'
          }
        });
      }

      // Generate reset token (simple version - in production use crypto)
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET + user.password,
        { expiresIn: '1h' }
      );

      // TODO: Send email with reset link
      // sendResetEmail(user.email, resetToken);
      console.log(resetToken)
      res.status(200).json({
        message: {
          en: 'Password reset link sent to email',
          fr: 'Lien de réinitialisation du mot de passe envoyé par email'
        },
        // In development, return token for testing
        token: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });

    } catch (err) {
      console.error(err);
      errorResponse(res, 500,
        'Failed to process password reset request',
        'Échec du traitement de la demande de réinitialisation du mot de passe');
    }
  },

  // Reset Password - Complete reset
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      // Verify token and get user
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('+password');

      if (!user) {
        return errorResponse(res, 400,
          'Invalid or expired reset token',
          'Jeton de réinitialisation invalide ou expiré');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        message: {
          en: 'Password reset successfully',
          fr: 'Mot de passe réinitialisé avec succès'
        }
      });

    } catch (err) {
      console.error(err);
      errorResponse(res, 400,
        'Invalid or expired reset token',
        'Jeton de réinitialisation invalide ou expiré');
    }
  }
};
