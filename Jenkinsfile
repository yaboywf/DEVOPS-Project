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
          runCmd('npm test')
          runCmd('npm run test-frontend')
          runCmd('npm run test-frontend:coverage')
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
      echo "✅ Build SUCCESS after ${currentBuild.durationString}"

      emailext(
        to: 'dylanyeowf@gmail.com',
        subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        mimeType: 'text/html',
        body: """
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Build Success</title>
          </head>
          <body style="margin:0;padding:0;background:#0b1020;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1020;padding:30px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#141a33;border-radius:14px; border:1px solid #2ee59d;font-family:Arial,sans-serif;color:#ffffff;">
                    <tr>
                      <td style="padding:24px;">
                        <h2 style="margin:0 0 10px;color:#2ee59d;">Build Successful</h2>

                        <p style="margin:0 0 16px;color:#d1d5ff;font-size:14px;">The Jenkins build has completed successfully.</p>

                        <table width="100%" cellpadding="6" cellspacing="0" style="font-size:13px;color:#e5e7ff;">
                          <tr>
                            <td width="140">Job Name</td>
                            <td>${JOB_NAME}</td>
                          </tr>
                          <tr>
                            <td>Build Number</td>
                            <td>#${BUILD_NUMBER}</td>
                          </tr>
                          <tr>
                            <td>Status</td>
                            <td style="color:#2ee59d;font-weight:bold;">SUCCESS</td>
                          </tr>
                          <tr>
                            <td>Duration</td>
                            <td>${currentBuild.durationString}</td>
                          </tr>
                          <tr>
                            <td>Build URL</td>
                            <td>
                              <a href="${BUILD_URL}" style="color:#8b5cf6;text-decoration:none;">View Build</a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:20px 0 0;font-size:12px;color:#a5b4fc;">Jenkins • ${JENKINS_URL} </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        """
      )
    }

    failure {
      echo '❌ Pipeline failed'

      emailext(
        to: 'dylanyeowf@gmail.com',
        subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        mimeType: 'text/html',
        attachLog: true,
        compressLog: true,
        attachmentsPattern: '',
        body: """
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Build Failed</title>
          </head>
          <body style="margin:0;padding:0;background:#0b1020;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1020;padding:30px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#141a33;border-radius:14px; border:1px solid #ff4d6d;font-family:Arial,sans-serif;color:#ffffff;">
                    <tr>
                      <td style="padding:24px;">
                        <h2 style="margin:0 0 10px;color:#ff4d6d;">Build Failed</h2>

                        <p style="margin:0 0 16px;color:#fca5a5;font-size:14px;">The Jenkins build has failed. Please review the details below.</p>

                        <table width="100%" cellpadding="6" cellspacing="0" style="font-size:13px;color:#e5e7ff;">
                          <tr>
                            <td width="140">Job Name</td>
                            <td>${JOB_NAME}</td>
                          </tr>
                          <tr>
                            <td>Build Number</td>
                            <td>#${BUILD_NUMBER}</td>
                          </tr>
                          <tr>
                            <td>Status</td>
                            <td style="color:#ff4d6d;font-weight:bold;">FAILED</td>
                          </tr>
                          <tr>
                            <td>Duration</td>
                            <td>${currentBuild.durationString}</td>
                          </tr>
                          <tr>
                            <td>Failure Cause</td>
                            <td style="color:#fecaca;">Refer to attached log</td>
                          </tr>
                          <tr>
                            <td>Build URL</td>
                            <td>
                              <a href="${BUILD_URL}" style="color:#8b5cf6;text-decoration:none;">View Console Log</a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:20px 0 0;font-size:12px;color:#a5b4fc;">Jenkins • ${JENKINS_URL}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        """
      )
    }
  }
}
