pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = "us-east-1"   // Change if your S3 bucket is in another region
        S3_BUCKET = "shrs-health-reports"  // Replace with your bucket name
        CLOUDFRONT_ID = "E19BLNNL62ZLY5 // Replace with your CloudFront ID
    }

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
                sh '''
                    aws s3 sync build/ s3://$S3_BUCKET/ --delete
                '''
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                sh '''
                    aws cloudfront create-invalidation \
                        --distribution-id $CLOUDFRONT_ID \
                        --paths "/*"
                '''
            }
        }
    }
}
