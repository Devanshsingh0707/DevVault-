const dotenv = require('dotenv');
// Load environment variables before importing files that need them
dotenv.config();

// Assert critical environment variables are defined
if (!process.env.JWT_SECRET) {
  console.error('FATAL CONFIG ERROR: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}

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
