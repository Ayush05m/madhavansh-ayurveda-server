const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../../middleware/auth");
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getAllConsultations,
  getConsultationStats,
  deleteConsultationByID,
} = require("../../controllers/AdminController/adminController");
const {
  updateConsultation,
  updateConsultationStatus,
} = require("../../controllers/consultationController");

const { chechMyAuth } = require("../../controllers/authController");
const adminAuthRoutes = require("./adminAuthRoutes");
const doctorRoutes = require("./docRoutes");

// Admin auth routes
router.use("/auth", adminAuthRoutes);
router.use("/", chechMyAuth);

// Dashboard stats
router.get("/dashboard-stats", getDashboardStats);
// Users management
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);

// Consultations management
router.get("/consultations", getAllConsultations);
router.get("/consultation-stats", getConsultationStats);
router.put("/consultations/:id", updateConsultation);
router.patch("/consultations/:id/status", updateConsultationStatus);
router.delete("/consultations/:contact/:id", deleteConsultationByID);

// Doctors management
router.use("/doctors", doctorRoutes);
module.exports = router;
