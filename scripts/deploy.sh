#!/usr/bin/env bash
set -euo pipefail

echo "Pulling latest code..."
git pull origin main

echo "Rebuilding container..."
docker compose up --build -d

echo "Pruning dangling images..."
docker image prune -f

echo "Done."
