#!/bin/bash
set -e

# Update .env with RDS credentials
cat > /opt/secret-notes/.env << 'ENVEOF'
DATABASE_URL=postgres://secretnotesadmin:SecretNotes2024!@secret-notes-db.czah9i5vgwj0.us-west-2.rds.amazonaws.com:5432/encr_notes
DATABASE_SSL=true
BACKEND_IMAGE=cinnamon0/secret-notes:backend-latest
FRONTEND_IMAGE=cinnamon0/secret-notes:frontend-latest
ENVEOF

echo "=== .env ==="
cat /opt/secret-notes/.env

# Save SSH public key permanently from EC2 instance metadata
echo "Saving SSH key permanently..."
PUBKEY=$(curl -s http://169.254.169.254/latest/meta-data/public-keys/0/openssh-key)
if [ -n "$PUBKEY" ]; then
    grep -q "$PUBKEY" ~/.ssh/authorized_keys 2>/dev/null || echo "$PUBKEY" >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "SSH key saved permanently."
else
    echo "Warning: Could not fetch public key from metadata."
fi

# Login to Docker Hub (optional - skip if not configured)
if [ -n "${DOCKER_USERNAME}" ] && [ -n "${DOCKER_TOKEN}" ]; then
    echo "${DOCKER_TOKEN}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
    echo "Logged into Docker Hub."
else
    echo "Docker Hub credentials not provided. Assuming public images."
fi

# Pull images
echo "Pulling backend image..."
docker pull cinnamon0/secret-notes:backend-latest || echo "Pull failed, will use cached/built image"

echo "Pulling frontend image..."
docker pull cinnamon0/secret-notes:frontend-latest || echo "Pull failed, will use cached/built image"

# Start the blue stack as initial active
echo "Starting BLUE stack..."
cd /opt/secret-notes
docker compose -f docker-compose.prod.yml up -d postgres backend-blue frontend-blue nginx

echo ""
echo "Waiting for services..."
sleep 10

echo ""
echo "=== Container Status ==="
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== Health check ==="
curl -sf http://localhost:3000/health && echo "Backend-blue healthy" || echo "Backend-blue NOT healthy"
curl -sf http://localhost/api/health && echo "Nginx proxy healthy" || echo "Nginx proxy NOT healthy"

echo ""
echo "=== Setup complete ==="
echo "Active stack: BLUE"
echo "Public URL: http://35.89.236.72"
echo "To switch to green: cd /opt/secret-notes && docker compose -f docker-compose.prod.yml up -d backend-green frontend-green"
