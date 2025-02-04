import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// Verificar variáveis de ambiente necessárias
if (!process.env.COGNITO_REGION) {
  throw new Error('COGNITO_REGION is not defined');
}

if (!process.env.ACCESS_KEY_ID_AWS) {
  throw new Error('ACCESS_KEY_ID_AWS is not defined');
}

if (!process.env.SECRET_ACCESS_KEY_AWS) {
  throw new Error('SECRET_ACCESS_KEY_AWS is not defined');
}

const awsConfig = {
  region: process.env.COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS
  }
};

const dynamoClient = new DynamoDBClient(awsConfig);
export const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
export const s3 = new S3Client(awsConfig);
