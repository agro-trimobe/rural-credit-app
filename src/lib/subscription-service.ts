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

    if (!tenantId || !cognitoId) {
      console.error('tenantId ou cognitoId inválidos:', { tenantId, cognitoId });
      return { hasAccess: false, message: 'Dados de usuário inválidos' };
    }

    try {
      const result = await dynamodb.send(new QueryCommand({
        TableName: 'Users',
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': `USER#${cognitoId}`,
        },
      }));

      console.log('Resultado da query:', {
        count: result.Count,
        scannedCount: result.ScannedCount,
        hasItems: result.Items && result.Items.length > 0
      });

      const user = result.Items?.[0];
      if (!user) {
        console.error('Usuário não encontrado');
        return { hasAccess: false, message: 'Usuário não encontrado' };
      }

      console.log('Dados do usuário encontrados:', {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        hasSubscription: !!user.subscription
      });

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
    } catch (error: unknown) {
      console.error('Erro ao verificar acesso da assinatura:', error);
      
      // Tratamento seguro para o erro com verificação de tipo
      const errorDetails: Record<string, unknown> = {};
      
      if (error && typeof error === 'object') {
        if ('name' in error && error.name) {
          errorDetails.name = error.name;
        }
        
        if ('message' in error && error.message) {
          errorDetails.message = error.message;
        }
        
        if ('stack' in error && error.stack) {
          errorDetails.stack = error.stack;
        }
        
        // Verificar se é um erro específico do AWS SDK
        if ('$metadata' in error) {
          const metadata = error.$metadata as Record<string, unknown>;
          errorDetails.httpStatusCode = metadata.httpStatusCode;
          errorDetails.requestId = metadata.requestId;
          console.error('Erro do DynamoDB:', {
            httpStatusCode: metadata.httpStatusCode,
            requestId: metadata.requestId
          });
        }
      }
      
      console.error('Detalhes do erro:', errorDetails);
      
      return {
        hasAccess: false,
        message: 'Erro ao verificar status da assinatura. Tente novamente mais tarde.',
      };
    }
  } catch (error: unknown) {
    console.error('Erro ao verificar acesso da assinatura:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    const errorDetails: Record<string, unknown> = {};
    
    if (error && typeof error === 'object') {
      if ('name' in error && error.name) {
        errorDetails.name = error.name;
      }
      
      if ('message' in error && error.message) {
        errorDetails.message = error.message;
      }
      
      if ('stack' in error && error.stack) {
        errorDetails.stack = error.stack;
      }
    }
    
    console.error('Detalhes do erro:', errorDetails);
    
    return {
      hasAccess: false,
      message: 'Erro ao verificar status da assinatura. Tente novamente mais tarde.',
    };
  }
}
