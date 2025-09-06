#!/bin/bash

# Render.com deployment script
echo "Starting deployment to Render.com..."

# Ensure we're in the server directory
cd "$(dirname "$0")"

# Install dependencies
echo "Installing dependencies..."
npm install

# If NODE_ENV is not set, default to production
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=production
  echo "Setting NODE_ENV to production"
fi

# Start the server
echo "Starting server in $NODE_ENV mode..."
node server.js
