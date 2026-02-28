#!/bin/bash

# Script to automate Playwright tests with Vite dev server

# Start the Vite dev server in the background
npm run dev &

# Wait for the server to start
sleep 5

# Run Playwright tests
npx playwright test

# Kill the Vite server
pkill -f vite