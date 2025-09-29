import User from '../models/User.js';

class UserController {
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
  async getAllUsersPerSchool(req, res) {
    try {
      console.log(req.query)
      const { role, status, search } = req.query;
      const schoolId = req.schoolId; // Assuming this is set by middleware
      console.log("schoolId",schoolId)
      if (!schoolId) {
        return res.status(400).json({ message: 'Select a school first' });
      }
      const filter = {
        'memberships.school': schoolId,  // users who belong to this school
      };

      // Filter by membership role inside memberships array using $elemMatch
      if (role) {
        filter.memberships = {
          $elemMatch: {
            school: schoolId,
            roles: role.toUpperCase(),
          }
        };
      }

      // Filter by membership status
      if (status) {
        filter.memberships = filter.memberships || {};
        if (filter.memberships.$elemMatch) {
          filter.memberships.$elemMatch.status = status;
        } else {
          filter.memberships = {
            $elemMatch: {
              school: schoolId,
              status: status,
            }
          };
        }
      }

      // Text search on user basic info fields (firstName, lastName, email, phoneNumber)
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
        ];
      }

      // Query users matching filter
      const users = await User.find(filter)
        // .select('-password -security')
        //.populate('classId', 'classesName level year') // Uncomment if classId exists and you want to populate
        //.populate('subjects', 'subjectName')           // Uncomment if subjects exist on user schema
        .sort({ lastName: 1, firstName: 1 });

      res.json({ users });
    } catch (error) {
      console.log(error)
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