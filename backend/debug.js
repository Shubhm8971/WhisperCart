
try {
  require('dotenv').config();
  console.log('Dotenv loaded');
  const config = require('./config');
  console.log('Config loaded', config);
  const transcribeRoutes = require('./routes/transcribe');
  console.log('transcribeRoutes loaded');
  const searchRoutes = require('./routes/search');
  console.log('searchRoutes loaded');
  const historyRoutes = require('./routes/history');
  console.log('historyRoutes loaded');
  const negotiateRoutes = require('./routes/negotiate');
  console.log('negotiateRoutes loaded');
  const productRoutes = require('./routes/products');
  console.log('productRoutes loaded');
  const trackRoutes = require('./routes/track');
  console.log('trackRoutes loaded');
} catch (error) {
  console.error('CRASH DETECTED:', error);
}
