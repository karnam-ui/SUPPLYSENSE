#!/bin/bash
# SupplySense Backend Setup and Run Script

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║     SupplySense - Supply Chain Intelligence System      ║"
echo "║                 Backend Setup & Run                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check Python
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 is not installed"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo "✓ Found $PYTHON_VERSION"
echo ""

# Check PostgreSQL
echo "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "✗ PostgreSQL is not installed"
    echo "  Please install PostgreSQL or ensure psql is in PATH"
    exit 1
fi
echo "✓ PostgreSQL found"
echo ""

# Check Redis
echo "Checking Redis installation..."
if ! command -v redis-cli &> /dev/null; then
    echo "⚠ Redis is not installed"
    echo "  The application will run without caching"
else
    echo "✓ Redis found"
fi
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Setup database
echo "Setting up database..."
python3 setup.py
echo ""

# Start Redis if available
if command -v redis-server &> /dev/null; then
    echo "Starting Redis server..."
    redis-server --daemonize yes --port 6379 > /dev/null 2>&1
    echo "✓ Redis server started (port 6379)"
else
    echo "⚠ Redis not available - running without caching"
fi
echo ""

# Display startup information
echo "╔════════════════════════════════════════════════════════╗"
echo "║              SupplySense Backend Ready!                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Starting FastAPI server..."
echo "  Address: http://0.0.0.0:8000"
echo "  Docs:    http://localhost:8000/docs"
echo "  Health:  http://localhost:8000/health"
echo ""
echo "Stop the server with Ctrl+C"
echo ""

# Start the application
python3 main.py
