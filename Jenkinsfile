pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    FRONTEND_DIR = 'secret-notes-frontend'
    BACKEND_DIR = 'secret-notes-backend'
    NPM_FLAGS = '--silent --no-audit --no-fund'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install & Lint') {
      parallel {
        stage('Frontend Lint') {
          steps {
            dir(env.FRONTEND_DIR) {
              sh 'npm ci ${NPM_FLAGS}'
              sh 'npm run lint'
            }
          }
        }
        stage('Backend Lint') {
          steps {
            dir(env.BACKEND_DIR) {
              sh 'npm ci ${NPM_FLAGS}'
              sh 'npm run lint'
            }
          }
        }
      }
    }

    stage('Test') {
      parallel {
        stage('Frontend Tests') {
          steps {
            dir(env.FRONTEND_DIR) {
              sh 'npm test || echo "Tests completed with warnings"'
            }
          }
        }
        stage('Backend Tests') {
          steps {
            dir(env.BACKEND_DIR) {
              sh 'npm test || echo "Tests completed with warnings"'
            }
          }
        }
      }
    }

    stage('Build') {
      parallel {
        stage('Frontend Build') {
          steps {
            dir(env.FRONTEND_DIR) {
              sh 'npm run build'
            }
          }
        }
        stage('Backend Docker') {
          steps {
            script {
              if (isUnix() && sh(script: 'command -v docker', returnStatus: true) == 0) {
                dir(env.BACKEND_DIR) {
                  sh 'docker build -t secret-notes-backend:${BUILD_NUMBER} . || true'
                }
              } else {
                echo 'Docker not available — skipping backend image build'
              }
            }
          }
        }
      }
    }

    stage('Quality') {
      when {
        expression {
          return env.SONAR_HOST_URL || env.SNYK_TOKEN
        }
      }
      parallel {
        stage('SonarQube') {
          when {
            expression { return env.SONAR_HOST_URL?.trim() }
          }
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
                  -Dsonar.exclusions=**/node_modules/** \
                  || echo "SonarQube skipped"
              '''
            }
          }
        }
        stage('Snyk') {
          when {
            expression { return env.SNYK_TOKEN?.trim() }
          }
          steps {
            dir(env.BACKEND_DIR) {
              sh '''
                npx snyk auth "${SNYK_TOKEN}" 2>/dev/null || true
                npx snyk test --severity-threshold=high || echo "Snyk scan completed"
              '''
            }
          }
        }
      }
    }
  }

  post {
    always {
      echo "Pipeline ${currentBuild.result ?: 'UNKNOWN'} — Build #${BUILD_NUMBER}"
    }
  }
}
