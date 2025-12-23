#!/bin/bash
# Bash script to run the backend server
# This ensures the server is accessible from the network

echo "Starting FastAPI backend server..."
echo "Server will be accessible at: http://0.0.0.0:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""

uvicorn api:app --host 0.0.0.0 --port 8000 --reload
