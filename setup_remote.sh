#!/bin/bash
set -e

echo "=== Starting Remote Setup ==="

# 1. Update system packages
export DEBIAN_FRONTEND=noninteractive
if command -v apt-get &> /dev/null; then
    echo "Detected apt-based system. Updating..."
    apt-get update -y
    apt-get install -y curl git rsync
elif command -v yum &> /dev/null; then
    echo "Detected yum-based system. Updating..."
    yum update -y
    yum install -y curl git rsync
fi

# 2. Install Docker if missing
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    echo "Docker installed successfully."
else
    echo "Docker is already installed."
fi

# 3. Create app directory
mkdir -p /root/twitter-hot

echo "=== Remote Setup Complete ==="
