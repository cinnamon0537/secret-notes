#!/usr/bin/env python3
import urllib.request, json, base64, sys, time

AUTH = base64.b64encode(b"admin:ade5df0e6431411b8330e946fa6b5c9d").decode()
JENKINS = "http://localhost:8080"
HEADERS = {"Authorization": f"Basic {AUTH}"}

def api(path, method="GET", data=None):
    url = f"{JENKINS}{path}"
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    try:
        return urllib.request.urlopen(req)
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} for {path}")
        return None

# 1. Skip setup wizard
print("=== Disabling Setup Wizard ===")
cr = json.load(api("/crumbIssuer/api/json"))
crumb = cr["crumb"]
crumb_field = cr["crumbRequestField"]

script = '''
import jenkins.install.InstallState
if (jenkins.install.InstallState.INITIAL_SETUP_COMPLETED == false) {
    jenkins.install.InstallState.INITIAL_SETUP_COMPLETED.initializeState()
    println("Wizard bypassed")
} else {
    println("Already setup")
}
'''
data = f"script={urllib.parse.quote(script)}".encode()
h = dict(HEADERS)
h[crumb_field] = crumb
h["Content-Type"] = "application/x-www-form-urlencoded"
req = urllib.request.Request(f"{JENKINS}/scriptText", data=data, headers=h, method="POST")
try:
    resp = urllib.request.urlopen(req)
    print("  OK:", resp.read().decode()[:200])
except Exception as e:
    print("  Error:", e)

# 2. Install plugins
print("\n=== Installing Plugins ===")
plugins = [
    "workflow-job", "workflow-cps", "workflow-basic-steps",
    "workflow-durable-task-step", "git", "credentials-binding",
    "mailer", "pipeline-stage-view"
]

for p in plugins:
    print(f"  Installing {p}...")
    resp = api(f"/pluginManager/installNecessaryPlugins", "POST",
               f"<jenkins><install plugin='{p}@latest'/></jenkins>".encode())
    if resp:
        print(f"  -> {resp.status}")

print("\nPlugins installation triggered - waiting 60s...")
time.sleep(20)

# Restart if needed
print("\n=== Safe Restart ===")
api("/safeRestart", "POST")
print("Restarting Jenkins, wait 30s...")
time.sleep(30)

# Check
print("\n=== Verifying ===")
resp = api("/api/json")
if resp:
    d = json.load(resp)
    print(f"  Jobs: {len(d.get('jobs', []))}")
    for j in d.get('jobs', []):
        print(f"  - {j.get('name')} ({j.get('color')})")
