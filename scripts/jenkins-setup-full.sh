#!/bin/bash
set -e
AUTH="admin:ade5df0e6431411b8330e946fa6b5c9d"
JENKINS="http://localhost:8080"
COOKIE_JAR=$(mktemp)

echo "=== Disabling Setup Wizard ==="
sudo sed -i 's/<installStateName>NEW.*/<installStateName>RUNNING<\/installStateName>/' /var/lib/jenkins/jenkins.install.UpgradeWizard.state 2>/dev/null || true
sudo sed -i 's/<installStateName>UPGRADE.*/<installStateName>RUNNING<\/installStateName>/' /var/lib/jenkins/jenkins.install.UpgradeWizard.state 2>/dev/null || true
sudo systemctl restart jenkins
sleep 20

echo "=== Getting Crumb ==="
CRUMB_JSON=$(curl -s -u "$AUTH" -c "$COOKIE_JAR" "$JENKINS/crumbIssuer/api/json")
CRUMB=$(echo "$CRUMB_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumb'])")
CRUMB_FIELD=$(echo "$CRUMB_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['crumbRequestField'])")
echo "Crumb ok"

echo "=== Creating Pipeline Job ==="
cat > /tmp/jenkins-pipeline.xml << 'XMLEOF'
<?xml version="1.1" encoding="UTF-8"?>
<flow-definition plugin="workflow-job">
  <description>Secret Notes CI/CD Pipeline (self-hosted)</description>
  <keepDependencies>false</keepDependencies>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps">
    <scm class="hudson.plugins.git.GitSCM" plugin="git">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/cinnamon0537/secret-notes.git</url>
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
XMLEOF

curl -s -u "$AUTH" -b "$COOKIE_JAR" -H "$CRUMB_FIELD: $CRUMB" \
  -H "Content-Type: application/xml" \
  -X POST \
  --data-binary @/tmp/jenkins-pipeline.xml \
  "$JENKINS/createItem?name=SecretNotes-CI" \
  -w '\nHTTP: %{http_code}\n'

echo ""
echo "=== Verifying ==="
curl -s -u "$AUTH" "$JENKINS/api/json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print('Jobs:', len(d.get('jobs',[])))
for j in d.get('jobs',[]):
    print(' -', j.get('name'), j.get('color'))
"
rm -f "$COOKIE_JAR"
