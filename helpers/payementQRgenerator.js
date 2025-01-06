const QRCode = require('qrcode');

exports.QrGerator = async (req, res) => {
    const { note } = req.params;
    const vpa = process.env.PAYEE_VPA;
    const name = process.env.PAYEE_NAME;
    const amount = 1;
    const upiLink = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    try {
        const qrCodeData = await QRCode.toDataURL(upiLink);
        res.status(200).json({ qrCodeData, amount });
    } catch (error) {
        console.error("Error generating QR code:", error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
}
