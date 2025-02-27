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

// Inicializar as variáveis fora do bloco try/catch
let dynamodb: DynamoDBDocumentClient;
let s3: S3Client;

try {
  // Configuração para ambiente serverless
  const awsConfig = {
    region: process.env.COGNITO_REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID_AWS || "",
      secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS || ""
    }
  };

  console.log('Inicializando cliente DynamoDB...');
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
  dynamodb = DynamoDBDocumentClient.from(dynamoClient);
  console.log('Cliente DynamoDB inicializado com sucesso');

  console.log('Inicializando cliente S3...');
  s3 = new S3Client({
    ...awsConfig,
    // Configurações específicas para S3 em ambiente serverless
    requestHandler: {
      abortController: {
        timeoutInMs: 10000, // 10 segundos de timeout para S3
      },
    },
  });
  console.log('Cliente S3 inicializado com sucesso');
} catch (error: unknown) {
  console.error('Erro ao inicializar clientes AWS:', error);
  
  // Tratamento seguro para o erro com verificação de tipo
  const errorDetails: Record<string, unknown> = {};
  
  if (error && typeof error === 'object') {
    if ('name' in error && error.name) {
      errorDetails.name = error.name;
    }
    
    if ('message' in error && error.message) {
      errorDetails.message = error.message;
    }
    
    if ('code' in error && error.code) {
      errorDetails.code = error.code;
    }
    
    if ('$metadata' in error) {
      errorDetails.$metadata = error.$metadata;
    }
  }
  
  console.error('Detalhes do erro AWS:', errorDetails);
  throw error; // Re-throw para garantir que a aplicação falhe se os clientes não puderem ser inicializados
}

// Exportar os clientes fora do bloco try/catch
export { dynamodb, s3 };
