#!/usr/bin/env python3
import urllib.request, urllib.error, json, sys

AUTH = "admin:ade5df0e6431411b8330e946fa6b5c9d"
JENKINS = "http://localhost:8080"
REPO = "https://github.com/cinnamon0537/secret-notes.git"

def req(url, method="GET", data=None, content_type=None):
    import base64
    headers = {"Authorization": "Basic " + base64.b64encode(AUTH.encode()).decode()}
    if content_type:
        headers["Content-Type"] = content_type
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    return urllib.request.urlopen(r)

# Get crumb
cr = json.load(req(f"{JENKINS}/crumbIssuer/api/json"))
crumb = cr["crumb"]
crumb_field = cr["crumbRequestField"]
print(f"Crumb: {crumb}")
headers_crumb = {crumb_field: crumb}

# Create job via script console
script = f'''
import jenkins.model.*
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import hudson.plugins.git.GitSCM
import hudson.plugins.git.UserRemoteConfig
import hudson.plugins.git.BranchSpec

def repo = "{REPO}"
def jenkins = Jenkins.getInstanceOrNull()
def job = jenkins.getItem("SecretNotes-CI")
if (job == null) {{
  job = jenkins.createProject(WorkflowJob.class, "SecretNotes-CI")
}}
job.setDescription("Secret Notes CI/CD Pipeline (self-hosted)")

def scm = new GitSCM(
  [new UserRemoteConfig(repo, null, null, null)],
  [new BranchSpec("*/main")],
  false, [],
  null, null, []
)
def definition = new CpsScmFlowDefinition(scm, "Jenkinsfile")
definition.setLightweight(true)
job.setDefinition(definition)
job.save()
println("Job created: " + job.getFullName())
'''

import base64
auth_header = "Basic " + base64.b64encode(AUTH.encode()).decode()
sr = urllib.request.Request(
    f"{JENKINS}/scriptText",
    data=script.encode(),
    headers={"Authorization": auth_header, "Content-Type": "text/plain", crumb_field: crumb},
    method="POST"
)
resp = urllib.request.urlopen(sr)
print("Script result:", resp.read().decode()[:200])

# Verify
jr = urllib.request.Request(
    f"{JENKINS}/api/json",
    headers={"Authorization": auth_header}
)
data = json.load(urllib.request.urlopen(jr))
print(f"Jobs: {len(data.get('jobs', []))}")
for j in data.get('jobs', []):
    print(f" - {j.get('name')} {j.get('color')}")
