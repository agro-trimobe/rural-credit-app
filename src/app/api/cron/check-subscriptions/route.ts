import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
}));

export async function GET(req: NextRequest) {
  try {
    // Verificar se a requisição é autêntica
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar todos os usuários com assinatura
    const scanCommand = new ScanCommand({
      TableName: 'Users',
      FilterExpression: 'attribute_exists(subscription)',
    });

    const result = await dynamoDb.send(scanCommand);
    const users = result.Items || [];
    const now = new Date();

    // Verificar cada usuário
    for (const user of users) {
      try {
        const { subscription } = user;

        // Verificar período de teste
        if (subscription.status === 'TRIAL') {
          const trialEndsAt = new Date(subscription.trialEndsAt);
          if (now > trialEndsAt) {
            await dynamoDb.send(new UpdateCommand({
              TableName: 'Users',
              Key: {
                PK: `USER#${user.email}`,
                SK: `USER#${user.email}`,
              },
              UpdateExpression: 'SET subscription.status = :status',
              ExpressionAttributeValues: {
                ':status': 'INACTIVE',
              },
            }));
          }
          continue;
        }

        // Verificar assinatura ativa
        if (subscription.status === 'ACTIVE') {
          const subscriptionEndsAt = new Date(subscription.subscriptionEndsAt);
          if (now > subscriptionEndsAt) {
            await dynamoDb.send(new UpdateCommand({
              TableName: 'Users',
              Key: {
                PK: `USER#${user.email}`,
                SK: `USER#${user.email}`,
              },
              UpdateExpression: 'SET subscription.status = :status',
              ExpressionAttributeValues: {
                ':status': 'OVERDUE',
              },
            }));
          }
        }
      } catch (error) {
        console.error(`Erro ao processar usuário ${user.email}:`, error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao verificar assinaturas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
