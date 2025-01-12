import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from './aws-config';
import crypto from 'crypto';

export async function createTenantAndUser(cognitoId: string, email: string, name: string) {
  const timestamp = new Date().toISOString();
  const tenantId = crypto.randomUUID();

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
    // Buscar usuário por email usando scan com filtro
    const command = new ScanCommand({
      TableName: 'Users',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    });

    const result = await dynamodb.send(command);
    
    // Retorna o primeiro usuário encontrado com este email
    return result.Items?.[0];
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}
