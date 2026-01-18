require('dotenv').config();
console.log('Environment variables loaded:', {
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY ? 'SET' : 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');
// --- ROUTE IMPORTS ---
const transcribeRoutes = require('./routes/transcribe');
const searchRoutes = require('./routes/search');
const historyRoutes = require('./routes/history');
const negotiateRoutes = require('./routes/negotiate');
const productRoutes = require('./routes/products');
const trackRoutes = require('./routes/track');
const notificationRoutes = require('./routes/notifications');
const compareRoutes = require('./routes/compare');
const privacyRoutes = require('./routes/privacy');
const authRoutes = require('./routes/auth');

const app = express();
const port = 3002;

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
    app.listen(port, async () => {
      console.log(`Server listening at http://localhost:${port}`);

      try {
        console.log('Starting public tunnel...');
        const tunnel = await localtunnel({ port: port });
        console.log(`Public Tunnel URL: ${tunnel.url}`);

        // Handle tunnel errors to prevent crash
        tunnel.on('error', (err) => {
          console.error('[Tunnel Error]', err.message);
        });

        const apiPath = path.join(__dirname, '../WhisperCart/constants/api.ts');
        const apiContent = `import { Platform } from 'react-native';

let API_URL: string;

if (Platform.OS === 'web') {
  API_URL = 'http://localhost:3002';
} else {
  API_URL = '${tunnel.url}'; 
}

export default API_URL;`;

        fs.writeFileSync(apiPath, apiContent);
        console.log(`Updated frontend API config at ${apiPath}`);

        tunnel.on('close', () => {
          console.log('Tunnel closed');
        });
      } catch (err) {
        console.error('Failed to start public tunnel:', err);
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
