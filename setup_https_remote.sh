#!/bin/bash
set -e

DOMAIN="ttmouse.com"
EMAIL="admin@ttmouse.com" # Placeholder email

echo "=== Starting HTTPS Setup for $DOMAIN ==="

# 1. Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        yum install -y certbot
    fi
fi

# 2. Stop Docker to free up port 80
echo "Stopping Docker containers..."
cd /root/twitter-hot
docker compose down

# 3. Obtain Certificate
echo "Obtaining SSL certificate..."
# Use --continue to modify existing certs if they exist, or create new ones
# Using the non-www domain as the cert name for simplicity
certbot certonly --standalone \
    -d $DOMAIN -d www.$DOMAIN \
    --email $EMAIL \
    --agree-tos --no-eff-email \
    --non-interactive \
    --expand

# 4. Check if cert exists
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "Certificate obtained successfully!"

    # 5. Swap configurations
    echo "Applying HTTPS configurations..."
    cp nginx_ssl.conf nginx.conf
    cp docker-compose-ssl.yml docker-compose.yml

    # 6. Restart Application
    echo "Restarting application..."
    docker compose up -d --build --remove-orphans
    
    echo "=== HTTPS Setup Complete ==="
    echo "Access your site at https://$DOMAIN"
else
    echo "ERROR: Failed to obtain certificate."
    echo "Please check your DNS settings. DNS must point to $(curl -s ifconfig.me)"
    # Attempt to restart with old config if cert failed (best effort)
    docker compose up -d
    exit 1
fi
