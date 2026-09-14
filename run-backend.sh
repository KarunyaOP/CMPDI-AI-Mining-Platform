#!/usr/bin/env bash
set -e

echo "========================================================"
echo " Starting GeoIntel CMPDI Backend (FastAPI)"
echo "========================================================"

# Check if running from root or backend
if [ -d "backend" ]; then
    echo "Running from project root..."
    uvicorn backend.main:app --reload --port 8000
elif [ -f "main.py" ]; then
    echo "Running from inside backend directory..."
    uvicorn main:app --reload --port 8000
else
    echo "Error: Could not locate backend/main.py or main.py."
    echo "Please run this script from the project root or backend directory."
    exit 1
fi
