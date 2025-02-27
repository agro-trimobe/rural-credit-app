import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from './aws-config';
import crypto from 'crypto';
import { validateAsaasConfig } from './asaas-config';

export async function createTenantAndUser(cognitoId: string, email: string, name: string) {
  const timestamp = new Date().toISOString();
  const tenantId = crypto.randomUUID();
  const trialEndsAt = new Date();
  const config = validateAsaasConfig();
  trialEndsAt.setDate(trialEndsAt.getDate() + config.TRIAL_PERIOD_DAYS);

  try {
    // 1. Criar o Tenant
    const tenantCommand = new PutCommand({
      TableName: 'Tenants',
      Item: {
        PK: `TENANT#${tenantId}`,
        SK: 'METADATA#1',
        id: tenantId,
        name: `${name}'s Organization`, // Nome padrão inicial
        document: '', // Será preenchido posteriormente
        plan: 'FREE', // Plano inicial
        status: 'ACTIVE',
        settings: {
          maxUsers: 5,
          maxStorage: 1024 * 1024 * 1024, // 1GB
          features: ['basic']
        },
        createdAt: timestamp,
        updatedAt: timestamp
      }
    });

    await dynamodb.send(tenantCommand);

    // 2. Criar o User
    const userCommand = new PutCommand({
      TableName: 'Users',
      Item: {
        PK: `TENANT#${tenantId}`,
        SK: `USER#${cognitoId}`,
        tenantId: tenantId,
        cognitoId: cognitoId,
        email: email,
        name: name,
        role: 'ADMIN', // Primeiro usuário é sempre admin
        status: 'ACTIVE',
        subscription: {
          createdAt: timestamp,
          trialEndsAt: trialEndsAt.toISOString(),
          status: 'TRIAL'
        },
        createdAt: timestamp,
        updatedAt: timestamp,
        // GSI1 (busca global por Cognito ID)
        GSI1PK: `USER#${cognitoId}`,
        GSI1SK: `TENANT#${tenantId}`,
        // GSI2 (busca por email dentro do tenant)
        GSI2PK: `TENANT#${tenantId}#EMAIL#${email}`,
        GSI2SK: `USER#${cognitoId}`
      }
    });

    await dynamodb.send(userCommand);

    return { tenantId, cognitoId };
  } catch (error) {
    console.error('Erro ao criar tenant e usuário:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    console.log('Buscando usuário no DynamoDB pelo email:', email);
    
    const command = new ScanCommand({
      TableName: 'Users',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    });

    const response = await dynamodb.send(command);
    
    if (response.Items && response.Items.length > 0) {
      console.log('Usuário encontrado no DynamoDB:', response.Items[0].id);
      return response.Items[0];
    }
    
    console.log('Usuário não encontrado no DynamoDB para o email:', email);
    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw error;
  }
}
