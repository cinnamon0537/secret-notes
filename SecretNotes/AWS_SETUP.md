# AWS Setup Notes

Stand: 2026-07-05

## Current Lab State

- AWS CLI access in WSL works.
- Region: `us-west-2`
- Default VPC exists: `vpc-0ff5f24acaa767305`
- Default security group exists: `sg-08a816193194bd9cb`
 - EC2 instance is running: `i-091ccbfc8f4dbd015`
 - EC2 public IP: `52.26.121.3`
- EC2 security group: `sg-07f26ce88bda22016`
- RDS PostgreSQL instance is running: `secret-notes-db`
- RDS endpoint: `secret-notes-db.czah9i5vgwj0.us-west-2.rds.amazonaws.com`
- RDS security group: `sg-0d39905a6a6ca5d83`

## Next Steps

1. Document the final EC2/RDS network flow.
2. Prepare a blue/green deployment approach behind a load balancer or compose swap.
3. Capture screenshots for the live AWS resources.
