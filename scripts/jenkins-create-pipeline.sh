#!/bin/bash
AUTH="admin:ade5df0e6431411b8330e946fa6b5c9d"
JENKINS="http://localhost:8080"
JAR=$(mktemp)
REPO="https://github.com/cinnamon0537/secret-notes.git"

CRUMB_JSON=$(curl -s -u "$AUTH" -c "$JAR" "$JENKINS/crumbIssuer/api/json")
CRUMB=$(echo "$CRUMB_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumb'])")
CRUMB_FIELD=$(echo "$CRUMB_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumbRequestField'])")

echo "=== Deleting old Freestyle job ==="
curl -s -u "$AUTH" -b "$JAR" -H "$CRUMB_FIELD: $CRUMB" -X POST "$JENKINS/job/SecretNotes-CI/doDelete" -o /dev/null -w "Delete: %{http_code}\n"

echo "=== Creating Pipeline Job ==="
cat > /tmp/jenkins-pipeline-config.xml << XEOF
<?xml version="1.1" encoding="UTF-8"?>
<flow-definition plugin="workflow-job@latest">
  <description>Secret Notes CI/CD Pipeline (Jenkinsfile from SCM)</description>
  <keepDependencies>false</keepDependencies>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@latest">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@latest">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>$REPO</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="empty-list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
XEOF

curl -s -u "$AUTH" -b "$JAR" -H "$CRUMB_FIELD: $CRUMB" \
  -H "Content-Type: application/xml" -X POST \
  --data-binary @/tmp/jenkins-pipeline-config.xml \
  "$JENKINS/createItem?name=SecretNotes-CI" \
  -w "Create: %{http_code}\n"

echo ""
echo "=== Verifying ==="
curl -s -u "$AUTH" "$JENKINS/api/json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
jobs=d.get('jobs',[])
print(len(jobs),'jobs')
for j in jobs:
    print(' -',j.get('name'),j.get('_class',''),j.get('color'))
"

echo ""
echo "=== Triggering Build ==="
curl -s -u "$AUTH" -b "$JAR" -H "$CRUMB_FIELD: $CRUMB" \
  -X POST "$JENKINS/job/SecretNotes-CI/build" \
  -o /dev/null -w "Build: %{http_code}\n"

echo "Jenkins Pipeline: http://35.87.110.224:8080/job/SecretNotes-CI"
rm -f "$JAR"
