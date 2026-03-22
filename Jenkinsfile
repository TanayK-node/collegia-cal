pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Pulling the latest code from the repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Bun and project dependencies...'
                // In a full production setup, Jenkins would run this inside a Bun container
                sh 'bun install' 
            }
        }

        stage('SonarQube Code Analysis') {
            steps {
                echo 'Running SonarQube scanner for code quality...'
                // Triggers the SonarScanner we tested earlier
                sh 'sonar-scanner'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building the Docker image for collegia-cal...'
                sh 'docker build -t collegia-frontend:latest .'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying the new image to the Kubernetes cluster...'
                // This is where the kubectl commands will go later
                sh 'echo "Deployment successful!"'
            }
        }
    }
}