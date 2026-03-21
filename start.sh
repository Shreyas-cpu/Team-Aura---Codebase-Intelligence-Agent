#!/bin/bash

echo -e "\033[1;32m"
echo "=============================================================="
echo "       ⬡ CodeAura Intelligence Boot Sequence Initiated ⬡"
echo "=============================================================="
echo -e "\033[0m"

echo "[1/3] Refreshing Backend Dependencies..."
cd backend
npm install
cd ..

echo -e "\n[2/3] Refreshing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo -e "\n[3/3] Launching System Services...\n"

# Start backend in the background and pipe output
cd backend
node index.js &
BACKEND_PID=$!
cd ..

# Start frontend in the background and pipe output
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\033[1;36m"
echo "=============================================================="
echo "                 SYSTEM ONLINE - ALL GO"
echo "=============================================================="
echo -e "\033[0m"
echo -e "  ⬡ Backend Services:  http://localhost:3001"
echo -e "  ⬡ Frontend Dashboard: http://localhost:5173"
echo -e "\nPress Ctrl+C to stop all servers."

# Wait for process to exit
wait $BACKEND_PID $FRONTEND_PID
