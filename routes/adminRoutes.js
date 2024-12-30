const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const {
  getDashboardStats,
  getAllUsers,
  getAllDoctors,
  updateUserRole,
  getAllConsultations,
  getConsultationStats,
} = require("../controllers/adminController");

const {
  updateConsultation,
  updateConsultationStatus,
} = require("../controllers/consultationController");

const { updateDoctorStatus } = require("../controllers/doctorController");

const adminAuthRoutes = require("./adminAuthRoutes");

// Admin auth routes
router.use("/auth", adminAuthRoutes);

// Protect all admin routes below this middleware
// router.use(restrictTo("admin"));

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

// Doctors management
router.patch("/doctors/:id/status", updateDoctorStatus);

module.exports = router;
