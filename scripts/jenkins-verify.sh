#!/bin/bash
# Wait for Jenkins to be ready
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' -u admin:ade5df0e6431411b8330e946fa6b5c9d http://localhost:8080/api/json 2>/dev/null)
  if [ "$CODE" = "200" ]; then break; fi
  sleep 2
done

JOBS=$(curl -s -u admin:ade5df0e6431411b8330e946fa6b5c9d http://localhost:8080/api/json | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(len(d.get('jobs', [])), 'jobs')
for j in d.get('jobs', []):
    print(' -', j.get('name'), j.get('color'))
")
echo "$JOBS"

if echo "$JOBS" | grep -q SecretNotes; then
  echo "BUILDING..."
  CRUMB=$(curl -s -u admin:ade5df0e6431411b8330e946fa6b5c9d "http://localhost:8080/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,%22:%22,//crumb)")
  curl -s -u admin:ade5df0e6431411b8330e946fa6b5c9d -X POST -H "$CRUMB" "http://localhost:8080/job/SecretNotes-CI/build" -o /dev/null -w 'Build triggered: %{http_code}'
  echo ""
fi
