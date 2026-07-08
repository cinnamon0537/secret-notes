#!/bin/bash
AUTH="admin:ade5df0e6431411b8330e946fa6b5c9d"
JENKINS="http://localhost:8080"
COOKIE_JAR=$(mktemp)

echo "=== Getting Crumb ==="
CRUMB_JSON=$(curl -s -u "$AUTH" -c "$COOKIE_JAR" "$JENKINS/crumbIssuer/api/json")
CRUMB=$(echo "$CRUMB_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumb'])")
CRUMB_FIELD=$(echo "$CRUMB_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumbRequestField'])")

echo "=== Creating Freestyle Job ==="
HTTP=$(curl -s -u "$AUTH" -b "$COOKIE_JAR" -H "$CRUMB_FIELD: $CRUMB" \
  -H "Content-Type: application/xml" \
  -X POST \
  --data-binary @/tmp/jenkins-freestyle-config.xml \
  -o /tmp/jenkins-create-response.txt -w '%{http_code}' \
  "$JENKINS/createItem?name=SecretNotes-CI")
echo "HTTP: $HTTP"
cat /tmp/jenkins-create-response.txt | head -5

echo ""
echo "=== Verifying Jobs ==="
curl -s -u "$AUTH" "$JENKINS/api/json" | python3 -c "
import sys,json
d = json.load(sys.stdin)
print('Jobs:', len(d.get('jobs', [])))
for j in d.get('jobs', []):
    print(' -', j.get('name'), j.get('color'))
"

if [ "$HTTP" = "200" ]; then
  echo ""
  echo "=== Triggering First Build ==="
  CRUMB_JSON2=$(curl -s -u "$AUTH" -c "$COOKIE_JAR" "$JENKINS/crumbIssuer/api/json")
  CRUMB2=$(echo "$CRUMB_JSON2" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumb'])")
  CRUMB_FIELD2=$(echo "$CRUMB_JSON2" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumbRequestField'])")
  BUILD_HTTP=$(curl -s -u "$AUTH" -b "$COOKIE_JAR" -H "$CRUMB_FIELD2: $CRUMB2" \
    -X POST "$JENKINS/job/SecretNotes-CI/build" \
    -o /dev/null -w '%{http_code}')
  echo "Build trigger HTTP: $BUILD_HTTP"
  echo "Check: http://54.213.150.110:8080/job/SecretNotes-CI"
fi
rm -f "$COOKIE_JAR"
