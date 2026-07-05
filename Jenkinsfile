pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    FRONTEND_DIR = 'SecretNotes/secret-notes-frontend'
    BACKEND_DIR = 'SecretNotes/secret-notes-backend'
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
      echo 'Pipeline failed. Notify the team via Slack or email here.'
    }
  }
}
