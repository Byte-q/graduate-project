#!/usr/bin/env node

// This is a development script that starts our Next.js + Express integrated server
console.log('Starting the Next.js + Express development server...');

// Ensure we're using the right host and port for Replit
process.env.HOST = '0.0.0.0';
process.env.PORT = 5000; // Use 5000 to match Replit settings
process.env.NODE_ENV = 'development';

// Execute the server-next.js file
require('./server-next.js');