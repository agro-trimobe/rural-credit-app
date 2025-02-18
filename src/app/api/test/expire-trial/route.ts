import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getToken } from 'next-auth/jwt';

// Somente disponível em ambiente de desenvolvimento
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
}));

export async function POST(req: NextRequest) {
  // Em produção, retorna 404
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const token = await getToken({ req });
    if (!token?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Atualiza a data de expiração do trial para ontem
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await dynamoDb.send(new UpdateCommand({
      TableName: 'Users',
      Key: {
        PK: `USER#${token.email}`,
        SK: `USER#${token.email}`,
      },
      UpdateExpression: 'SET subscription.trialEndsAt = :trialEndsAt',
      ExpressionAttributeValues: {
        ':trialEndsAt': yesterday.toISOString(),
      },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao expirar trial:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
