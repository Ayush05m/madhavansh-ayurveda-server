const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log(`MongoDB Connecting to ${process.env.MONGODB_URI}`);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`DB Error : ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 