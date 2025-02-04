import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2));
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!session.user?.tenantId) {
      return new NextResponse('Tenant ID is required', { status: 400 });
    }

    // Extrair o ID do projeto da URL
    const id = request.nextUrl.pathname.split('/')[3];
    if (!id) {
      return new NextResponse('Project ID is required', { status: 400 });
    }

    console.log('Buscando projeto:', {
      tenantId: session.user.tenantId,
      projectId: id
    });

    // Primeiro, vamos buscar o projeto para garantir que ele existe
    const projectResult = await docClient.send(
      new GetCommand({
        TableName: 'Projects',
        Key: {
          PK: `TENANT#${session.user.tenantId}`,
          SK: `PROJECT#${id}`
        }
      })
    );

    console.log('Resultado do projeto:', JSON.stringify(projectResult, null, 2));

    if (!projectResult.Item) {
      return new NextResponse('Project not found', { status: 404 });
    }

    console.log('Buscando documentos para o projeto:', {
      tenantId: session.user.tenantId,
      projectId: id
    });

    // Buscar os documentos do projeto
    const documentsResult = await docClient.send(
      new QueryCommand({
        TableName: 'Documents',
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${session.user.tenantId}`,
          ':sk': `PROJECT#${id}#DOC#`
        }
      })
    );

    console.log('Resultado dos documentos:', JSON.stringify(documentsResult, null, 2));

    const documents = documentsResult.Items?.map(item => ({
      id: item.id,
      name: item.name,
      fileName: item.fileName || item.name,
      url: item.url,
      size: item.size,
      type: item.type,
      category: item.category || 'general',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    })) || [];

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Erro detalhado ao buscar documentos:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      errorType: error instanceof Error ? error.name : 'UnknownError',
      timestamp: new Date().toISOString()
    }, { 
      status: 500 
    });
  }
}
