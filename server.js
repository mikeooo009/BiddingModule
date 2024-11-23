const WebSocket = require('ws'); // WebSocket library
const http = require('http'); // HTTP server
const express = require('express'); // Express framework
const dotenv = require('dotenv'); // Environment variables

dotenv.config(); // Load environment variables

// Create an HTTP server and attach WebSocket
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Map to track auction rooms and their clients
const auctionRooms = new Map();

/**
 * Function to broadcast messages to all clients in an auction room
 */
const broadcastMessage = (auctionId, message) => {
  const clients = auctionRooms.get(auctionId) || [];
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

/**
 * Handle WebSocket Connections
 */
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');

  // Handle incoming messages
  ws.on('message', (msg) => {
    try {
      const { event, data } = JSON.parse(msg);

      switch (event) {
        case 'joinAuction':
          handleJoinAuction(ws, data);
          break;
        case 'placeBid':
          handlePlaceBid(ws, data);
          break;
        case 'auctionEnd':
          handleAuctionEnd(data);
          break;
        default:
          ws.send(JSON.stringify({ error: 'Unknown event type' }));
      }
    } catch (err) {
      console.error('Error handling message:', err);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });
});
const logError = require('./utils/logger');

// Example integration
wss.on('error', (error) => {
  console.error('WebSocket Error:', error);
  logError(error);
});

/**
 * Handle 'joinAuction' Event
 */
const handleJoinAuction = (ws, { auctionId }) => {
  if (!auctionId) {
    ws.send(JSON.stringify({ error: 'Auction ID is required' }));
    return;
  }

  // Create the auction room if it doesn't exist
  if (!auctionRooms.has(auctionId)) {
    auctionRooms.set(auctionId, []);
  }

  // Add the client to the room
  auctionRooms.get(auctionId).push(ws);
  ws.send(JSON.stringify({ message: `Joined auction ${auctionId}` }));
  console.log(`Client joined auction ${auctionId}`);
};

/**
 * Handle 'placeBid' Event
 */
const {
  saveBidToDatabase,
  getHighestBidForAuction,
} = require('./services/dbService');
const { connectionFilter } = require('./utils/ddosProtection');

// Add connection filtering middleware to the app
app.use(connectionFilter);
const bidRateLimiter = require('./utils/rateLimiter');

const handlePlaceBid = async (ws, { auctionId, userId, bidAmount }) => {
  try {
    // Rate-limit the bids
    const limitKey = `user:${userId}:placeBid`;
    const currentCount = await redisClient.get(limitKey) || 0;

    if (currentCount >= 1) {
      ws.send(JSON.stringify({ error: 'Too many bids placed. Please wait.' }));
      return;
    }

    // Increment rate-limit count
    await redisClient.set(limitKey, parseInt(currentCount) + 1, 'EX', 1);

    // Existing place bid logic here
  } catch (err) {
    console.error('Error in rate limiter:', err);
    ws.send(JSON.stringify({ error: 'Server error. Please try again later.' }));
  }
};


/**
 * Handle 'auctionEnd' Event
 */
const handleAuctionEnd = ({ auctionId }) => {
  if (!auctionId) {
    console.error('Auction ID is required to end an auction');
    return;
  }

  // Notify all clients that the auction has ended
  broadcastMessage(auctionId, {
    event: 'auctionEnd',
    data: { auctionId },
  });

  // Clear the auction room
  auctionRooms.delete(auctionId);
  console.log(`Auction ${auctionId} has ended.`);
};

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

 

const {
  updateHighestBidInCache,
  getHighestBidFromCache,
} = require('./services/redisService');
 
