export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { updateUserSubscriptionStatus, type SubscriptionStatus } from '@/lib/subscription-service';

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION,
}));

// Tipos de evento que o Asaas pode enviar
const PAYMENT_EVENTS = {
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_OVERDUE: 'PAYMENT_OVERDUE',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  PAYMENT_DELETED: 'PAYMENT_DELETED',
  PAYMENT_CHARGEBACK_REQUESTED: 'PAYMENT_CHARGEBACK_REQUESTED'
} as const;

const SUBSCRIPTION_EVENTS = {
  SUBSCRIPTION_DELETED: 'SUBSCRIPTION_DELETED',
  SUBSCRIPTION_UPDATED: 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELED: 'SUBSCRIPTION_CANCELED'
} as const;

async function getUserByAsaasSubscriptionId(subscriptionId: string) {
  try {
    const command = new ScanCommand({
      TableName: 'Users',
      FilterExpression: 'subscription.asaasSubscriptionId = :subscriptionId',
      ExpressionAttributeValues: {
        ':subscriptionId': subscriptionId
      }
    });

    console.log('Buscando usuário com asaasSubscriptionId:', subscriptionId);
    const result = await dynamoDb.send(command);
    
    if (!result.Items || result.Items.length === 0) {
      console.log('Nenhum usuário encontrado com asaasSubscriptionId:', subscriptionId);
      return null;
    }

    console.log('Usuário encontrado:', result.Items[0]);
    return result.Items[0];
  } catch (error) {
    console.error('Erro ao buscar usuário por asaasSubscriptionId:', error);
    throw error;
  }
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
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));
    
    const { event, payment, subscription } = body;

    // Identificar o ID da assinatura baseado no tipo de evento
    let subscriptionId: string | undefined;
    
    if (event in SUBSCRIPTION_EVENTS) {
      subscriptionId = subscription?.id;
    } else if (event in PAYMENT_EVENTS) {
      subscriptionId = payment?.subscription;
    }

    if (!subscriptionId) {
      console.log('Evento não possui ID de assinatura:', event);
      return NextResponse.json({ success: true });
    }

    const user = await getUserByAsaasSubscriptionId(subscriptionId);
    if (!user) {
      console.error('Usuário não encontrado para assinatura:', subscriptionId);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Atualiza o status da assinatura do usuário baseado no evento
    console.log('Processando evento:', event, 'para usuário:', user.email);
    
    switch (event) {
      case PAYMENT_EVENTS.PAYMENT_CONFIRMED:
      case PAYMENT_EVENTS.PAYMENT_RECEIVED:
        // Obter a data do próximo vencimento da assinatura
        const nextDueDate = new Date();
        nextDueDate.setMonth(nextDueDate.getMonth() + 1); // Adiciona 1 mês
        nextDueDate.setHours(23, 59, 59, 999);
        
        await updateUserSubscriptionStatus(subscriptionId, 'ACTIVE', nextDueDate.toISOString());
        break;

      case PAYMENT_EVENTS.PAYMENT_OVERDUE:
        await updateUserSubscriptionStatus(subscriptionId, 'OVERDUE');
        break;

      case PAYMENT_EVENTS.PAYMENT_REFUNDED:
      case PAYMENT_EVENTS.PAYMENT_DELETED:
      case PAYMENT_EVENTS.PAYMENT_CHARGEBACK_REQUESTED:
      case SUBSCRIPTION_EVENTS.SUBSCRIPTION_DELETED:
      case SUBSCRIPTION_EVENTS.SUBSCRIPTION_CANCELED:
        await updateUserSubscriptionStatus(subscriptionId, 'CANCELED');
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
