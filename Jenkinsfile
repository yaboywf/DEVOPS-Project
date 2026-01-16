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
        echo '✅ Checkout stage done'
      }
    }

    stage('Install') {
      steps {
        sh 'npm i'
        echo '✅ Install stage done'
      }
    }

    stage('Test') {
      steps {
        sh '''
          set -x
          npm test
          npm run test-frontend
          npm run coverage
          echo '✅ Test stage done'
        '''
      }
    }

    stage('Code Quality') {
      steps {
        sh '''
          set -x
          npm run test-html-css
          npm run lint
        '''
        echo '✅ Code Quality stage done'
      }
    }
  }
}
