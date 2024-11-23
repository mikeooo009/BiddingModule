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

const handlePlaceBid = async (ws, { auctionId, userId, bidAmount }) => {
  if (!auctionId || !userId || !bidAmount) {
    ws.send(JSON.stringify({ error: 'Auction ID, User ID, and Bid Amount are required' }));
    return;
  }

  // Retrieve the current highest bid from Redis
  const currentHighestBid = await getHighestBidFromCache(auctionId);

  if (bidAmount <= currentHighestBid) {
    ws.send(JSON.stringify({ error: 'Bid must be higher than the current highest bid' }));
    return;
  }

  // Update the highest bid in Redis
  await updateHighestBidInCache(auctionId, bidAmount);

  // Save bid to the database
  await saveBidToDatabase(auctionId, userId, bidAmount);

  // Broadcast the new bid to all clients in the auction room
  broadcastMessage(auctionId, {
    event: 'newBid',
    data: { auctionId, userId, bidAmount },
  });

  console.log(`Bid placed in auction ${auctionId}: User ${userId} - $${bidAmount}`);
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
  saveBidToDatabase,
  getHighestBidForAuction,
} = require('./services/dbService');
 

const {
  updateHighestBidInCache,
  getHighestBidFromCache,
} = require('./services/redisService');
 
