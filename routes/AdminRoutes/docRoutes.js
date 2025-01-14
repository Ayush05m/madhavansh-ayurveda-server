const express = require("express");
const router = express.Router();

const {
  getAllDoctors,
  updateDoctorStatus,
  deleteDoctorById,
  createDoctor,
  updateDoctor,
  updateAvailability,
} = require("../../controllers/AdminController/adminController.js");

router.use("/", (req, res, next) => {
  // console.log("doctors reached");
  console.log(req.body, req.query);
  next();
});

router.get("/", getAllDoctors);
router.post("/", createDoctor);
router.patch("/:id/status", updateDoctorStatus);
router.put("/:id", updateDoctor);
router.patch("/:id/availability", updateAvailability);
router.delete("/:id", deleteDoctorById);

module.exports = router;
