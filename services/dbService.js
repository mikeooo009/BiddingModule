const db = require('../config/db');

/**
 * Get all bids for a specific auction
 */
const getBidsForAuction = async (auctionId) => {
  const [rows] = await db.query('SELECT * FROM Bids WHERE AuctionID = ?', [auctionId]);
  return rows;
};

/**
 * Save a new bid to the database
 */
const saveBidToDatabase = async (auctionId, userId, bidAmount) => {
  const [result] = await db.query(
    'INSERT INTO Bids (AuctionID, UserID, BidAmount) VALUES (?, ?, ?)',
    [auctionId, userId, bidAmount]
  );
  return result.insertId;
};

/**
 * Get the current highest bid for an auction
 */
const getHighestBidForAuction = async (auctionId) => {
  const [rows] = await db.query(
    'SELECT MAX(BidAmount) as HighestBid FROM Bids WHERE AuctionID = ?',
    [auctionId]
  );
  return rows[0].HighestBid || 0;
};

/**
 * Add a new user to the database
 */
const addUser = async (username) => {
  const [result] = await db.query('INSERT INTO Users (Username) VALUES (?)', [username]);
  return result.insertId;
};

module.exports = {
  getBidsForAuction,
  saveBidToDatabase,
  getHighestBidForAuction,
  addUser,
};
