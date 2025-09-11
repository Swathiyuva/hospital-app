// src/aws-config.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

export const REGION = "us-east-1"; // your AWS region

// Pull credentials from environment variables
const credentials = {
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
};

// DynamoDB Client
export const ddbClient = new DynamoDBClient({
  region: REGION,
  credentials,
});

// S3 Client
export const s3Client = new S3Client({
  region: REGION,
  credentials,
});
