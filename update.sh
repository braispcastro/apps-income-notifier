#!/bin/bash

# Update script for AdMob Income Notifier
# This script pulls the latest changes from Git and rebuilds the Docker container.

echo "🚀 Iniciando actualización..."

# Pull the latest changes
echo "📥 Bajando últimos cambios de Git..."
git pull

# Rebuild and restart the container
echo "🏗️ Reconstruyendo y reiniciando contenedor..."
docker compose up -d --build

# Optional: Clean up old images
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo "✅ ¡Actualización completada con éxito!"
