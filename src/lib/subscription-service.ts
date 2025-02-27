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
        console.log('Nenhuma assinatura encontrada para o usuário');
        return { hasAccess: false, message: 'Nenhuma assinatura encontrada' };
      }

      console.log('Dados completos da assinatura:', JSON.stringify(subscription, null, 2));
      console.log('Status da assinatura:', subscription.status);
      console.log('Data de expiração do trial (raw):', subscription.trialEndsAt);
      console.log('Data de expiração da assinatura (raw):', subscription.subscriptionEndsAt);

      const now = new Date();
      console.log('Data atual (UTC):', now.toISOString());

      // Se estiver em período de trial
      if (subscription.status === 'TRIAL' && subscription.trialEndsAt) {
        let trialEndsAt: Date;
        
        try {
          // Garantir que a data seja tratada corretamente
          trialEndsAt = new Date(subscription.trialEndsAt);
          console.log('Data de expiração do trial (parsed):', trialEndsAt.toISOString());
          console.log('Trial expirado?', trialEndsAt <= now ? 'SIM' : 'NÃO');
          
          // Verificar se a data é válida
          if (isNaN(trialEndsAt.getTime())) {
            console.error('Data de expiração do trial inválida:', subscription.trialEndsAt);
            return { 
              hasAccess: false, 
              message: 'Erro ao verificar período de teste. Entre em contato com o suporte.' 
            };
          }
        } catch (error) {
          console.error('Erro ao processar data de expiração do trial:', error);
          return { 
            hasAccess: false, 
            message: 'Erro ao verificar período de teste. Entre em contato com o suporte.' 
          };
        }
        
        if (trialEndsAt > now) {
          console.log('Usuário com trial válido, permitindo acesso');
          return { hasAccess: true };
        }
        
        console.log('Trial expirado, negando acesso');
        return { 
          hasAccess: false, 
          message: 'Seu período de teste expirou. Por favor, assine para continuar.' 
        };
      }

      // Se a assinatura estiver ativa
      if (subscription.status === 'ACTIVE' && subscription.subscriptionEndsAt) {
        let subscriptionEndsAt: Date;
        
        try {
          // Garantir que a data seja tratada corretamente
          subscriptionEndsAt = new Date(subscription.subscriptionEndsAt);
          console.log('Data de expiração da assinatura (parsed):', subscriptionEndsAt.toISOString());
          console.log('Assinatura expirada?', subscriptionEndsAt <= now ? 'SIM' : 'NÃO');
          
          // Verificar se a data é válida
          if (isNaN(subscriptionEndsAt.getTime())) {
            console.error('Data de expiração da assinatura inválida:', subscription.subscriptionEndsAt);
            return { 
              hasAccess: false, 
              message: 'Erro ao verificar assinatura. Entre em contato com o suporte.' 
            };
          }
        } catch (error) {
          console.error('Erro ao processar data de expiração da assinatura:', error);
          return { 
            hasAccess: false, 
            message: 'Erro ao verificar assinatura. Entre em contato com o suporte.' 
          };
        }

        if (subscriptionEndsAt > now) {
          console.log('Usuário com assinatura ativa, permitindo acesso');
          return { hasAccess: true };
        }
        
        console.log('Assinatura expirada, negando acesso');
      }

      console.log('Nenhuma condição de acesso válida encontrada, negando acesso');
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
