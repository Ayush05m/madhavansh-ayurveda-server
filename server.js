   // madhavansh-ayurveda-server/server.js
   require('dotenv').config();
   const { server } = require('./app'); // Import the server instance
   const connectDB = require('./config/db');
   const Admin = require('./models/Admin'); // Import the Admin model

   // Connect to MongoDB
   connectDB();

   // Create an admin user directly
//    const createInitialAdmin = async () => {
//        await Admin.createAdmin('Ayush Mishra', 'ayush05m@gmail.com', '111111', '1234567890');
//    };

   // Start server
   const PORT = process.env.PORT || 5000;

   // Check if the server is already listening
   if (!server.listening) {
       server.listen(PORT, async () => {
           console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
           await createInitialAdmin(); // Call the function to create an admin
       });
   } else {
       console.log(`Server is already running on port ${PORT}`);
   }

   // Handle unhandled promise rejections
   process.on('unhandledRejection', (err) => {
       console.error('UNHANDLED REJECTION! 💥 Shutting down...');
       console.error(err.name, err.message);
       process.exit(1);
   });