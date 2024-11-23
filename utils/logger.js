const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/error.log');

// Write errors to log file
const logError = (error) => {
  const errorMessage = `${new Date().toISOString()} - ${error.stack || error}\n`;
  fs.appendFile(logFile, errorMessage, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
};

module.exports = logError;
