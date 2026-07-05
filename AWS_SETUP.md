# AWS Setup Notes

Stand: 2026-07-05

## Current Lab State

- AWS CLI access in WSL works.
- Region: `us-west-2`
- Default VPC exists: `vpc-0ff5f24acaa767305`
- Default security group exists: `sg-08a816193194bd9cb`
- No EC2 instances found yet.
- No RDS instances found yet.

## Next Steps

1. Create or choose an EC2 instance for the app.
2. Create an RDS PostgreSQL instance for notes.
3. Set up security groups for app, DB, and SSH access.
4. Prepare a blue/green deployment approach behind a load balancer or compose swap.
