pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Pulling the latest code from the repository...'
                checkout scm
            }
        }

        stage('SonarQube Code Analysis') {
            steps {
                echo 'Downloading SonarScanner...'
                sh '''
                    curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
                    unzip -q -o sonar-scanner.zip
                    
                    echo "Running Analysis..."
                    ./sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner -Dsonar.host.url=http://host.docker.internal:9000 -Dsonar.login=sqa_fc181baef1e9e953a34cb5a4948aaa459e2f8915
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building the Docker image for collegia-cal...'
                // Jenkins will now pass this command to your Windows Docker Engine!
                sh 'docker build -t collegia-frontend:latest .'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying the new image to the Kubernetes cluster...'
                sh 'kubectl --kubeconfig=/var/jenkins_home/.kube/config --insecure-skip-tls-verify apply -f k8s/'
                
                echo 'Checking deployment status...'
                sh 'kubectl --kubeconfig=/var/jenkins_home/.kube/config --insecure-skip-tls-verify rollout status deployment/collegia-frontend-deployment'
            }
        }
    }
}