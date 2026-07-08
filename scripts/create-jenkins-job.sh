#!/bin/bash
CRUMB=$(curl -s -u admin:ade5df0e6431411b8330e946fa6b5c9d http://localhost:8080/crumbIssuer/api/json | python3 -c "import sys,json; print(json.load(sys.stdin)['crumb'])")
curl -s -u admin:ade5df0e6431411b8330e946fa6b5c9d \
  -X POST \
  -H "Jenkins-Crumb: $CRUMB" \
  -H "Content-Type: application/xml" \
  --data-binary @/tmp/jenkins-job-config.xml \
  http://localhost:8080/createItem?name=SecretNotes-CI
echo "EXIT: $?"
