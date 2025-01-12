import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

const awsConfig = {
  region: process.env.COGNITO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!
  }
};

const dynamoClient = new DynamoDBClient(awsConfig);
export const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
export const s3 = new S3Client(awsConfig);
