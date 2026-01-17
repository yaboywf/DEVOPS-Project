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

  environment {
    NAME = 'chess-club-ranking-system'
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
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          env.IMAGE = "${env.NAME}:${env.BUILD_NUMBER}"
          runCmd("docker build -t ${env.IMAGE} .")
        }
      }
    }

    stage('Start Minikube') {
      steps {
        script {
          runCmd('minikube start --ports=127.0.0.1:30080:30080')
          runCmd('kubectl config use-context minikube')
        }
      }
    }

    stage('Load Image into Minikube') {
      steps {
        script {
          runCmd("minikube image load ${env.IMAGE}")
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          runCmd('kubectl apply -f deployment.yaml')
          runCmd("kubectl set image deployment/${env.NAME} app=${env.IMAGE}")
          runCmd('kubectl apply -f service.yaml')
        }
      }
    }

    stage('Verify Deployment') {
      steps {
        script {
          runCmd('kubectl get pods')
          runCmd('kubectl get services')
        }
      }
    }

    stage('Smoke Test') {
      steps {
        script {
          runCmd("kubectl get svc ${env.NAME}")
          runCmd("kubectl get endpoints ${env.NAME}")
          runCmd("powershell -Command \"Invoke-WebRequest http://127.0.0.1:30080 -UseBasicParsing\"")
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline completed.'
      archiveArtifacts artifacts: 'coverage/**', fingerprint: true
    }
  }
}
