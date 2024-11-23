const rateLimit = require('express-rate-limit');

// Limit bids to 1 per second per user
const bidRateLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 1, // Limit each user to 1 bid per second
  message: 'Too many bids placed. Please wait a moment.',
});

module.exports = bidRateLimiter;
