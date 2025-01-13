const User = require("../models/User");
const Doctor = require("../models/doctors");
const Consultation = require("../models/Consultation");
const catchAsync = require("../utils/catchAsync");
const TempUser = require("../models/TempUser");
const doctors = require("../models/doctors");

// Dashboard Stats
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
    Consultation.aggregate([
      {
        $match: {
          status: { $in: ["pending", "confirmed"] }, // Filter by relevant statuses
        },
      },
      {
        $group: {
          _id: "$contact", // Group by the unique contact field
        },
      },
      {
        $count: "uniqueConsultations", // Count the unique contacts
      },
    ]),
    TempUser.countDocuments(),
  ]);

  const [
    totalPatients,
    totalDoctors,
    totalConsultations,
    revenue,
    uniqueConsultations,
    totalOneTimePatients,
  ] = stats;
  console.log("Dashboard stats:           ", {
    totalPatients,
    totalDoctors,
    totalConsultations,
    totalRevenue: revenue[0]?.totalRevenue || 0,
    uniqueConsultations: uniqueConsultations[0].uniqueConsultations,
  });

  res.json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      totalConsultations,
      totalOneTimePatients,
      uniqueConsultations: uniqueConsultations[0].uniqueConsultations,
      totalRevenue: revenue[0]?.totalRevenue || 0,
    },
  });
});

exports.getConsultationStats = catchAsync(async (req, res) => {
  // console.log(req.cookies);

  const stats = await Consultation.aggregate([
    {
      $match: {
        status: { $in: ["pending", "confirmed"] },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $group: {
        _id: null,
        data: {
          $push: {
            k: "$_id",
            v: { count: "$count", revenue: "$totalAmount" },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        result: { $arrayToObject: "$data" },
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

// Users
exports.getAllUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search;
  const minAge = parseInt(req.query.minAge);
  const maxAge = parseInt(req.query.maxAge);
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const skip = (page - 1) * limit;

  let query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { contact: { $regex: search, $options: 'i' } }
    ];
  }

  if (!isNaN(minAge) || !isNaN(maxAge)) {
    query.age = {};
    if (!isNaN(minAge)) query.age.$gte = minAge;
    if (!isNaN(maxAge)) query.age.$lte = maxAge;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const [users, tempUsers, totalUsers, totalTempUsers] = await Promise.all([
    User.find(query).select("-password").sort("-createdAt").skip(skip).limit(limit),
    TempUser.find(query).select("-password").sort("-createdAt").skip(skip).limit(limit),
    User.countDocuments(query),
    TempUser.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: totalUsers + totalTempUsers,
    currentPage: page,
    totalPages: Math.ceil((totalUsers + totalTempUsers) / limit),
    data: [...users, ...tempUsers],
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

// Consultations
exports.getAllConsultations = catchAsync(async (req, res) => {
  const { status, startDate, endDate, types } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

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

  if (types) {
    const typesArray = types.split(",");
    query.consultationType = { $in: typesArray };
  }

  const [consultations, total] = await Promise.all([
    Consultation.find(query).sort("-createdAt").skip(skip).limit(limit),
    Consultation.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: consultations,
  });
});

exports.deleteConsultationByID = catchAsync(async (req, res) => {
  const { id, contact } = req.params;
  const consultation = await Consultation.deleteOne({
    _id: id,
    contact: contact,
  });
  let user = await User.findOne({ contact });

  if (!user) {
    user = await TempUser.findOne({ contact });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.consultations = user.consultations.filter(
      (consultationId) => consultationId.toString() !== id
    );
    await user.save();
  }

  user.consultations = user.consultations.filter(
    (consultationId) => consultationId.toString() !== id
  );
  user.NoOfConsultations -= 1;
  await user.save();

  res.json({
    success: true,
    message: "Consultation deleted and user updated successfully",
  });
});

// Doctors
exports.deleteDoctorById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const doctor = Doctor.deleteOne({ _id: id });

  res.json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});
