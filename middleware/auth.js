const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const Admin = require("../models/Admin");
const TempUser = require("../models/TempUser");

const protect = async (req, res, next) => {
  try {
    // Check for token in both cookies and Authorization header
    let token = req.cookies.adminToken || req.cookies.authToken;
    // console.log('Token: ', token);

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // console.log('Token: ', token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to access this resource",
      });
    }
    // console.log('Token: ', token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded: ", decoded);
      const user = await User.findById(decoded.id).select("-password");
      const tempUser = await TempUser.findById(decoded.id).select("-password");
      const admin = await Admin.findById(decoded.id).select("-password");

      if (!user && !admin && !tempUser) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
      }

      // console.log('Token: ', token);
      req.user = user || tempUser;
      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token, please log in again",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (req.cookies["admin-token"]) {
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to access this is restricted route",
      });
    }
  };
};

module.exports = { protect, restrictTo };
