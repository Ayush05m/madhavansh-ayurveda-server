const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.EMAIL_PASSWORD // Add this to your .env file
    }
});

exports.sendOtpEmail = async (toEmail, otp) => {
    try {
        console.log(process.env.EMAIL_PASSWORD);

        const mailOptions = {
            from: process.env.MAIL_EMAIL,
            to: toEmail,
            subject: 'Your OTP for Verification',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2>OTP Verification</h2>
                    <p>Your OTP for verification is:</p>
                    <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                    <p>This OTP will expire in 1 hour.</p>
                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send OTP email');
    }
};
