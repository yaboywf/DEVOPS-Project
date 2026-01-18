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
    IMAGE_NAME = 'chess-club-ranking-system'
    IMAGE_TAG  = "${BUILD_NUMBER}"
    LOCAL_PORT = '30080'
    SVC_PORT   = '5050'
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
          runCmd('npm run lint')
          runCmd('npm run test-html-css')
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          runCmd("docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .")
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
          runCmd("minikube image load ${IMAGE_NAME}:${IMAGE_TAG}")
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          runCmd('kubectl apply -f deployment.yaml')
          runCmd("kubectl set image deployment/${IMAGE_NAME} ${IMAGE_NAME}=${IMAGE_NAME}:${IMAGE_TAG}")
          runCmd('kubectl apply -f service.yaml')
        }
      }
    }

    stage('Wait for Pod Ready') {
      steps {
        script {
          runCmd("kubectl rollout status deployment/${IMAGE_NAME}")
        }
      }
    }

    stage('Smoke Test') {
      steps {
        script {
          if (isUnix()) {
            sh """
              kubectl port-forward svc/${IMAGE_NAME} ${LOCAL_PORT}:${SVC_PORT} &
              PF_PID=\$!
              sleep 5
              curl -f http://127.0.0.1:${LOCAL_PORT}
              kill \$PF_PID
            """
          } else {
            bat """
              start /B kubectl port-forward svc/${IMAGE_NAME} ${LOCAL_PORT}:${SVC_PORT}
              timeout /t 5 > NUL
              powershell -Command "Invoke-WebRequest http://127.0.0.1:${LOCAL_PORT} -UseBasicParsing"
              taskkill /IM kubectl.exe /F
            """
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'coverage/**', fingerprint: true
    }

    success {
      echo '✅ Pipeline completed successfully'
    }

    failure {
      echo '❌ Pipeline failed'
    }
  }
}
