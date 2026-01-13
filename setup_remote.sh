#!/bin/bash
set -e

echo "=== Setting up remote server for Twitter-Hot deployment ==="

# Update system packages
echo "Step 1: Updating system packages..."
apt-get update -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Step 2: Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
else
    echo "Step 2: Docker already installed, skipping..."
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Step 3: Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "Step 3: Docker Compose already installed, skipping..."
fi

# Create project directory if it doesn't exist
echo "Step 4: Creating project directory..."
mkdir -p /root/twitter-hot

# Install rsync if not installed (for file syncing)
if ! command -v rsync &> /dev/null; then
    echo "Step 5: Installing rsync..."
    apt-get install -y rsync
else
    echo "Step 5: rsync already installed, skipping..."
fi

# Install certbot for SSL (optional)
if ! command -v certbot &> /dev/null; then
    echo "Step 6: Installing certbot for SSL..."
    apt-get install -y certbot
else
    echo "Step 6: certbot already installed, skipping..."
fi

echo "=== Remote server setup complete ==="
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
