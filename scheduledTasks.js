const cron = require("node-cron");
const Consultation = require("./models/Consultation"); // Adjust the path as necessary
const nodemailer = require("nodemailer");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send feedback form links
const sendFeedbackLinks = async () => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    try {
        // Query for confirmed consultations not updated in the last 2 months
        const consultations = await Consultation.find({
            status: "confirmed", // Assuming 'status' indicates confirmation
            updatedAt: { $lt: twoMonthsAgo },
        });

        // Send feedback form link to each user
        consultations.forEach(async (consultation) => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: consultation.userEmail, // Assuming userEmail is stored in the consultation
                subject: "Feedback Request",
                text: `Dear User,\n\nWe would appreciate your feedback on your consultation. Please fill out the feedback form using the following link: [Feedback Form Link]\n\nThank you!`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log("Feedback links sent successfully.");
    } catch (error) {
        console.error("Error sending feedback links:", error);
    }
};

// Schedule the task to run daily at 8 AM
cron.schedule("0 8 * * *", sendFeedbackLinks);