#!/bin/bash

echo "🛑 Stopping any process on port 5000..."
lsof -ti :5000 | xargs kill -9 2>/dev/null

echo "🧹 Cleaning up..."
sleep 1

echo "🚀 Starting server..."
cd /Users/bindhusree/locksyra-app/backend
npm start