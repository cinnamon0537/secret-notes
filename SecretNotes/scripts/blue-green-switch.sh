#!/bin/bash
set -e

COMPOSE_DIR="$(cd "$(dirname "$0")/../SecretNotes/secret-notes-backend" && pwd)"
NGINX_CONF="$(cd "$(dirname "$0")/.." && pwd)/nginx/nginx.conf"
NGINX_BLUE="$(cd "$(dirname "$0")/.." && pwd)/nginx/nginx.conf.blue"
NGINX_GREEN="$(cd "$(dirname "$0")/.." && pwd)/nginx/nginx.conf.green"
SWITCH_LOG="$(cd "$(dirname "$0")/.." && pwd)/.blue-green-state"

TARGET=${1:-""}
HEALTH_URL=${2:-"http://localhost:80"}

usage() {
  echo "Usage: $0 blue|green|status|rollback [health_url]"
  echo "  blue      — switch traffic to the blue stack"
  echo "  green     — switch traffic to the green stack"
  echo "  status    — show current active stack"
  echo "  rollback  — switch back to the previously active stack"
  echo "  health_url — optional, default: http://localhost:80"
  exit 1
}

detect_active() {
  if [ -f "$SWITCH_LOG" ]; then
    cat "$SWITCH_LOG"
  else
    echo "blue"
  fi
}

save_active() {
  echo "$1" > "$SWITCH_LOG"
}

wait_for_health() {
  local url=$1
  local max_attempts=${2:-30}
  local interval=${3:-2}

  echo "  Waiting for $url ..."
  for i in $(seq 1 $max_attempts); do
    if curl -sf "$url" > /dev/null 2>&1; then
      echo "  $url is healthy (attempt $i)"
      return 0
    fi
    echo "  Attempt $i/$max_attempts — waiting ${interval}s ..."
    sleep "$interval"
  done
  echo "  ERROR: $url did not become healthy after $max_attempts attempts"
  return 1
}

check_direct_backend() {
  local port=$1
  wait_for_health "http://localhost:${port}/health" 15 2
}

switch_nginx() {
  local target=$1

  if [ "$target" = "green" ]; then
    cp "$NGINX_GREEN" "$NGINX_CONF"
  else
    cp "$NGINX_BLUE" "$NGINX_CONF"
  fi

  echo "  Reloading nginx configuration ..."
  docker compose -f "$COMPOSE_DIR/docker-compose.prod.yml" exec -T nginx nginx -s reload 2>/dev/null || \
    docker compose -f "$COMPOSE_DIR/docker-compose.prod.yml" restart nginx
  echo "  Nginx reloaded."
}

verify_switch() {
  local expected=$1
  echo "  Verifying traffic is routed to $expected ..."
  sleep 3

  local health_response
  health_response=$(curl -sf "http://localhost:80/api/health" 2>/dev/null || echo "FAILED")
  if [ "$health_response" = "FAILED" ]; then
    echo "  WARNING: Health endpoint check failed via nginx proxy"
    return 1
  fi
  echo "  Health endpoint response: $health_response"
  echo "  Traffic verified on port 80 — active stack: $expected"
  return 0
}

pull_images() {
  echo "  Pulling latest images ..."
  docker compose -f "$COMPOSE_DIR/docker-compose.prod.yml" pull backend-blue backend-green frontend-blue frontend-green 2>/dev/null || true
}

# ---- MAIN ----

if [ -z "$TARGET" ]; then
  usage
fi

ACTIVE=$(detect_active)

if [ "$TARGET" = "status" ]; then
  echo "Active stack: $ACTIVE"
  echo "Switch log: $SWITCH_LOG"
  exit 0
fi

if [ "$TARGET" = "rollback" ]; then
  if [ "$ACTIVE" = "blue" ]; then
    TARGET="green"
  else
    TARGET="blue"
  fi
  echo "Rolling back — switching from $ACTIVE to $TARGET"
fi

if [ "$TARGET" != "blue" ] && [ "$TARGET" != "green" ]; then
  echo "Unknown target: $TARGET"
  usage
fi

if [ "$TARGET" = "$ACTIVE" ]; then
  echo "=== $TARGET is already active — nothing to do ==="
  exit 0
fi

OLD=$ACTIVE
echo "=== Switching from $OLD to $TARGET ==="
echo ""

cd "$COMPOSE_DIR"

echo "1. Pull latest Docker images"
pull_images

if [ "$TARGET" = "green" ]; then
  echo ""
  echo "2. Bring up GREEN stack (backend-green + frontend-green)"
  docker compose -f docker-compose.prod.yml up -d backend-green frontend-green

  echo ""
  echo "3. Health check GREEN backend"
  check_direct_backend 3001 || {
    echo "  ERROR: Green backend failed health check — aborting switch"
    exit 1
  }

else
  echo ""
  echo "2. Bring up BLUE stack (backend-blue + frontend-blue)"
  docker compose -f docker-compose.prod.yml up -d backend-blue frontend-blue

  echo ""
  echo "3. Health check BLUE backend"
  check_direct_backend 3000 || {
    echo "  ERROR: Blue backend failed health check — aborting switch"
    exit 1
  }
fi

echo ""
echo "4. Update nginx upstream to $TARGET"
switch_nginx "$TARGET"

echo ""
echo "5. Verify traffic switch"
if verify_switch "$TARGET"; then
  echo ""
  echo "6. Stop old $OLD stack"
  docker compose -f docker-compose.prod.yml stop "backend-${OLD}" "frontend-${OLD}" 2>/dev/null || true
  save_active "$TARGET"
  echo ""
  echo "=============================================="
  echo "  TRAFFIC IS NOW ON $TARGET"
  echo "  Nginx proxy: http://localhost:80"
  echo "  Backend health: http://localhost:80/api/health"
  echo "=============================================="
else
  echo ""
  echo "=== VERIFICATION FAILED — rolling back to $OLD ==="
  switch_nginx "$OLD"
  echo "  Rollback complete. Traffic remains on $OLD."
  exit 1
fi
