#!/bin/bash
AUTH="admin:ade5df0e6431411b8330e946fa6b5c9d"
JENKINS="http://localhost:8080"

echo "=== Plugins ==="
curl -s -u "$AUTH" "$JENKINS/pluginManager/api/json?depth=1" | python3 -c "
import sys,json
d = json.load(sys.stdin)
for p in d.get('plugins', []):
    print(p.get('shortName'))
"
echo ""
echo "=== Jenkins Log (last 10) ==="
sudo tail -10 /var/log/jenkins/jenkins.log 2>/dev/null || echo "no log access"
