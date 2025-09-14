#!/bin/bash

# Navigate to backend directory
cd /home/ubuntu/expensepal/expensepal/backend

# Install required system packages if not already installed
echo "Checking system dependencies..."
if ! command -v poppler-utils &> /dev/null; then
    echo "Installing poppler-utils for PDF processing..."
    sudo apt-get update
    sudo apt-get install -y poppler-utils
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start the Flask application
echo "Starting ExpensePal backend on port 3042..."
python3 app.py