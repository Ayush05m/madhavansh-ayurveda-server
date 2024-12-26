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
const http = require("http"); // Import http module
const Admin = require("./models/Admin"); // Adjust the path as necessary
const bcrypt = require("bcryptjs");

const app = express();
const server = http.createServer(app); // Create an HTTP server

// Body parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200,
  })
);

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);

// Error handling
app.use(errorHandler);

const initializeAdmin = async () => {
    try {
        const adminExists = await Admin.find();
        if (adminExists.length === 0) {
            const admin = await Admin.create({
                name: "Admin",
                email: "admin@example.com",
                password: "111111",
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

// Call the function to ensure admin is created
initializeAdmin().catch((err) =>
  console.error("Error initializing admin:", err)
);

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = { app, server }; // Export both app and server

app.use('/uploads', express.static('uploads'));
