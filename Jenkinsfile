def runCmd(cmd) {
  if (isUnix()) {
    sh cmd
  } else {
    bat cmd
  }
}

def IMAGE

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  triggers {
    pollSCM('H/5 * * * *')
  }

  environment {
    NAME = 'chess-club-ranking'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        script {
          runCmd('npm ci')
        }
      }
    }

    stage('Test') {
      steps {
        script {
          runCmd('npm run test')
          runCmd('npm run test-frontend')
          runCmd('npm run test-frontend:coverage')
        }
      }
    }

    stage('Code Quality') {
      steps {
        script {
          runCmd('npm run test-html-css')
          runCmd('npm run lint')
        }
      }
    }

    stage('Prepare Image Tag') {
      steps {
        script {
          IMAGE = "${env.NAME}:${env.BUILD_NUMBER}"
        }
      }
    }

    stage('Initialize and Build Docker Image') {
      steps {
        script {
          runCmd("docker build -t ${IMAGE} .")
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'coverage/**', fingerprint: true
    }
  }
}
