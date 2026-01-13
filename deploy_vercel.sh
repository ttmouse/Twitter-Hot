#!/bin/bash
# Simple Vercel deployment script
set -e

echo "=== Twitter-Hot Vercel Deployment ==="

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "Deploying to Vercel..."
echo ""

# Deploy to production
vercel --prod --yes

echo ""
echo "=== Vercel Deployment Complete ==="
echo "Your site should be live at: https://your-project.vercel.app"
echo ""
echo "To configure environment variables:"
echo "  1. Visit https://vercel.com/dashboard"
echo "  2. Select your project"
echo "  3. Go to Settings → Environment Variables"
