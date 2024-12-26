const User = require("../models/User");
const Doctor = require("../models/doctors");
const Consultation = require("../models/Consultation");
const catchAsync = require("../utils/catchAsync");
const TempUser = require("../models/TempUser");

exports.getDashboardStats = catchAsync(async (req, res) => {
  // console.log('getDashboardStats controller hit')
  // console.log(req.cookies);

  const stats = await Promise.all([
    User.countDocuments(),
    Doctor.countDocuments(),
    Consultation.countDocuments(),
    Consultation.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const [totalPatients, totalDoctors, totalConsultations, revenue] = stats;
  // console.log('Dashboard stats:           ', {
  //     totalPatients,
  //     totalDoctors,
  //     totalConsultations,
  //     totalRevenue: revenue[0]?.totalRevenue || 0
  // });

  res.json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      totalConsultations,
      totalRevenue: revenue[0]?.totalRevenue || 0,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  const tempUsers = await TempUser.find()
    .select("-password")
    .sort("-createdAt");
  res.json({
    success: true,
    count: users.length + tempUsers.length,
    data: [...users, ...tempUsers],
  });
});

exports.getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await User.find({ role: "doctor" })
    .select("-password")
    .sort("-createdAt");

  res.json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

exports.updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

exports.getAllConsultations = catchAsync(async (req, res) => {
  const { status, startDate, endDate } = req.query;
  // console.log("get All Consultations: ", req.query);

  let query = {};

  if (status) {
    query.status = status;
  }

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const consultations = await Consultation.find(query).sort("-createdAt");

  // console.log("consultations", consultations);

  res.json({
    success: true,
    count: consultations.length,
    data: consultations,
  });
});

exports.getConsultationStats = catchAsync(async (req, res) => {
  // console.log(req.cookies);

  const stats = await Consultation.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const monthlyStats = await Consultation.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  res.json({
    success: true,
    data: {
      statusStats: stats,
      monthlyStats,
    },
  });
});
