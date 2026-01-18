require('dotenv').config();
console.log('🚀 Starting WhisperCart Backend...');
console.log('Environment check:', {
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY ? 'SET' : 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3002
});

// Set default values for missing environment variables
process.env.DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || 'demo-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whispercart';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Use Render's PORT environment variable
const port = process.env.PORT || 3002;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./backend/config');
const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');
// --- ROUTE IMPORTS ---
const transcribeRoutes = require('./backend/routes/transcribe');
const searchRoutes = require('./backend/routes/search');
const historyRoutes = require('./backend/routes/history');
const negotiateRoutes = require('./backend/routes/negotiate');
const productRoutes = require('./backend/routes/products');
const trackRoutes = require('./backend/routes/track');
const notificationRoutes = require('./backend/routes/notifications');
const compareRoutes = require('./backend/routes/compare');
const privacyRoutes = require('./backend/routes/privacy');
const authRoutes = require('./backend/routes/auth');
const preferencesRoutes = require('./backend/routes/preferences');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('WhisperCart Backend is running');
});

async function connectToMongo(mongoUri) {
  if (mongoose.connection.readyState === 0) { // Check if not connected
    try {
      await mongoose.connect(mongoUri || config.mongoURI);
      console.log('Connected to MongoDB with Mongoose');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
      throw error;
    }
  }
}

async function startServer(mongoUri) {
  await connectToMongo(mongoUri);

  // --- USE ROUTES ---
  app.use('/api/auth', authRoutes);
  app.use('/api/preferences', preferencesRoutes);
  app.use('/transcribe', transcribeRoutes);
  app.use('/search', searchRoutes);
  app.use('/history', historyRoutes);
  app.use('/negotiate', negotiateRoutes);
  app.use('/products', productRoutes);
  app.use('/track', trackRoutes);
  app.use('/notifications', notificationRoutes);
  app.use('/compare', compareRoutes);
  app.use('/privacy', privacyRoutes);

  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`🚀 WhisperCart Backend listening on port ${port}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Ready to accept connections!`);

      // Skip tunnel in production (not needed on Render)
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Development mode: Tunnel functionality available');
      }
    });
  }
  return app; // Return the configured app instance
}

async function stopServer() {
  await mongoose.disconnect();
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, stopServer };
