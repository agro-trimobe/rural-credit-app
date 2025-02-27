import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// Verificar variáveis de ambiente necessárias
if (!process.env.COGNITO_REGION) {
  console.error('COGNITO_REGION não está definido');
  throw new Error('COGNITO_REGION is not defined');
}

if (!process.env.ACCESS_KEY_ID_AWS) {
  console.error('ACCESS_KEY_ID_AWS não está definido');
  throw new Error('ACCESS_KEY_ID_AWS is not defined');
}

if (!process.env.SECRET_ACCESS_KEY_AWS) {
  console.error('SECRET_ACCESS_KEY_AWS não está definido');
  throw new Error('SECRET_ACCESS_KEY_AWS is not defined');
}

// Adicionar logs para depuração
console.log('Configuração AWS inicializada:');
console.log('Região:', process.env.COGNITO_REGION);
console.log('Access Key ID:', process.env.ACCESS_KEY_ID_AWS ? 'Configurado' : 'Não configurado');
console.log('Secret Access Key:', process.env.SECRET_ACCESS_KEY_AWS ? 'Configurado' : 'Não configurado');

// Configuração para ambiente serverless
const awsConfig = {
  region: process.env.COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS || "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS || ""
  },
  // Adicionar configurações para melhorar desempenho em ambiente serverless
  maxAttempts: 3,
  retryMode: "standard"
};

// Inicializar clientes com configuração otimizada
const dynamoClient = new DynamoDBClient({
  ...awsConfig,
  // Configurações específicas para DynamoDB em ambiente serverless
  requestHandler: {
    abortController: {
      timeoutInMs: 5000, // 5 segundos de timeout
    },
  },
});
export const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
export const s3 = new S3Client({
  ...awsConfig,
  // Configurações específicas para S3 em ambiente serverless
  requestHandler: {
    abortController: {
      timeoutInMs: 10000, // 10 segundos de timeout para S3
    },
  },
});
