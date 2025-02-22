import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { updateUserSubscriptionStatus } from '@/lib/subscription-service';

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

// Tipos de evento que o Asaas pode enviar
const PAYMENT_EVENTS = {
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PAYMENT_RECEIVED_IN_CASH_UNDONE: 'PAYMENT_RECEIVED_IN_CASH_UNDONE',
  PAYMENT_OVERDUE: 'PAYMENT_OVERDUE',
  PAYMENT_DELETED: 'PAYMENT_DELETED',
  PAYMENT_RESTORED: 'PAYMENT_RESTORED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  PAYMENT_UPDATED: 'PAYMENT_UPDATED',
  PAYMENT_CHARGEBACK_REQUESTED: 'PAYMENT_CHARGEBACK_REQUESTED',
  PAYMENT_CHARGEBACK_DISPUTE: 'PAYMENT_CHARGEBACK_DISPUTE',
  PAYMENT_AWAITING_CHARGEBACK_REVERSAL: 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
  PAYMENT_DUNNING_RECEIVED: 'PAYMENT_DUNNING_RECEIVED',
  PAYMENT_DUNNING_REQUESTED: 'PAYMENT_DUNNING_REQUESTED',
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

    // Atualiza o status da assinatura do usuário baseado no evento
    switch (event) {
      case PAYMENT_EVENTS.PAYMENT_CONFIRMED:
      case PAYMENT_EVENTS.PAYMENT_RECEIVED:
        await updateUserSubscriptionStatus(payment.subscription, 'active', payment.dueDate);
        break;

      case PAYMENT_EVENTS.PAYMENT_OVERDUE:
        await updateUserSubscriptionStatus(payment.subscription, 'overdue');
        break;

      case PAYMENT_EVENTS.PAYMENT_REFUNDED:
      case PAYMENT_EVENTS.PAYMENT_DELETED:
      case PAYMENT_EVENTS.PAYMENT_CHARGEBACK_REQUESTED:
        await updateUserSubscriptionStatus(payment.subscription, 'canceled');
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
