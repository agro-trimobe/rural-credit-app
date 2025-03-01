export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { getUserByEmail } from '@/lib/dynamo-utils';
import { validateAsaasConfig } from '@/lib/asaas-config';

// Inicializa o cliente do DynamoDB
const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

export async function GET(req: NextRequest) {
  try {
    const config = validateAsaasConfig();
    
    // Verificar autenticação
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter usuário
    const user = await getUserByEmail(token.email!);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Se não tiver dados de assinatura, definir como período de teste
    if (!user.subscription) {
      const now = new Date();
      const trialDays = config.TRIAL_PERIOD_DAYS; // Usar a configuração do Asaas
      const trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

      return NextResponse.json({
        status: 'TRIAL',
        createdAt: now.toISOString(),
        trialEndsAt: trialEndsAt.toISOString(),
      });
    }

    // Retornar os dados da assinatura existente
    return NextResponse.json(user.subscription);
  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}
