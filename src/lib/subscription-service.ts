import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from './aws-config';

export type SubscriptionStatus = 
  | 'TRIAL' 
  | 'TRIAL_EXPIRED' 
  | 'ACTIVE' 
  | 'EXPIRED' 
  | 'OVERDUE' 
  | 'CANCELED';

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
    if (!user) {
      console.error('Usuário não encontrado');
      return { hasAccess: false, message: 'Usuário não encontrado' };
    }

    console.log('Dados do usuário encontrados:', JSON.stringify(user, null, 2));

    const subscription = user.subscription;
    if (!subscription) {
      return { hasAccess: false, message: 'Nenhuma assinatura encontrada' };
    }

    console.log('Status da assinatura:', subscription.status);
    console.log('Data de expiração do trial:', subscription.trialEndsAt);
    console.log('Data de expiração da assinatura:', subscription.subscriptionEndsAt);

    const now = new Date();

    // Se estiver em período de trial
    if (subscription.status === 'TRIAL' && subscription.trialEndsAt) {
      const trialEndsAt = new Date(subscription.trialEndsAt);
      if (trialEndsAt > now) {
        return { hasAccess: true };
      }
      return { 
        hasAccess: false, 
        message: 'Seu período de teste expirou. Por favor, assine para continuar.' 
      };
    }

    // Se a assinatura estiver ativa
    if (subscription.status === 'ACTIVE' && subscription.subscriptionEndsAt) {
      const subscriptionEndsAt = new Date(subscription.subscriptionEndsAt);
      console.log('Comparando datas da assinatura:');
      console.log('- Data atual:', now.toISOString());
      console.log('- Data de expiração:', subscriptionEndsAt.toISOString());

      if (subscriptionEndsAt > now) {
        return { hasAccess: true };
      }
    }

    return { 
      hasAccess: false, 
      message: 'Sua assinatura expirou. Por favor, renove para continuar.' 
    };
  } catch (error) {
    const err = error as Error;
    console.error('Erro ao verificar acesso da assinatura:', err);
    return {
      hasAccess: false,
      message: 'Erro ao verificar status da assinatura. Tente novamente mais tarde.',
    };
  }
}
