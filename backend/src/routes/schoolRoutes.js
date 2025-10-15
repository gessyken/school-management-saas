import express from 'express';
import {
  registerSchool,
  getAllSchools,
  updateSchoolAccess,
  switchSchool,
  requestJoinSchool,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  updateSchoolLogo, 
  getSchoolProfile,
  uploadLogo,
  updateSchool,
  getSchoolMembers,
  updateMemberRoles,
  getUserSchools,
  inviteMember,
  getInvitationsBySchool,
  getMyInvitations,
  acceptInvitation,
  cancelInvitation,
//   getBillingInfo,
//   updateBillingRules,
//   updateUsage,
} from '../controllers/schoolController.js';
import { getUserRolesForSchool, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new school (logged-in user becomes admin)
router.post('/register', protect,uploadLogo.single('logo'), registerSchool);
router.patch('/:schoolId/logo', protect, uploadLogo.single('logo'), updateSchoolLogo);

// Get list of all schools (admin panel)
router.get('/', protect, getAllSchools);
router.get("/my-schools", protect, getUserSchools);
router.get("/detail-school/:schoolId", protect, getSchoolProfile);

// Block or unblock a school by ID
router.put('/:id/access', protect, updateSchoolAccess);

// Switch current active school for logged-in user
router.post('/switch', protect, switchSchool);
router.post("/:schoolId/request-join", protect, requestJoinSchool);
// router.post("/:schoolId/invitations", protect, inviteMember);
router.get("/:schoolId/join-requests", protect, getJoinRequests);
router.post("/:schoolId/join-requests/:userId/approve", protect,getUserRolesForSchool, approveJoinRequest);
router.delete("/:schoolId/join-requests/:userId/reject", protect, rejectJoinRequest);
// router.get("/:schoolId", protect, getSchoolById);
router.put("/:schoolId", protect,getUserRolesForSchool,uploadLogo.single('logo'), updateSchool);
router.get("/:schoolId/members", protect, getSchoolMembers);
router.patch("/:schoolId/members/:memberId/roles", protect,getUserRolesForSchool, updateMemberRoles);


// School-specific invitations
router.post('/:schoolId/invitations', protect, inviteMember);
router.get('/:schoolId/invitations', protect, getInvitationsBySchool);
router.put('/:schoolId/invitations/accept', protect, acceptInvitation);
router.delete('/:schoolId/invitations/:membershipId/cancel', protect, cancelInvitation);

// User invitation management
router.get('/invitations/my', protect, getMyInvitations);

// router.get("/billing/:schoolId", getBillingInfo);
// router.put("/billing/:schoolId/billing-rules", updateBillingRules);
// router.put("/billing/:schoolId/usage", updateUsage);

export default router;