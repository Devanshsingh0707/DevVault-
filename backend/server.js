const dotenv = require('dotenv');
// Load environment variables before importing files that need them
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database', error);
  process.exit(1);
});
