#!/bin/bash
# Simple deployment script for server-only deployment
set -e

echo "=== Twitter-Hot Server Deployment ==="

# Check if deploy_secrets.exp exists
if [ ! -f "deploy_secrets.exp" ]; then
    echo "Error: deploy_secrets.exp not found!"
    echo "Please copy deploy_secrets.example.exp to deploy_secrets.exp and fill in your values."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Error: .env not found!"
    echo "Please create .env file with database configuration."
    exit 1
fi

# Extract server info from deploy_secrets.exp
SERVER_IP=$(grep "set host" deploy_secrets.exp | cut -d'"' -f2)
SERVER_USER=$(grep "set user" deploy_secrets.exp | cut -d'"' -f2)
REMOTE_DIR=$(grep "set remote_dir" deploy_secrets.exp | cut -d'"' -f2)

echo "Target server: $SERVER_USER@$SERVER_IP"
echo "Remote directory: $REMOTE_DIR"
echo ""

# Sync files to server
echo "Step 1: Syncing files to server..."
rsync -avz --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.DS_Store' \
  --exclude='.env' \
  . $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

echo ""
echo "Step 2: Building and starting Docker containers..."
ssh $SERVER_USER@$SERVER_IP "cd $REMOTE_DIR && docker compose down && docker compose up -d --build"

echo ""
echo "Step 3: Checking container status..."
ssh $SERVER_USER@$SERVER_IP "cd $REMOTE_DIR && docker compose ps"

echo ""
echo "=== Deployment Complete ==="
echo "Backend API: http://$SERVER_IP/api/tweets"
echo "Frontend: http://$SERVER_IP/"
echo ""
echo "To view logs, run:"
echo "  ssh $SERVER_USER@$SERVER_IP 'cd $REMOTE_DIR && docker compose logs -f'"
