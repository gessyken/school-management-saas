import express from "express";
import {
  registerSchool,
  getAllSchools,
  getUserSchools,
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
} from "../controllers/schoolController.js";
import { getUserRolesForSchool, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// ➡️ Création d'une école
router.post("/", protect, registerSchool);

// ➡️ Écoles de l'utilisateur courant
router.get("/mine", protect, getUserSchools);

// ➡️ Switch d’école active
router.post("/switch", protect, switchSchool);

// ➡️ Requêtes d’adhésion
router.post("/:schoolId/request-join", protect, requestJoinSchool);
router.get("/:schoolId/join-requests", protect, getJoinRequests);
router.post(
  "/:schoolId/join-requests/:userId/approve",
  protect,
  getUserRolesForSchool,
  approveJoinRequest
);
router.delete(
  "/:schoolId/join-requests/:userId/reject",
  protect,
  rejectJoinRequest
);

// ➡️ Gestion des écoles (admin)
router.get("/", protect, getAllSchools);
router.get("/:schoolId", protect, getSchoolById);
router.put("/:schoolId", protect, getUserRolesForSchool, updateSchool);
router.put("/:id/access", protect, updateSchoolAccess);

// ➡️ Gestion des membres
router.get("/:schoolId/members", protect, getSchoolMembers);
router.patch(
  "/:schoolId/members/:memberId/roles",
  protect,
  getUserRolesForSchool,
  updateMemberRoles
);

export default router;
