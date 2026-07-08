#!/bin/bash
echo "Jenkins: $(systemctl is-active jenkins)"
echo "---"
curl -s -u admin:ade5df0e6431411b8330e946fa6b5c9d http://localhost:8080/api/json | python3 -c "
import sys,json
d=json.load(sys.stdin)
jobs=d.get('jobs',[])
print(len(jobs),'jobs')
for j in jobs:
    print(' -',j.get('name'),j.get('color'))
"
echo "---"
curl -s -o /dev/null -w "Plugin Manager: %{http_code}\n" -u admin:ade5df0e6431411b8330e946fa6b5c9d http://localhost:8080/pluginManager/
