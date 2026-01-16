def runCmd(cmd) {
  if (isUnix()) {
    sh cmd
  } else {
    bat cmd
  }
}

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  triggers {
    pollSCM('H/5 * * * *')
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
          runCmd('npm install')
        }
      }
    }

    stage('Test') {
      steps {
        script {
          runCmd('npm run test')
          runCmd('npm run test-frontend')
          runCmd('npm run coverage')
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
  }
}
