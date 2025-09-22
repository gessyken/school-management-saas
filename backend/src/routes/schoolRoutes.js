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
  getSchoolById,
  updateSchool,
  getSchoolMembers,
  updateMemberRoles,
  getUserSchools,
//   getBillingInfo,
//   updateBillingRules,
//   updateUsage,
} from '../controllers/schoolController.js';
import { getUserRolesForSchool, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new school (logged-in user becomes admin)
router.post('/register', protect, registerSchool);

// Get list of all schools (admin panel)
router.get('/', protect, getAllSchools);
router.get("/my-schools", protect, getUserSchools);
router.get("/detail-school/:schoolId", protect, getSchoolById);

// Block or unblock a school by ID
router.put('/:id/access', protect, updateSchoolAccess);

// Switch current active school for logged-in user
router.post('/switch', protect, switchSchool);
router.post("/:schoolId/request-join", protect, requestJoinSchool);
router.get("/:schoolId/join-requests", protect, getJoinRequests);
router.post("/:schoolId/join-requests/:userId/approve", protect,getUserRolesForSchool, approveJoinRequest);
router.delete("/:schoolId/join-requests/:userId/reject", protect, rejectJoinRequest);
// router.get("/:schoolId", protect, getSchoolById);
router.put("/:schoolId", protect,getUserRolesForSchool, updateSchool);
router.get("/:schoolId/members", protect, getSchoolMembers);
router.patch("/:schoolId/members/:memberId/roles", protect,getUserRolesForSchool, updateMemberRoles);

// router.get("/billing/:schoolId", getBillingInfo);
// router.put("/billing/:schoolId/billing-rules", updateBillingRules);
// router.put("/billing/:schoolId/usage", updateUsage);

export default router;