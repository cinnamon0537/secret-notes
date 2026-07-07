#!/bin/bash
set -e

echo "=== Cleanup ==="
docker ps -aq | xargs -r docker stop 2>/dev/null || true
docker ps -aq | xargs -r docker rm 2>/dev/null || true
docker network prune -f || true
echo "Cleanup done."

echo "=== Deploy Blue/Green ==="
cd /opt/secret-notes

echo "Starting postgres..."
docker compose -f secret-notes-backend/docker-compose.prod.yml up -d postgres
echo "Waiting for postgres to be healthy..."
sleep 15

echo "Starting BLUE stack..."
docker compose -f secret-notes-backend/docker-compose.prod.yml up -d backend-blue frontend-blue
sleep 15

echo "Starting nginx..."
docker compose -f secret-notes-backend/docker-compose.prod.yml up -d nginx
sleep 5

echo ""
echo "=== Container Status ==="
docker compose -f secret-notes-backend/docker-compose.prod.yml ps

echo ""
echo "=== Backend Health ==="
curl -sf http://localhost:3000/health && echo " OK: backend-blue" || echo " FAIL: backend-blue"
curl -sf http://localhost/api/health && echo " OK: nginx proxy" || echo " FAIL: nginx proxy"

echo ""
echo "=== GREEN stack ready for switch ==="
docker compose -f secret-notes-backend/docker-compose.prod.yml up -d backend-green frontend-green
sleep 10

echo ""
echo "=== Final Status ==="
docker compose -f secret-notes-backend/docker-compose.prod.yml ps

echo ""
echo "Setup complete! Public URL: http://<EC2_PUBLIC_IP>"
