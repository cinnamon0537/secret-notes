# AWS Deployment

## Current Lab State

- AWS CLI access in WSL is verified.
- Default VPC exists.
- Default security group exists.
- No EC2 instances yet.
- No RDS instances yet.

## Planned Setup

- EC2: host the Docker Compose stack.
- RDS: PostgreSQL for encrypted notes.
- Security Groups: allow only required traffic.
- Route/Load Balancer: switch between blue and green deployments.

## Blue/Green Approach

- Blue = currently active app stack.
- Green = new release stack.
- Deploy green first.
- Run health, E2E, and k6 checks.
- Switch traffic only if checks pass.

## Open Items

- Create EC2 instance.
- Create RDS instance.
- Document security groups and network flow.
- Capture screenshots after the real AWS setup exists.
