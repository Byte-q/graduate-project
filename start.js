// Start script for the Next.js + Express integrated server
// This file is used by the Replit workflow to start the application

// Set to development mode if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Check if we're using 0.0.0.0 for the hostname instead of localhost
// This is important for the app to be accessible externally
if (process.env.REPL_SLUG || process.env.REPL_OWNER) {
  // We're in a Replit environment, use 0.0.0.0
  process.env.HOST = '0.0.0.0';
}

// Start the server
console.log('Starting Next.js + Express integrated server...');
require('./server-next.js');