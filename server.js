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

// Simple demo routes (no complex AI or database)
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Simple validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  // Mock successful registration
  const token = 'demo-jwt-token-' + Date.now();

  console.log(`✅ Demo registration: ${username} (${email})`);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: Date.now(),
      username,
      email,
    },
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Mock successful login
  const token = 'demo-jwt-token-' + Date.now();

  console.log(`✅ Demo login: ${email}`);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: Date.now(),
      username: email.split('@')[0],
      email,
    },
  });
});

// Mock product search
app.get('/search', (req, res) => {
  const products = [
    {
      name: 'Nike Running Shoes',
      price: '₹2,999',
      store: 'Amazon',
      rating: 4.5,
      image: 'https://via.placeholder.com/150'
    },
    {
      name: 'Adidas Sports Shoes',
      price: '₹3,499',
      store: 'Flipkart',
      rating: 4.3,
      image: 'https://via.placeholder.com/150'
    }
  ];

  console.log(`🔍 Mock product search completed`);
  res.json(products);
});

// Mock voice transcription
app.post('/transcribe', (req, res) => {
  const mockResponse = {
    action: 'search',
    product: 'running shoes',
    budget: 3000,
    features: ['comfortable', 'durable']
  };

  console.log(`🎤 Mock voice transcription: "${req.body.text || 'demo text'}"`);
  res.json(mockResponse);
});

// Mock preferences endpoints
app.get('/api/preferences', (req, res) => {
  const mockPreferences = {
    data: {
      favoriteCategories: ['Running Shoes', 'Sports Wear'],
      favoriteBrands: ['Nike', 'Adidas'],
      preferredStores: ['Amazon', 'Flipkart'],
      budgetRanges: { min: 1000, max: 10000 },
      notificationsEnabled: true
    }
  };

  console.log(`⚙️ Mock preferences loaded`);
  res.json(mockPreferences);
});

app.put('/api/preferences', (req, res) => {
  console.log(`⚙️ Mock preferences updated:`, req.body);
  res.json({ success: true, message: 'Preferences updated' });
});

app.post('/api/preferences/favorites/categories', (req, res) => {
  console.log(`➕ Mock category added:`, req.body.category);
  res.json({ success: true, message: 'Category added' });
});

app.post('/api/preferences/favorites/brands', (req, res) => {
  console.log(`➕ Mock brand added:`, req.body.brand);
  res.json({ success: true, message: 'Brand added' });
});

// Mock history endpoints
app.get('/api/history', (req, res) => {
  const mockHistory = {
    data: {
      voiceSearches: [
        {
          detected_intent: { product: 'running shoes', budget: 3000, action: 'search' },
          timestamp: new Date().toISOString()
        }
      ],
      productSearches: [
        {
          query: 'nike shoes',
          results_count: 5,
          budget: 3000,
          timestamp: new Date().toISOString()
        }
      ]
    }
  };

  console.log(`📊 Mock history loaded`);
  res.json(mockHistory);
});

app.get('/api/history/analytics', (req, res) => {
  const mockAnalytics = {
    data: {
      total_voice_searches: 12,
      total_product_searches: 8,
      total_savings: 2500,
      total_negotiations: 3,
      voice_searches_today: 2,
      negotiations_this_week: 1,
      avg_negotiation_savings: 833
    }
  };

  console.log(`📈 Mock analytics loaded`);
  res.json(mockAnalytics);
});

// Skip complex routes for demo
async function startServer(mongoUri) {
  console.log('🎯 Starting WhisperCart DEMO MODE');
  console.log('📋 Available endpoints:');
  console.log('  - POST /api/auth/register');
  console.log('  - POST /api/auth/login');
  console.log('  - GET /search');
  console.log('  - POST /transcribe');

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
