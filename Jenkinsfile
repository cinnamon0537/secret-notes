pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    FRONTEND_DIR = 'secret-notes-frontend'
    BACKEND_DIR = 'secret-notes-backend'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Lint') {
      parallel {
        stage('Frontend lint') {
          steps {
            dir(env.FRONTEND_DIR) {
              sh 'npm ci'
              sh 'npm run lint'
            }
          }
        }
        stage('Backend lint') {
          steps {
            dir(env.BACKEND_DIR) {
              sh 'npm ci'
              sh 'npm run lint'
            }
          }
        }
      }
    }

    stage('Test') {
      parallel {
        stage('Frontend test') {
          steps {
            dir(env.FRONTEND_DIR) {
              sh 'npm test'
            }
          }
        }
        stage('Backend test') {
          steps {
            dir(env.BACKEND_DIR) {
              sh 'npm test'
            }
          }
        }
      }
    }

    stage('SonarQube') {
      environment {
        SONAR_HOST_URL = credentials('sonar-host-url')
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_BACKEND_PROJECT_KEY = credentials('sonar-backend-project-key')
        SONAR_FRONTEND_PROJECT_KEY = credentials('sonar-frontend-project-key')
      }
      when {
        expression { return env.SONAR_HOST_URL && env.SONAR_HOST_URL.trim() != '' }
      }
      parallel {
        stage('Backend SonarQube') {
          steps {
            dir(env.BACKEND_DIR) {
              sh '''
                sonar-scanner \
                  -Dsonar.host.url="${SONAR_HOST_URL}" \
                  -Dsonar.token="${SONAR_TOKEN}" \
                  -Dsonar.projectKey="${SONAR_BACKEND_PROJECT_KEY}" \
                  -Dsonar.projectName=secret-notes-backend \
                  -Dsonar.sources=src \
                  -Dsonar.tests=tests \
                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                  -Dsonar.exclusions=**/node_modules/**
              '''
            }
          }
        }
        stage('Frontend SonarQube') {
          steps {
            dir(env.FRONTEND_DIR) {
              sh '''
                sonar-scanner \
                  -Dsonar.host.url="${SONAR_HOST_URL}" \
                  -Dsonar.token="${SONAR_TOKEN}" \
                  -Dsonar.projectKey="${SONAR_FRONTEND_PROJECT_KEY}" \
                  -Dsonar.projectName=secret-notes-frontend \
                  -Dsonar.sources=src \
                  -Dsonar.tests=tests,e2e \
                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                  -Dsonar.exclusions=**/node_modules/**
              '''
            }
          }
        }
      }
    }

    stage('Snyk') {
      environment {
        SNYK_TOKEN = credentials('snyk-token')
      }
      when {
        expression { return env.SNYK_TOKEN && env.SNYK_TOKEN.trim() != '' }
      }
      parallel {
        stage('Backend Snyk') {
          steps {
            dir(env.BACKEND_DIR) {
              sh '''
                npx snyk auth "${SNYK_TOKEN}"
                npx snyk test --severity-threshold=high
              '''
            }
          }
        }
        stage('Frontend Snyk') {
          steps {
            dir(env.FRONTEND_DIR) {
              sh '''
                npx snyk auth "${SNYK_TOKEN}"
                npx snyk test --severity-threshold=high
              '''
            }
          }
        }
      }
    }

    stage('Build') {
      parallel {
        stage('Frontend build') {
          steps {
            dir(env.FRONTEND_DIR) {
              sh 'npm run build'
            }
          }
        }
        stage('Backend image') {
          steps {
            script {
              if (sh(script: 'command -v docker', returnStatus: true) == 0) {
                dir(env.BACKEND_DIR) {
                  sh 'docker build -t secret-notes-backend:${BUILD_NUMBER} .'
                }
              } else {
                echo 'Docker not available on this Jenkins node, skipping backend image build for the demo run.'
              }
            }
          }
        }
      }
    }

    stage('Deliver') {
      when {
        branch 'deploy/production'
      }
      steps {
        echo 'Push Docker images to Docker Hub here using Jenkins credentials.'
      }
    }

    stage('Deploy') {
      when {
        branch 'deploy/production'
      }
      steps {
        echo 'Deploy blue/green on AWS EC2 here using SSH credentials.'
      }
    }

    stage('E2E and Performance') {
      when {
        branch 'deploy/production'
      }
      steps {
        dir(env.BACKEND_DIR) {
          sh 'docker compose up -d postgres backend'
        }
        dir(env.FRONTEND_DIR) {
          sh 'npm run e2e'
        }
        sh 'docker run --rm -i grafana/k6 run - < k6/backend-loadtest.js'
      }
      post {
        always {
          dir(env.BACKEND_DIR) {
            sh 'docker compose down -v'
          }
        }
      }
    }
  }

  post {
    failure {
      script {
        def subject = "Jenkins ${env.JOB_NAME} #${env.BUILD_NUMBER} FAILED"
        def body = """Build: ${env.BUILD_URL}
Branch: ${env.BRANCH_NAME}
Commit: ${env.GIT_COMMIT ?: 'unknown'}

Stage failures — check the console output at ${env.BUILD_URL}console"""

        if (env.SLACK_WEBHOOK_URL) {
          slackSend(
            channel: env.SLACK_CHANNEL ?: '#ci-cd',
            color: 'danger',
            message: "*${subject}*\n${body}",
            tokenCredentialId: env.SLACK_CREDENTIAL_ID ?: 'slack-token'
          )
        } else {
          echo 'SLACK_WEBHOOK_URL not set — skipping Slack notification.'
        }

        if (env.NOTIFICATION_EMAIL) {
          emailext(
            subject: subject,
            body: body,
            to: env.NOTIFICATION_EMAIL
          )
        } else {
          echo 'NOTIFICATION_EMAIL not set — skipping email notification.'
        }
      }
    }
    success {
      script {
        if (env.SLACK_WEBHOOK_URL && env.BRANCH_NAME == 'deploy/production') {
          slackSend(
            channel: env.SLACK_CHANNEL ?: '#ci-cd',
            color: 'good',
            message: "Jenkins ${env.JOB_NAME} #${env.BUILD_NUMBER} SUCCESS — ${env.BUILD_URL}",
            tokenCredentialId: env.SLACK_CREDENTIAL_ID ?: 'slack-token'
          )
        }
      }
    }
  }
}
