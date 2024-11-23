const redisClient = require('../config/redis');

/**
 * Update the highest bid for an auction in Redis.
 */
const updateHighestBidInCache = async (auctionId, bidAmount) => {
  await redisClient.set(`auction:${auctionId}:highestBid`, bidAmount);
};

/**
 * Get the highest bid for an auction from Redis.
 */
const getHighestBidFromCache = async (auctionId) => {
  const highestBid = await redisClient.get(`auction:${auctionId}:highestBid`);
  return highestBid ? parseFloat(highestBid) : 0;
};

/**
 * Invalidate the highest bid cache for an auction.
 */
const invalidateHighestBidCache = async (auctionId) => {
  await redisClient.del(`auction:${auctionId}:highestBid`);
};

module.exports = {
  updateHighestBidInCache,
  getHighestBidFromCache,
  invalidateHighestBidCache,
};
