pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        S3_BUCKET = 'your-s3-bucket'
        CLOUDFRONT_DIST_ID = 'your-cloudfront-dist-id'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Swathiyuva/hospital-app.git'
            }
        }

        stage('Install & Build') {
            steps {
                sh '''
                    # Use correct npm registry to avoid ECONNRESET
                    npm config set registry https://registry.npmjs.org/

                    # Clean npm cache
                    npm cache clean --force

                    # Install with legacy peer deps (fixes dependency errors)
                    npm install --legacy-peer-deps

                    # Build project
                    npm run build
                '''
            }
        }

        stage('Deploy to S3') {
            steps {
                sh '''
                    aws s3 sync build/ s3://$S3_BUCKET --delete
                '''
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                sh '''
                    aws cloudfront create-invalidation \
                        --distribution-id $CLOUDFRONT_DIST_ID \
                        --paths "/*"
                '''
            }
        }
    }
}
