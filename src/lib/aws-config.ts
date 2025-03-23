import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// Usar variáveis de ambiente com prefixo NEXT_PUBLIC_ e fornecer valores padrão
const REGION = process.env.NEXT_PUBLIC_COGNITO_REGION || process.env.COGNITO_REGION || 'us-east-1';
const ACCESS_KEY = process.env.NEXT_PUBLIC_ACCESS_KEY_ID_AWS || process.env.ACCESS_KEY_ID_AWS || '';
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY_AWS || process.env.SECRET_ACCESS_KEY_AWS || '';

// Verificar se as credenciais estão configuradas
if (!ACCESS_KEY || !SECRET_KEY) {
  console.warn(' Credenciais AWS não configuradas. Configure as variáveis de ambiente ACCESS_KEY_ID_AWS e SECRET_ACCESS_KEY_AWS.');
}

// Adicionar logs para depuração
console.log('Configuração AWS inicializada:');
console.log('Região:', REGION);
console.log('Access Key ID:', ACCESS_KEY ? 'Configurado' : 'Não configurado');
console.log('Secret Access Key:', SECRET_KEY ? 'Configurado' : 'Não configurado');

// Inicializar as variáveis fora do bloco try/catch
let dynamodb: DynamoDBDocumentClient;
let s3: S3Client;

try {
  // Configurar o cliente DynamoDB
  const dynamoClient = new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
    // Configurações específicas para DynamoDB em ambiente serverless
    requestHandler: {
      abortController: {
        timeoutInMs: 5000, // 5 segundos de timeout
      },
    },
  });

  // Configurar o cliente DynamoDB Document
  dynamodb = DynamoDBDocumentClient.from(dynamoClient);

  // Configurar o cliente S3
  s3 = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
    // Configurações específicas para S3 em ambiente serverless
    requestHandler: {
      abortController: {
        timeoutInMs: 10000, // 10 segundos de timeout para S3
      },
    },
  });

  console.log('Clientes AWS inicializados com sucesso');
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

export { dynamodb, s3 };
