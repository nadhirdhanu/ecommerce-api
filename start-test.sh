#!/bin/bash

echo "🚀 Starting API Test Environment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the API server in background
echo "🔧 Starting API server..."
npm start &
API_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 3

# Open the test frontend
echo "🌐 Opening test frontend..."
if command -v xdg-open > /dev/null; then
    xdg-open test-frontend.html
elif command -v open > /dev/null; then
    open test-frontend.html
else
    echo "Please open test-frontend.html in your browser"
fi

echo "✅ Test environment ready!"
echo "📍 API running at: http://localhost:4000"
echo "📍 Frontend: test-frontend.html"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for Ctrl+C
trap "echo '🛑 Stopping server...'; kill $API_PID; exit" INT
wait $API_PID