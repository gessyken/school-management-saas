

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false  // Do not return by default
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[0-9]{7,15}$/, 'Invalid phone number format']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  roles: {
    type: [String],
    enum: ['USER', 'ADMIN'], default: 'USER'
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false }
  },
  // Account status and activity tracking.
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'banned'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  memberships: [{
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true
    },
    roles: [{
      type: String,
      enum: ['DIRECTOR', 'SECRETARY', 'TEACHER', 'ADMIN','FINANCE']
    }],
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive', 'suspended'],
      default: 'pending'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    invitedAt: {
      type: Date,
      // default: Date.now
    },
    expiredAt: {
      type: Date,
      // default: Date.now
    },
    joinedAt: {
      type: Date,
      // default: Date.now
    }
  }]

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      // Remove sensitive fields when converting to JSON
      delete ret.password;
      delete ret.security;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash the password if it has been modified.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to securely compare passwords.
userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log('Comparing passwords...');
  console.log('Stored Password:', this.password);
  console.log('Provided Password:', candidatePassword);
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log('Password Match:', isMatch);
  return isMatch;
};

// Virtual to check if the account is locked.
userSchema.virtual('isLocked').get(function () {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

userSchema.methods.incrementLoginAttempts = function () {

  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { 'security.loginAttempts': 1 },
      $unset: { 'security.lockUntil': 1 }
    });
  }

  const updates = { $inc: { 'security.loginAttempts': 1 } };

  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'security.lockUntil': Date.now() + (4 * 60 * 60 * 1000) }; // Lock for 4 hours.
  }

  return this.updateOne(updates);

};

const User = mongoose.model('User', userSchema);
export default User;