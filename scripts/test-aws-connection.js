// Script para testar a conexão com o DynamoDB
// Execute com: node scripts/test-aws-connection.js

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Obter credenciais das variáveis de ambiente
const REGION = process.env.COGNITO_REGION || 'us-east-1';
const ACCESS_KEY = process.env.ACCESS_KEY_ID_AWS || '';
const SECRET_KEY = process.env.SECRET_ACCESS_KEY_AWS || '';

console.log('=== Teste de Conexão AWS ===');
console.log('Região:', REGION);
console.log('Access Key ID configurado:', !!ACCESS_KEY);
console.log('Secret Access Key configurado:', !!SECRET_KEY);

async function testConnection() {
  try {
    // Configurar o cliente DynamoDB
    const dynamoClient = new DynamoDBClient({
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
      },
    });

    // Configurar o cliente DynamoDB Document
    const dynamodb = DynamoDBDocumentClient.from(dynamoClient);

    console.log('\nTestando conexão com DynamoDB...');
    
    // Testar uma operação simples no DynamoDB
    const command = new ScanCommand({
      TableName: 'Tenants',
      Limit: 1
    });
    
    const response = await dynamodb.send(command);
    
    console.log('\n✅ Conexão com DynamoDB estabelecida com sucesso!');
    console.log(`Items encontrados: ${response.Count}`);
    console.log('Primeiro item:', JSON.stringify(response.Items?.[0], null, 2));
    
    return true;
  } catch (error) {
    console.error('\n❌ Erro ao conectar com DynamoDB:', error.name);
    console.error('Mensagem:', error.message);
    
    if (error.name === 'UnrecognizedClientException') {
      console.error('\nDica: Este erro geralmente ocorre quando as credenciais AWS estão incorretas.');
      console.error('Verifique se as variáveis ACCESS_KEY_ID_AWS e SECRET_ACCESS_KEY_AWS estão configuradas corretamente no arquivo .env.local');
    }
    
    return false;
  }
}

testConnection()
  .then(success => {
    if (!success) {
      console.log('\n=== Sugestões para resolver o problema ===');
      console.log('1. Verifique se as variáveis ACCESS_KEY_ID_AWS e SECRET_ACCESS_KEY_AWS estão definidas no arquivo .env.local');
      console.log('2. Certifique-se de que as credenciais têm permissão para acessar o DynamoDB');
      console.log('3. Verifique se a região configurada (COGNITO_REGION) está correta');
      console.log('4. Reinicie o servidor de desenvolvimento após atualizar o arquivo .env.local');
    }
    process.exit(success ? 0 : 1);
  });
