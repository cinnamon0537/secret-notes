#!/bin/bash
systemctl is-active jenkins
echo "---"
curl -s -u admin:ade5df0e6431411b8330e946fa6b5c9d http://localhost:8080/api/json | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(len(d.get('jobs',[])), 'jobs')
for j in d.get('jobs',[]):
    print(' -', j.get('name'), j.get('color'))
"
echo "---"
curl -s -u admin:ade5df0e6431411b8330e946fa6b5c9d http://localhost:8080/job/SecretNotes-CI/lastBuild/api/json | python3 -c "
import sys,json
d=json.load(sys.stdin)
print('Build:', d.get('number'), d.get('result'))
" 2>/dev/null || echo "No build info yet"
