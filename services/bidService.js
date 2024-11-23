const redisClient = require('../config/redis');

const updateHighestBid = async (auctionId, bidAmount) => {
  await redisClient.set(`auction:${auctionId}:highestBid`, bidAmount);
};

const getHighestBid = async (auctionId) => {
  return await redisClient.get(`auction:${auctionId}:highestBid`);
};

module.exports = { updateHighestBid, getHighestBid };
