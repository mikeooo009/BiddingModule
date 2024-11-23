const redisClient = require('../config/redis');

// Add IP to blacklist
const addToBlacklist = async (ip) => {
  await redisClient.set(`blacklist:${ip}`, true, 'EX', 60 * 60); // Blacklist for 1 hour
};

// Check if IP is blacklisted
const isBlacklisted = async (ip) => {
  const result = await redisClient.get(`blacklist:${ip}`);
  return !!result;
};

// Middleware to filter connections
const connectionFilter = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (await isBlacklisted(ip)) {
    res.status(403).json({ error: 'Access blocked.' });
    return;
  }

  next();
};

module.exports = { addToBlacklist, connectionFilter };
