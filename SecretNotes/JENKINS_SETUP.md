# Jenkins Setup

## Goal

Run the Secret Notes pipelines on a self-hosted Jenkins instance.

## Requirements

- Jenkins on AWS EC2 or another reachable host
- Docker installed on the Jenkins agent
- Node.js 22 on the agent, or Node tool installation in Jenkins
- Git access to the repository

## Recommended Plugins

- Pipeline
- Git
- GitHub integration
- Docker Pipeline
- Credentials Binding
- SSH Agent

## Job Setup

1. Create a new Pipeline job.
2. Choose Pipeline from SCM.
3. Point it at the GitHub repository.
4. Use the `Jenkinsfile` from the repo root.
5. Store Docker Hub and AWS SSH credentials in Jenkins.

## Required Credentials

- Docker Hub username
- Docker Hub token
- Docker Hub repository name
- AWS EC2 SSH key
- AWS host and user for deploy steps

## Expected Flow

- `main`
  - lint
  - test
  - build
- `deploy/production`
  - lint
  - test
  - build
  - deliver
  - deploy
  - start backend stack with Docker Compose
  - e2e
  - k6 smoke test

## Screenshot Targets

- Pipeline overview with green status
- Stage view showing all stages green
- Console output with `SUCCESS`

## Existing Jobs

- **SecretNotes-Demo-FS**: Demo freestyle job, verified green.
- **SecretNotes-CI**: Real CI freestyle job that runs backend lint/test and frontend lint/test/build. Build #1: SUCCESS.
