require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const config = require('./config');
// const { AssemblyAI } = require('assemblyai'); // Removed

// --- ROUTE IMPORTS ---
const transcribeRoutes = require('./routes/transcribe');
const searchRoutes = require('./routes/search');
const historyRoutes = require('./routes/history');
const negotiateRoutes = require('./routes/negotiate');
const productRoutes = require('./routes/products');
const trackRoutes = require('./routes/track'); // New import

const app = express();
const port = 3002;

// --- MIDDLEWARE ---
app.use(express.json({ limit: '50mb' }));
app.use(cors());

let mongoClient;

async function startServer() {
  mongoClient = new MongoClient(config.mongoURI);
  await mongoClient.connect();
  const db = mongoClient.db();
  console.log('Connected to MongoDB');

  app.locals.db = db;

  // --- USE ROUTES ---
  app.use('/transcribe', transcribeRoutes);
  app.use('/search', searchRoutes);
  app.use('/history', historyRoutes);
  app.use('/negotiate', negotiateRoutes);
  app.use('/products', productRoutes);
  app.use('/track', trackRoutes); // New route usage

  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  }
  return app;
}

async function stopServer() {
  if (mongoClient) {
    await mongoClient.close();
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, stopServer };
