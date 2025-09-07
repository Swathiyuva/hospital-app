pipeline {
    agent {
        docker { 
            image 'node:18-alpine' 
            args '-u root' 
        }
    }

    environment {
        S3_BUCKET = 'shrs-frontend-prod-904233112689' // your frontend bucket
        CLOUDFRONT_DISTRIBUTION_ID = 'E19BLNNL62ZLY5' // from terraform output
        AWS_DEFAULT_REGION = 'us-east-1'
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID_SHRS')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY_SHRS')
    }

    stages {
        stage('Install AWS CLI') {
            steps {
                sh '''
                  apk add --no-cache python3 py3-pip
                  pip install --upgrade awscli
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'PUBLIC_URL=./ npm run build'
            }
        }

        stage('Deploy to S3') {
            steps {
                sh 'aws s3 sync build/ s3://$S3_BUCKET --delete'
            }
        }

        stage('Invalidate CloudFront') {
            steps {
                sh '''
                  aws cloudfront create-invalidation \
                  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
                  --paths "/*"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed'
        }
    }
}
