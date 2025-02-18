import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
}));

// Mapeamento de status do Asaas para nosso sistema
const statusMapping: Record<string, string> = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OVERDUE: 'OVERDUE',
  CANCELED: 'INACTIVE'
};

async function getUserByAsaasSubscriptionId(subscriptionId: string) {
  const command = new QueryCommand({
    TableName: 'Users',
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    FilterExpression: 'subscription.asaasSubscriptionId = :subscriptionId',
    ExpressionAttributeValues: {
      ':pk': 'USER',
      ':subscriptionId': subscriptionId
    }
  });

  const result = await dynamoDb.send(command);
  return result.Items?.[0];
}

export async function POST(req: NextRequest) {
  try {
    // Validação do token de webhook (opcional)
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (webhookToken) {
      const receivedToken = req.headers.get('asaas-access-token');
      if (receivedToken !== webhookToken) {
        return NextResponse.json(
          { error: 'Token de webhook inválido' },
          { status: 401 }
        );
      }
    }

    const body = await req.json();
    const { event, payment } = body;

    // Processar apenas eventos relacionados a assinaturas
    if (!event.startsWith('PAYMENT_')) {
      return NextResponse.json({ success: true });
    }

    const user = await getUserByAsaasSubscriptionId(payment.subscription);
    if (!user) {
      console.error('Usuário não encontrado para assinatura:', payment.subscription);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Mapear status do pagamento para status da assinatura
    let subscriptionStatus = 'ACTIVE';
    if (event === 'PAYMENT_RECEIVED') {
      subscriptionStatus = 'ACTIVE';
    } else if (event === 'PAYMENT_OVERDUE') {
      subscriptionStatus = 'OVERDUE';
    } else if (event === 'PAYMENT_CANCELED') {
      subscriptionStatus = 'INACTIVE';
    }

    // Atualizar status da assinatura no DynamoDB
    await dynamoDb.send(new UpdateCommand({
      TableName: 'Users',
      Key: {
        PK: `USER#${user.email}`,
        SK: `USER#${user.email}`,
      },
      UpdateExpression: 'SET subscription.status = :status, subscription.updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':status': subscriptionStatus,
        ':updatedAt': new Date().toISOString(),
      },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
