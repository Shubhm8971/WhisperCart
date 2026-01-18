const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming User model is needed for full user object

const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route (no token)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password'); // Attach user to request
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route (user not found)' });
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, error: 'Not authorized to access this route (token invalid or expired)' });
  }
};

module.exports = authenticate;
