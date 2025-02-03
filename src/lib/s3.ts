import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.COGNITO_REGION) {
  throw new Error('COGNITO_REGION is not defined');
}

if (!process.env.ACCESS_KEY_ID_AWS) {
  throw new Error('ACCESS_KEY_ID_AWS is not defined');
}

if (!process.env.SECRET_ACCESS_KEY_AWS) {
  throw new Error('SECRET_ACCESS_KEY_AWS is not defined');
}

export const s3Client = new S3Client({
  region: process.env.COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS
  }
});
