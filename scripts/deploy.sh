#!/usr/bin/env bash
set -euo pipefail

echo "Pulling latest code..."
git pull origin main

echo "Pruning dangling images..."
docker image prune -f

echo "Done. Rebuild and restart the container in Dockge to apply changes."
