#!/bin/bash
set -euo pipefail

SQ_URL="${SONARQUBE_URL:-http://localhost:9000}"
SQ_ADMIN_USER="${SQ_ADMIN_USER:-admin}"
SQ_ADMIN_PASS="${SQ_ADMIN_PASS:-admin}"
BACKEND_KEY="secret-notes-backend"
FRONTEND_KEY="secret-notes-frontend"

echo "==> Waiting for SonarQube at ${SQ_URL} ..."
until curl -fsS "${SQ_URL}/api/system/status" | grep -q '"status":"UP"'; do
  echo "    Still waiting ..."
  sleep 5
done
echo "==> SonarQube is UP"

echo "==> Changing default admin password ..."
curl -fsS -u "${SQ_ADMIN_USER}:${SQ_ADMIN_PASS}" \
  -X POST "${SQ_URL}/api/users/change_password" \
  -d "login=${SQ_ADMIN_USER}&previousPassword=${SQ_ADMIN_PASS}&password=admin123" || echo "    (password may already be changed)"

SQ_AUTH="${SQ_ADMIN_USER}:admin123"

echo "==> Creating project: ${BACKEND_KEY}"
curl -fsS -u "${SQ_AUTH}" \
  -X POST "${SQ_URL}/api/projects/create" \
  -d "name=secret-notes-backend&project=${BACKEND_KEY}" || echo "    (project may already exist)"

echo "==> Creating project: ${FRONTEND_KEY}"
curl -fsS -u "${SQ_AUTH}" \
  -X POST "${SQ_URL}/api/projects/create" \
  -d "name=secret-notes-frontend&project=${FRONTEND_KEY}" || echo "    (project may already exist)"

echo "==> Generating user token ..."
TOKEN_RESPONSE=$(curl -fsS -u "${SQ_AUTH}" \
  -X POST "${SQ_URL}/api/user_tokens/generate" \
  -d "name=ci-token")
SQ_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "============================================"
echo "  SonarQube ready at: ${SQ_URL}"
echo "  Login:             ${SQ_ADMIN_USER} / admin123"
echo ""
echo "  Add these to GitHub Secrets:"
echo "  ----------------------------------------"
echo "  SONAR_HOST_URL              = ${SQ_URL}"
echo "  SONAR_TOKEN                 = ${SQ_TOKEN}"
echo "  SONAR_BACKEND_PROJECT_KEY   = ${BACKEND_KEY}"
echo "  SONAR_FRONTEND_PROJECT_KEY  = ${FRONTEND_KEY}"
echo "============================================"
echo ""
echo "Run: gh secret set SONAR_HOST_URL -b'${SQ_URL}'"
echo "Run: gh secret set SONAR_TOKEN -b'${SQ_TOKEN}'"
echo "Run: gh secret set SONAR_BACKEND_PROJECT_KEY -b'${BACKEND_KEY}'"
echo "Run: gh secret set SONAR_FRONTEND_PROJECT_KEY -b'${FRONTEND_KEY}'"
