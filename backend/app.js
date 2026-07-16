const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cardRoutes = require('./routes/cardRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// CORS middleware
app.use(cors({
  origin: '*', // For development, allow any origin. In production, configure specific origin.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the DevVault API' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
