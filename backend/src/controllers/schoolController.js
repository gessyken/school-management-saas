import School from '../models/School.js';
import User from '../models/User.js';
import { generateRandom8Char } from '../utils/helper.js';
import { generateToken } from '../utils/jwtUtils.js';

// Register a new school
export const registerSchool = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(403).json({ message: 'Invalid user' });

    const { name, email, phone, address, system_type } = req.body;

    // const existingSchool = await School.findOne({ email });
    // if (existingSchool) return res.status(400).json({ message: 'School already exists' });

    const school = await School.create({
      name,
      email,
      phone,
      address,
      system_type,
      members: [user._id],
      createdBy: user._id
    });

    // Add school membership to user
    user.memberships.push({
      school: school._id,
      roles: ['ADMIN', 'DIRECTOR'],
      status: 'active'
    });
    console.log(user.memberships)
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

  if (!membership) {
    return res.status(403).json({ message: 'User not part of this school' });
  }

  const token = generateToken(user._id, schoolId);
  res.status(200).json({ message: 'Switched school', token });
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

  try {
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    // Only creator or admin can update
    if (
      school.createdBy.toString() !== userId.toString() &&
      !req.roles.includes("ADMIN") &&
      !req.roles.includes("DIRECTOR")
    ) {
      console.log("Unauthorized to edit this school.")
      return res.status(403).json({ message: "Unauthorized to edit this school." });
    }


    // Apply allowed updates
    const allowedFields = ["name", "email", "phone", "address", "subdomain", "logoUrl"];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        school[field] = updates[field];
      }
    });

    await school.save();
    res.json({ message: "School updated successfully", school });
  } catch (error) {
    console.error("Update school error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// GET /api/schools/:schoolId/members
export const getSchoolMembers = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const school = await School.findById(schoolId)
      .populate("members", "name email roles memberships")
      .populate("members.memberships", "name email roles");

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

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

    const user = await User.findById(userId).populate('memberships.school', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Filter pending memberships (invitations)
    const pendingInvitations = user.memberships.filter(m => m.status === 'pending');

    const invitations = pendingInvitations.map(membership => ({
      _id: membership._id,
      school: membership.school,
      roles: membership.roles,
      status: membership.status,
      invitedAt: membership.createdAt
    }));

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invitations', error: error.message });
  }
};

// PUT /api/invitations/:membershipId/accept
export const acceptInvitation = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const userId = req.user._id;

    // Find user and the specific membership
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const membership = user.memberships.id(membershipId);
    if (!membership) return res.status(404).json({ message: 'Invitation not found' });

    if (membership.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    // Update membership status to active
    membership.status = 'active';
    await user.save();

    res.json({ message: 'Invitation accepted successfully', membership });
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
