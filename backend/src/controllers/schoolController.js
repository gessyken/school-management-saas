import School from '../models/School.js';
import User from '../models/User.js';
import { generateRandom8Char } from '../utils/helper.js';
import { generateToken } from '../utils/jwtUtils.js';

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/school-logos/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'school-logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const uploadLogo = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Register a new school
export const registerSchool = async (req, res) => {

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(403).json({ message: 'Invalid user' });
    }

    const {
      name,
      email,
      phone,
      address,
      system_type,
      motto,
      type,
      plan = 'FREE'
    } = req.body;

    // Check if school with email already exists
    const existingSchool = await School.findOne({ email });
    if (existingSchool) {
      return res.status(400).json({ message: 'School with this email already exists' });
    }

    // Set trial period (30 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    // Prepare school data
    const schoolData = {
      name,
      email: email.toLowerCase(),
      phone,
      address,
      system_type,
      motto,
      type,
      plan,
      members: [user._id],
      createdBy: user._id,
      principal: user._id, // Set creator as principal initially
      billing: {
        status: "trialing",
        trialEndsAt: trialEndsAt
      },
      usage: {
        studentsCount: 0, // Start with 0
        staffCount: 1, // Include the creator
        classCount: 0,
        lastUsageCalculated: new Date()
      }
    };

    // Add logo URL if file was uploaded
    if (req.file) {
      schoolData.logoUrl = `/uploads/school-logos/${req.file.filename}`;
    }

    const school = await School.create([schoolData]);

    // Add school membership to user with ADMIN and DIRECTOR roles
    user.memberships.push({
      school: school[0]._id,
      roles: ['ADMIN', 'DIRECTOR'],
      status: 'active'
    });

    await user.save();

    const token = generateToken(user._id, school[0]._id);

    res.status(201).json({
      success: true,
      message: 'School registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      school: school[0]
    });

  } catch (err) {
    console.error('School registration error:', err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'School with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create school',
      error: err.message
    });
  }
};

// Update school logo
export const updateSchoolLogo = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const user = await User.findById(req.userId);

    // Check if user has permission to update this school
    const userMembership = user.memberships.find(
      membership => membership.school.toString() === schoolId &&
        membership.roles.includes('ADMIN')
    );

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update school logo'
      });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    console.log("req.file", req.file)
    console.log("req.file", req.files)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided'
      });
    }

    // Update logo URL
    school.logoUrl = `/uploads/school-logos/${req.file.filename}`;
    await school.save();

    res.json({
      success: true,
      message: 'School logo updated successfully',
      logoUrl: school.logoUrl
    });

  } catch (err) {
    console.error('Update logo error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update school logo',
      error: err.message
    });
  }
};

// Get school profile
export const getSchoolProfile = async (req, res) => {
  try {
    const school = await School.findById(req.schoolId)
      .populate('principal', 'name email')
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    res.json({
      success: true,
      school
    });

  } catch (err) {
    console.error('Get school profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school profile',
      error: err.message
    });
  }
};
/**End here */

// Get all schools (for admin panel)
export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 })
      .populate('principal')
      .populate('members');
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schools', error: err.message });
  }
};

// Get only schools of the current user
export const getUserSchools = async (req, res) => {
  try {
    const userId = req.userId; // set by protect middleware
    const schools = await School.find({
      $or: [
        { members: userId },
        { createdBy: userId }
      ]
    })
      .populate('principal')
      .sort({ createdAt: -1 });
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user schools', error: err.message });
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

  console.log(user.memberships)
  const school = await School.findById(schoolId)
    .populate('principal', 'firstName lastName email')
    .populate('members', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email');

  if (!membership) {
    return res.status(403).json({ message: 'User not part of this school' });
  }

  const token = generateToken(user._id, school._id);
  res.status(200).json({ message: 'Switched school', token: token, newSchool: school });
};


export const requestJoinSchool = async (req, res) => {
  const userId = req.user._id; // assuming user is authenticated
  const { schoolId } = req.params;

  try {
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "École introuvable." });
    }

    // Check if already a member
    const isMember = school.members?.some(
      (member) => member._id.toString() === userId.toString()
    );
    if (isMember) {
      return res.status(400).json({ message: "Vous êtes déjà membre de cette école." });
    }

    // Check if access is open
    if (!school.memberShipAccessStatus) {
      return res.status(403).json({ message: "L'accès à cette école est restreint." });
    }

    // Avoid duplicate request
    const alreadyRequested = school.joinRequests?.some(
      (reqId) => reqId.toString() === userId.toString()
    );
    if (alreadyRequested) {
      return res.status(400).json({ message: "Demande déjà envoyée." });
    }

    // Add to joinRequests
    school.joinRequests = school.joinRequests || [];
    school.joinRequests.push(userId);
    await school.save();

    return res.status(200).json({ message: "Demande envoyée avec succès." });
  } catch (err) {
    console.error("Erreur join request:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getJoinRequests = async (req, res) => {
  const userId = req.user._id;
  const { schoolId } = req.params;

  try {
    const school = await School.findById(schoolId)
      .populate("joinRequests", "name email _id")
      .populate("members", "_id");

    if (!school) {
      return res.status(404).json({ message: "École introuvable." });
    }

    // Check if the current user is a member with an admin role
    const isAdmin = school.members.some((member) =>
      member._id.toString() === userId.toString()
    );

    if (!isAdmin) {
      return res.status(403).json({ message: "Accès refusé. Admin requis." });
    }

    return res.status(200).json({ joinRequests: school.joinRequests });
  } catch (err) {
    console.error("Erreur lors de la récupération des demandes :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

export const approveJoinRequest = async (req, res) => {
  const { schoolId, userId } = req.params;
  const adminId = req.user._id;

  try {
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ message: "École introuvable." });
    }

    const isAdmin = school.members.some(
      (member) => member.toString() === adminId.toString()
    );

    if (!isAdmin) {
      return res.status(403).json({ message: "Accès refusé. Admin requis." });
    }
    if (
      school.createdBy.toString() !== userId.toString() &&
      !req.roles.includes("ADMIN") &&
      !req.roles.includes("DIRECTOR")
    ) {
      console.log("Unauthorized to edit this school.")
      return res.status(403).json({ message: "Unauthorized to edit this school." });
    }

    if (!school.joinRequests.includes(userId)) {
      return res.status(400).json({ message: "Aucune demande de ce membre." });
    }

    // Move from joinRequests to members
    school.joinRequests = school.joinRequests.filter(
      (id) => id.toString() !== userId.toString()
    );
    school.members.push(userId);

    await school.save();

    return res.status(200).json({ message: "Membre approuvé avec succès." });
  } catch (err) {
    console.error("Erreur d'approbation :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

export const rejectJoinRequest = async (req, res) => {
  const { schoolId, userId } = req.params;
  const adminId = req.user._id;

  try {
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ message: "École introuvable." });
    }

    const isAdmin = school.members.some(
      (member) => member.toString() === adminId.toString()
    );

    if (!isAdmin) {
      return res.status(403).json({ message: "Accès refusé. Admin requis." });
    }

    if (!school.joinRequests.includes(userId)) {
      return res.status(400).json({ message: "Aucune demande de ce membre." });
    }

    school.joinRequests = school.joinRequests.filter(
      (id) => id.toString() !== userId.toString()
    );

    await school.save();

    return res.status(200).json({ message: "Demande rejetée avec succès." });
  } catch (err) {
    console.error("Erreur de rejet :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};


// GET /api/schools/:schoolId
export const getSchoolById = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const school = await School.findById(schoolId)
      .populate('principal', "name email")
      .populate("members", "name email") // Optional: populate basic member info
      .populate("createdBy", "name email"); // Optional

    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    res.json(school);
  } catch (error) {
    console.error("Error fetching school:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update school info
export const updateSchool = async (req, res) => {
  const { schoolId } = req.params;
  const userId = req.user._id;
  const updates = req.body;
  console.log("updates", updates)
  try {
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found."
      });
    }

    // Check user permissions
    const user = await User.findById(userId);
    const userMembership = user.memberships.find(
      membership => membership.school.toString() === schoolId
    );

    const isCreator = school?.createdBy?.toString() === userId?.toString();
    const isPrincipal = school?.principal?.toString() === userId?.toString();
    const hasAdminRole = userMembership?.roles?.includes("ADMIN");
    const hasDirectorRole = userMembership?.roles?.includes("DIRECTOR");

    if (!isCreator && !isPrincipal && !hasAdminRole && !hasDirectorRole) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to edit this school."
      });
    }

    // Handle logo upload if file is provided
    if (req.file) {
      if (!isCreator && !hasAdminRole && !isPrincipal) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update school logo"
        });
      }
      updates.logoUrl = `/uploads/school-logos/${req.file.filename}`;
    }

    // Define allowed fields based on user role
    let allowedFields = ["name", "phone", "address", "motto", "type"];

    if (isCreator || hasAdminRole || isPrincipal) {
      allowedFields = [
        ...allowedFields,
        "email",
        "system_type",
        "logoUrl",
        "memberShipAccessStatus"
      ];
    }

    if (isCreator || req.roles?.includes("SUPER_ADMIN")) {
      allowedFields = [
        ...allowedFields,
        "plan",
        "billing.status",
        "billingRules.baseMonthlyFee",
        "billingRules.perStudentFee",
        "billingRules.perStaffFee",
        "billingRules.perClassFee"
      ];
    }

    // Apply updates with validation
    Object.keys(updates).forEach((field) => {
      if (allowedFields.includes(field)) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (school[parent] && school[parent][child] !== undefined) {
            school[parent][child] = updates[field];
          }
        } else {
          if (field === 'email') {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(updates[field])) {
              throw new Error('Invalid email format');
            }
            school[field] = updates[field].toLowerCase();
          } else if (field === 'plan' && !['FREE', 'BASIC', 'PRO'].includes(updates[field])) {
            throw new Error('Invalid plan type');
          } else {
            school[field] = updates[field];
          }
        }
      }
    });

    // Handle principal assignment
    if (updates.principal && (isCreator || hasAdminRole)) {
      const newPrincipal = await User.findById(updates.principal);
      const isMember = newPrincipal.memberships.some(
        membership => membership.school.toString() === schoolId
      );

      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: "New principal must be a member of the school"
        });
      }

      school.principal = updates.principal;
    }

    // Handle access status changes
    if (updates.accessStatus && (isCreator || hasAdminRole)) {
      if (['active', 'suspended', 'blocked'].includes(updates.accessStatus)) {
        school.accessStatus = updates.accessStatus;
        if (updates.accessStatus === 'active') {
          school.blockReason = '';
        } else if (updates.blockReason) {
          school.blockReason = updates.blockReason;
        }
      }
    }

    await school.save();

    // Populate and return updated school
    const updatedSchool = await School.findById(schoolId)
      .populate('principal', 'name email')
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.json({
      success: true,
      message: "School updated successfully",
      school: updatedSchool
    });

  } catch (error) {
    console.error("Update school error:", error);

    // Handle specific errors
    if (error.message.includes('Invalid') || error.message.includes('invalid')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/schools/:schoolId/members
export const getSchoolMembers = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const school = await School.findById(schoolId)
      .populate("members", "name email firstName lastName roles memberships")
      .populate("members.memberships", "name email roles");

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    console.log("school.members", school.members)
    res.status(200).json(school.members);
  } catch (error) {
    console.error("Error fetching school members:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/schools/:schoolId/members/:memberId/roles
export const updateMemberRoles = async (req, res) => {
  const { schoolId, memberId } = req.params;
  const { roles } = req.body; // roles: string[] (e.g., ["admin", "teacher"])

  const currentUserId = req.user._id;

  try {
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Check if the current user is an admin in the school
    const currentUserMembership = school.members.find((id) => id.toString() === currentUserId.toString());
    if (!currentUserMembership) {
      return res.status(403).json({ message: "You are not a member of this school." });
    }

    const user = await User.findById(currentUserId);
    const member = await User.findById(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const currentUserRoleEntry = user.memberships.find(
      (m) => m.school.toString() === schoolId.toString()
    );
    console.log(currentUserRoleEntry)
    const memberRoleEntry = member.memberships.find(
      (m) => m.school.toString() === schoolId.toString()
    );

    if (!currentUserRoleEntry?.roles?.includes("ADMIN")) {
      return res.status(403).json({ message: "Only admins can update roles." });
    }

    if (memberId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot update your own roles." });
    }

    // Update roles
    if (memberRoleEntry) {
      memberRoleEntry.roles = roles;
    } else {
      member.memberships.push({ school: school._id, roles });
    }

    await member.save();

    res.status(200).json({ message: "Roles updated successfully" });
  } catch (error) {
    console.error("Error updating roles:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/schools/:schoolId/invitations
export const inviteMember = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { email, firstName, lastName, roles, message } = req.body;

    // 1. Check if school exists and user has permission
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: 'School not found' });

    // 2. Check if user already exists
    let user = await User.findOne({ email });
    const password = generateRandom8Char();
    let sendpassword = false;

    // Calculate expiration date (7 days from now)
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7);

    if (user) {
      // 3. Check if user already has any membership for this school
      const existingMembership = user.memberships.find(
        m => m.school.toString() === schoolId
      );

      if (existingMembership) {
        // Check the status of existing membership
        if (existingMembership.status === 'active') {
          return res.status(400).json({ message: 'User is already an active member of this school' });
        }

        if (existingMembership.status === 'pending') {
          // Check if the pending invitation is expired
          const isExpired = new Date() > new Date(existingMembership.expiredAt);

          if (!isExpired) {
            return res.status(400).json({
              message: 'User already has a pending invitation for this school',
              expiredAt: existingMembership.expiredAt
            });
          } else {
            // If expired, update the status to inactive and create a new invitation
            existingMembership.status = 'inactive';
          }
        }

        if (existingMembership.status === 'inactive') {
          // Reactivate the membership with new invitation
          existingMembership.status = 'pending';
          existingMembership.invitedBy = req.user._id
          existingMembership.roles = roles || ['TEACHER'];
          existingMembership.invitedAt = new Date();
          existingMembership.expiredAt = expiredAt;
        }
      } else {
        // User exists but has no membership for this school - add new membership
        user.memberships.push({
          school: school._id,
          roles: roles || ['TEACHER'],
          status: 'pending',
          invitedBy: req.user._id,
          invitedAt: new Date(),
          expiredAt: expiredAt
        });
      }
    } else {
      // User doesn't exist - create new user and membership
      user = await User.create({
        email,
        firstName,
        lastName,
        status: 'active',
        password,
        memberships: [{
          school: school._id,
          roles: roles || ['TEACHER'],
          status: 'pending',
          invitedBy: req.user._id,
          invitedAt: new Date(),
          expiredAt: expiredAt
        }]
      });
      sendpassword = true;
      console.log(password); // Only for development
    }

    await user.save();

    // 4. Send email invitation
    // await sendInvitationEmail(user.email, {
    //   schoolName: school.name,
    //   inviterName: req.user.name,
    //   password: sendpassword ? password : null,
    //   message,
    //   invitationLink: `${process.env.FRONTEND_URL}/accept-invitation/${user.memberships[user.memberships.length - 1]._id}`
    // });

    res.status(201).json({
      message: 'Invitation sent successfully',
      expiredAt: expiredAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send invitation', error: error.message });
  }
};

// GET /api/schools/:schoolId/invitations
export const getInvitationsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Check if school exists and user has permission
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: 'School not found' });

    // Get all users with pending memberships for this school
    const pendingInvitations = await User.find({
      'memberships.school': schoolId,
      'memberships.status': 'pending'
    }).select('firstName lastName email memberships');
    // console.log(pendingInvitations)
    // Transform data to match invitation format
    const invitations = pendingInvitations.map(user => {
      const membership = user.memberships.find(m => m.school.toString() === schoolId && m.status === 'pending');
      return {
        _id: membership._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: membership.roles,
        status: membership.status,
        invitedAt: membership.invitedAt,
        expiredAt: membership.expiredAt,
        user: user._id
      };
    });
    console.log(invitations)
    console.log("invitations")
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invitations', error: error.message });
  }
};

// GET /api/invitations/my
export const getMyInvitations = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming authenticated user

    const user = await User.findById(userId)
      .populate('memberships.school', 'name')
      .populate('memberships.invitedBy', 'firstName email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Filter pending memberships (invitations)
    const pendingInvitations = user.memberships.filter(m => m.status === 'pending');

    const invitations = pendingInvitations.map(membership => ({
      _id: membership._id,
      school: membership.school,
      roles: membership.roles,
      status: membership.status,
      invitedBy: membership.invitedBy,
      invitedAt: membership.createdAt,
      expiredAt: membership.expiredAt,
    }));

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invitations', error: error.message });
  }
};

// PUT /api/invitations/:membershipId/accept
export const acceptInvitation = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const userId = req.user._id;
    // Find user and the specific membership
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ message: "École introuvable." });
    }

    const existingMembership = user.memberships.find(
      m => m.school.toString() === schoolId
    );

    if (existingMembership.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    // Update membership status to active
    existingMembership.status = 'active';
    existingMembership.joinedAt = new Date();
    await user.save();

    school.members.push(userId);
    await school.save();

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept invitation', error: error.message });
  }
};

// DELETE /api/invitations/:membershipId/cancel
export const cancelInvitation = async (req, res) => {
  try {
    const { membershipId, schoolId } = req.params;
    // const { schoolId } = req.body;
    console.log(membershipId, schoolId)
    // Check if school exists and user has permission
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: 'School not found' });

    // Find user with the pending membership
    const user = await User.findOne({
      'memberships.school': schoolId,
      'memberships.status': 'pending'
    });

    if (!user) return res.status(404).json({ message: 'Invitation not found' });

    // Remove the membership (invitation)
    user.memberships = user.memberships.filter(m =>
      !(m?.school?.toString() === school?._id?.toString() && m.status === 'pending')
    );

    await user.save();

    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel invitation', error: error.message });
  }
};
