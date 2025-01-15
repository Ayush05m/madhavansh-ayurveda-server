// madhavansh-ayurveda-server/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const http = require("http");
const Admin = require("./models/Admin");
const QRCode = require('qrcode');
const feedbackRoutes = require("./routes/feedbackRoutes");

// Initialize express app
const app = express();
const server = http.createServer(app); // Create an HTTP server

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  // "https://madhavash-ayurveda-client.vercel.app",
  process.env.CLIENT_URL
];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     }, credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
//     exposedHeaders: ["Set-Cookie"],
//     optionsSuccessStatus: 200,
//   })
// );

// Temporary Cors
app.use(
  cors({
    origin: "*", // Allow all origins temporarily
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    optionsSuccessStatus: 200,
    exposedHeaders: ["Set-Cookie"],
  })
);

app.options("*", cors()); // Responds to preflight requests globally
app.set('trust proxy', 1);


// Body parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip,
});
app.use("/api/", limiter);

// Logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Routes
const authRoutes = require("./routes/authRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const adminRoutes = require("./routes/AdminRoutes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const QrGerator = require("./routes/qrGenerateRoutes")

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use('/api/generate-qr', QrGerator);
app.use("/api/feedback", feedbackRoutes);

// Error handling
app.use(errorHandler);

app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

// Default Admin creation
const initializeAdmin = async () => {
  try {
    const adminExists = await Admin.find();
    if (adminExists.length === 0) {
      const admin = await Admin.create({
        name: "Admin",
        email: "admin@example.com",
        password: "admin123",
        phone: "1234567890"
      });
      console.log('Admin created successfully');
    } else {
      console.log("Admin already exists.");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
};

initializeAdmin().catch((err) =>
  console.error("Error initializing admin:", err)
);


module.exports = { app, server };

app.use('/uploads', express.static('uploads'));
