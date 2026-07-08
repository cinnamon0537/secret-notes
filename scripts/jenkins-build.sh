#!/bin/bash
set -e

echo "=== SecretNotes-CI Freestyle Build ==="
echo "Node: $(hostname)"

REPO_URL="https://github.com/cinnamon0537/secret-notes.git"
WORKSPACE="/tmp/secret-notes-build"
BRANCH="${BRANCH:-main}"

echo "=== Checkout ==="
rm -rf "$WORKSPACE"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$WORKSPACE" 2>&1

echo ""
echo "=== Backend Lint ==="
cd "$WORKSPACE/secret-notes-backend"
npm ci --silent 2>&1
npm run lint 2>&1
echo "Backend lint: OK"

echo ""
echo "=== Backend Test ==="
npm test 2>&1
echo "Backend test: OK"

echo ""
echo "=== Frontend Lint ==="
cd "$WORKSPACE/secret-notes-frontend"
npm ci --silent 2>&1
npm run lint 2>&1
echo "Frontend lint: OK"

echo ""
echo "=== Frontend Test ==="
npm test 2>&1
echo "Frontend test: OK"

echo ""
echo "=== Frontend Build ==="
npm run build 2>&1
echo "Frontend build: OK"

echo ""
echo "=== BUILD SUCCESS ==="
