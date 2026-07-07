# AWS Deployment

## Current Lab State

- AWS CLI access in WSL is verified.
- Default VPC exists.
- EC2 instance is running.
- RDS PostgreSQL instance is running.
- EC2 security group: `sg-07f26ce88bda22016`
- RDS security group: `sg-0d39905a6a6ca5d83`
- EC2 can reach RDS on port 5432 through the SG-to-SG rule.

## Planned Setup

- EC2: hosts the Docker Compose stack.
- RDS: PostgreSQL for encrypted notes.
- Security Groups: allow only required traffic.
- Route/Load Balancer: switch between blue and green deployments.

## Blue/Green Approach

- Blue = currently active app stack (ports 80/3000).
- Green = new release stack (ports 8080/3001).
- Both stacks share the same PostgreSQL (or RDS) instance.
- Deploy green first.
- Run health, E2E, and k6 checks.
- Switch traffic only if checks pass.
- Script: `scripts/blue-green-switch.sh`

### Production-grade Setup

- **Nginx Reverse Proxy**: `nginx/nginx.conf` routes all traffic through a single entrypoint (port 80). Upstream blocks define which stack (blue/green) receives requests.
- **Docker Hub Images**: `docker-compose.prod.yml` uses pre-built images from Docker Hub (`cinnamon0/secret-notes:backend-latest`, `:frontend-latest`) instead of local builds.
- **Health Checks**: All services have Docker health checks. The switch script waits for the new stack to be healthy before routing traffic.
- **Automated Switch**: `scripts/blue-green-switch.sh` handles:
  1. Pull latest images from Docker Hub
  2. Start the inactive stack
  3. Health check the new stack
  4. Update nginx upstream config and reload
  5. Verify traffic is routed correctly
  6. Stop the old stack
  7. On failure: automatic rollback to the previous stack
- **Rollback**: `scripts/blue-green-switch.sh rollback` switches back to the previously active stack.
- **State Tracking**: Current active color is persisted in `.blue-green-state`.

### Switch Verification

To verify the traffic switch:
```bash
# Check current state
./scripts/blue-green-switch.sh status

# Switch to green
./scripts/blue-green-switch.sh green

# Verify through the proxy
curl http://localhost:80/api/health
curl http://localhost:80/

# Rollback if needed
./scripts/blue-green-switch.sh rollback
```

## Open Items

- Document the final security groups and network flow.
- Capture screenshots after the real AWS setup exists.
