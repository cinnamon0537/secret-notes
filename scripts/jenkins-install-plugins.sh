#!/bin/bash
AUTH="admin:ade5df0e6431411b8330e946fa6b5c9d"
JENKINS="http://localhost:8080"
JAR=$(mktemp)

# Step 1: Get crumb with cookie
CRUMB_JSON=$(curl -s -u "$AUTH" -c "$JAR" "$JENKINS/crumbIssuer/api/json")
CRUMB=$(echo "$CRUMB_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumb'])")
CRUMB_FIELD=$(echo "$CRUMB_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumbRequestField'])")
echo "Crumb: $CRUMB"

# Step 2: Install plugins one by one
PLUGINS="workflow-job workflow-cps workflow-basic-steps workflow-durable-task-step git credentials-binding mailer pipeline-stage-view"
echo "=== Installing Plugins ==="
for p in $PLUGINS; do
  echo -n "  $p: "
  HTTP=$(curl -s -u "$AUTH" -b "$JAR" -H "$CRUMB_FIELD: $CRUMB" \
    -X POST \
    -H "Content-Type: application/xml" \
    -d "<jenkins><install plugin='${p}@latest'/></jenkins>" \
    -o /dev/null -w '%{http_code}' \
    "$JENKINS/pluginManager/installNecessaryPlugins")
  echo "$HTTP"
done

echo "Waiting for plugin downloads..."
sleep 30

# Step 3: Safe restart
echo "=== Restarting ==="
curl -s -u "$AUTH" -b "$JAR" -H "$CRUMB_FIELD: $CRUMB" -X POST "$JENKINS/safeRestart" -o /dev/null -w "Restart: %{http_code}\n"

echo "Waiting 30s for restart..."
sleep 40

# Step 4: Verify plugins
echo "=== Verify ==="
curl -s -u "$AUTH" "$JENKINS/pluginManager/api/json?depth=1" | python3 -c "
import sys,json
d=json.load(sys.stdin)
plugins=[p['shortName'] for p in d.get('plugins',[])]
print(len(plugins),'plugins installed')
for p in sorted(plugins):
    print(' -',p)
" 2>/dev/null || echo "Still restarting..."
rm -f "$JAR"
