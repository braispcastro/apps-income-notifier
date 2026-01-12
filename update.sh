#!/bin/bash

# Update script for AdMob Income Notifier
# This script pulls the latest changes from Git and rebuilds the Docker container.

echo "🚀 Starting update..."

# Pull the latest changes
echo "📥 Pulling latest changes from Git..."
git pull

# Rebuild and restart the container
echo "🏗️ Rebuilding and restarting container..."
docker compose up -d --build

# Optional: Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Update completed successfully!"
