const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email service
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
    },
});

// Feedback submission endpoint
router.post("/", async (req, res) => {
    const { consultationId, feedback, rating } = req.body;

    // Validate input
    if (!consultationId || !feedback || !rating) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Prepare email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: req.body.userEmail, // Assuming you pass the user's email in the request
        subject: "Feedback Received",
        text: `Thank you for your feedback!\n\nConsultation ID: ${consultationId}\nFeedback: ${feedback}\nRating: ${rating}`,
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Feedback sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Error sending feedback." });
    }
});

module.exports = router; 