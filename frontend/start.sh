#!/bin/bash

# SupplySense Dashboard - Quick Start Guide

echo "======================================"
echo "SupplySense React Dashboard Setup"
echo "======================================"
echo ""

# Check if backend is already running
echo "Starting SupplySense Frontend..."
echo ""

# Install dependencies if not already done
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

echo ""
echo "Starting development server..."
echo "Dashboard will be available at: http://localhost:5173"
echo ""
echo "Make sure the backend is running at: http://localhost:8000"
echo "For AI features, ensure Ollama is running: http://localhost:11434"
echo ""

# Start the dev server
npm run dev
