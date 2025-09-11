pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Swathiyuva/hospital-app.git'
            }
        }

        stage('Install & Build') {
            steps {
                sh '''
                  npm config set registry https://registry.npmjs.org/
                  npm cache clean --force
                  npm install --legacy-peer-deps
                  npm run build
                '''
            }
        }

        stage('Deploy to S3') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                  credentialsId: 'aws-ci-user']]) {
                    sh 'aws s3 sync build/ s3://shrs-health-reports/ --delete --region us-east-1'
                }
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                echo 'CloudFront invalidation step goes here'
            }
        }
    }
}
