import { UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from './aws-config';

export type SubscriptionStatus = 'active' | 'overdue' | 'canceled' | 'trial';

export async function updateUserSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus,
  expiresAt?: string
) {
  try {
    // Buscar usuário pelo ID da assinatura usando QueryCommand
    const result = await dynamodb.send(new QueryCommand({
      TableName: 'Users',
      IndexName: 'AsaasSubscriptionId-index',
      KeyConditionExpression: 'asaasSubscriptionId = :subscriptionId',
      ExpressionAttributeValues: {
        ':subscriptionId': subscriptionId,
      },
      Limit: 1,
    }));

    const user = result.Items?.[0];
    if (!user) {
      throw new Error(`Usuário não encontrado para a assinatura ${subscriptionId}`);
    }

    // Atualizar status da assinatura
    await dynamodb.send(new UpdateCommand({
      TableName: 'Users',
      Key: {
        PK: `TENANT#${user.tenantId}`,
        SK: `USER#${user.cognitoId}`,
      },
      UpdateExpression: 'SET subscription.status = :status, subscription.updatedAt = :updatedAt, subscription.expiresAt = :expiresAt',
      ExpressionAttributeValues: {
        ':status': status.toUpperCase(),
        ':updatedAt': new Date().toISOString(),
        ':expiresAt': expiresAt || null,
      },
    }));

    console.log(`Status da assinatura atualizado para ${status} (Tenant: ${user.tenantId}, CognitoId: ${user.cognitoId})`);
  } catch (error) {
    console.error('Erro ao atualizar status da assinatura:', error);
    throw error;
  }
}

export async function checkSubscriptionAccess(tenantId: string, cognitoId: string): Promise<{
  hasAccess: boolean;
  message?: string;
}> {
  try {
    console.log('Verificando acesso para tenant:', tenantId, 'cognitoId:', cognitoId);

    const result = await dynamodb.send(new QueryCommand({
      TableName: 'Users',
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${tenantId}`,
        ':sk': `USER#${cognitoId}`,
      },
    }));

    console.log('Resultado da query:', JSON.stringify(result, null, 2));

    const user = result.Items?.[0];
    console.log('Dados do usuário encontrados:', user);

    if (!user?.subscription) {
      return {
        hasAccess: false,
        message: 'Você ainda não possui uma assinatura ativa. Por favor, assine para continuar.',
      };
    }

    const { status, subscriptionEndsAt } = user.subscription;
    console.log('Status da assinatura:', status);

    switch (status?.toLowerCase()) {
      case 'active':
        return { hasAccess: true };

      case 'trial':
        const trialExpiration = new Date(subscriptionEndsAt);
        if (trialExpiration > new Date()) {
          return { hasAccess: true };
        }
        return {
          hasAccess: false,
          message: 'Seu período de teste expirou. Por favor, assine para continuar.',
        };

      case 'overdue':
        return {
          hasAccess: false,
          message: 'Sua assinatura está com pagamento pendente. Por favor, regularize para continuar.',
        };

      case 'canceled':
        return {
          hasAccess: false,
          message: 'Sua assinatura foi cancelada. Por favor, assine novamente para continuar.',
        };

      default:
        console.log('Status não reconhecido:', status);
        return {
          hasAccess: false,
          message: 'Você precisa de uma assinatura ativa para acessar este conteúdo.',
        };
    }
  } catch (error) {
    console.error('Erro ao verificar acesso da assinatura:', error);
    return {
      hasAccess: false,
      message: 'Erro ao verificar status da assinatura. Tente novamente mais tarde.',
    };
  }
}
