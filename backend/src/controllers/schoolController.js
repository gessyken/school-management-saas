import School from '../models/School.js';
import User from '../models/User.js';
import { generateToken } from '../utils/jwtUtils.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/schools/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// File filter for uploads
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
  }
};

// Configure multer upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 4 // Logo + 3 PDFs
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'documents', maxCount: 3 }
]);

export const registerSchool = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(403).json({ message: 'Invalid user' });
    }

    const { name, email, phone, address, subdomain, plan = 'FREE' } = req.body;
    console.log(req.body)
    console.log(req.file)
    // Validate required fields 
    if (!name || !email) {
      return res.status(400).json({ message: 'School name and email are required' });
    }

    // Check if school with this email already exists
    // const existingSchool = await School.findOne({ email });
    // if (existingSchool) {
    //   return res.status(400).json({ message: 'School with this email already exists' });
    // }

    // Check if subdomain is unique if provided
    // if (subdomain) {
    //   const existingSubdomain = await School.findOne({ subdomain });
    //   if (existingSubdomain) {
    //     return res.status(400).json({ message: 'This subdomain is already taken' });
    //   }
    // }

    // Process file uploads
    const logoUrl = req.files['logo'] ? `/uploads/schools/${req.files['logo'][0].filename}` : null;
    const documents = req.files['documents'] ?
      req.files['documents'].map(file => `/uploads/schools/${file.filename}`) : [];

    // Validate at least one PDF document was uploaded
    if (documents.length === 0) {
      return res.status(400).json({ message: 'At least one PDF document is required' });
    }

    // Create new school
    const school = await School.create({
      name,
      email,
      phone,
      address,
      subdomain,
      plan,
      logoUrl,
      documents,
      members: [user._id],
      createdBy: user._id,
      verificationStatus: 'pending',
      accessStatus: 'pending_verification'
    });

    // Add school membership to user
    user.memberships.push({
      school: school._id,
      roles: ['ADMIN', 'DIRECTOR'],
      status: 'active'
    });
    await user.save();

    // Generate token with school context
    // const token = generateToken(user._id, school._id);

    res.status(201).json({
      // token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        memberships: user.memberships
      },
      school: {
        _id: school._id,
        name: school.name,
        email: school.email,
        subdomain: school.subdomain,
        logoUrl: school.logoUrl,
        verificationStatus: school.verificationStatus
      }
    });

  } catch (err) {
    console.error('School registration error:', err);

    // Handle file upload errors specifically
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB per file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 4 files allowed (1 logo + 3 documents).'
      });
    }
    if (err.message.includes('Invalid file type')) {
      return res.status(400).json({
        message: 'Invalid file type. Only images (for logo) and PDFs (for documents) are allowed.'
      });
    }

    res.status(500).json({
      message: 'Failed to create school',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
  const school = await School.findById(schoolId)
    .populate("members", "name email") // Optional: populate basic member info
    .populate("createdBy", "name email"); // Optional
  // if (school.verificationStatus !== 'approved' || school.accessStatus !== 'active') {
  //   return res.status(401).json({ message: 'school not approved' });
  // }
  const token = generateToken(user._id, schoolId);
  res.status(200).json({ message: 'Switched school', token, school });
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
  console.log(userId)
  try {
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    // Check authorization
    const isCreator = school.createdBy.toString() === userId.toString();
    const isAdmin = req.roles.includes("ADMIN");
    const isDirector = req.roles.includes("DIRECTOR");

    if (!isCreator && !isAdmin && !isDirector) {
      return res.status(403).json({ message: "Unauthorized to edit this school." });
    }
    console.log(req.body)
    // Handle regular form data
    const {
      name,
      email,
      phone,
      address,
      description,
      website,
      subdomain,
      plan,
      accessStatus,
      memberShipAccessStatus,
      documents
    } = req.body;

    // Handle document removals if needed
    if (documents && Array.isArray(documents)) {
      school.documents = documents;
    }

    // Handle file uploads first if any
    if (req.files) {
      if (req.files.logo) {
        // Process logo upload - replace with your actual file handling logic
        const logoUrl = req.files['logo'] ? `/uploads/schools/${req.files['logo'][0].filename}` : school.logoUrl;
        school.logoUrl = logoUrl;

      }

      if (req.files.documents) {
        // Process document uploads
        const documentUrls = req.files['documents'] ?
          req.files['documents'].map(file => `/uploads/schools/${file.filename}`) : [];
        console.log("documentUrls", documentUrls)
        school.documents = [...(school.documents || []), ...documentUrls];
      }
    }


    // Basic information
    if (name) school.name = name;
    if (email) school.email = email;
    if (phone) school.phone = phone;
    if (address) school.address = address;
    if (description) school.description = description;
    if (website) school.website = website;
    if (subdomain) school.subdomain = subdomain;

    // Plan and access
    if (plan) school.plan = plan;
    if (accessStatus) school.accessStatus = accessStatus;
    if (memberShipAccessStatus !== undefined) {
      school.memberShipAccessStatus = memberShipAccessStatus === 'true';
    }

    await school.save();

    res.json({
      message: "School updated successfully",
      school: {
        ...school.toObject(),
        billing: {
          ...school.billing,
          trialEndsAt: school.billing?.trialEndsAt?.toISOString()
        }
      }
    });

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
      .populate("members", "firstName lastName email roles memberships")
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

// 1. Get billing rules & usage
export const getBillingInfo = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const school = await School.findById(schoolId).select("billingRules usage");
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }

    return res.status(200).json({
      billingRules: school.billingRules,
      usage: school.usage,
    });
  } catch (err) {
    console.error("Error fetching billing info:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 2. Update billing rules
export const updateBillingRules = async (req, res) => {
  const { schoolId } = req.params;
  const updates = req.body; // { baseMonthlyFee, perStudentFee, ... }

  try {
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }

    // Update fields
    for (const key in updates) {
      if (school.billingRules.hasOwnProperty(key)) {
        school.billingRules[key] = updates[key];
      }
    }

    await school.save();

    return res.status(200).json({ message: "Billing rules updated", billingRules: school.billingRules });
  } catch (err) {
    console.error("Error updating billing rules:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 3. Update usage counts (students, staff, classes, etc.)
export const updateUsage = async (req, res) => {
  const { schoolId } = req.params;
  const updates = req.body; // { studentsCount, staffCount, ... }

  try {
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }

    for (const key in updates) {
      if (school.usage.hasOwnProperty(key)) {
        school.usage[key] = updates[key];
      }
    }

    school.usage.lastUsageCalculated = new Date();
    await school.save();

    return res.status(200).json({ message: "Usage updated", usage: school.usage });
  } catch (err) {
    console.error("Error updating usage:", err);
    return res.status(500).json({ error: "Server error" });
  }
};