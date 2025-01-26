import { NextResponse } from 'next/server';
import { dynamodb } from '@/lib/aws-config';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair o ID do projeto da URL
    const projectId = request.nextUrl.pathname.split('/').slice(-2)[0];

    const command = new QueryCommand({
      TableName: 'Documents',
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${session.user.tenantId}`,
        ':sk': `PROJECT#${projectId}#DOC#`
      }
    });

    const result = await dynamodb.send(command);

    const documents = result.Items?.map(item => ({
      id: item.id,
      name: item.name,
      size: item.size,
      type: item.type,
      url: item.url,
      category: item.category || 'general',
      createdAt: item.createdAt,
    })) || [];

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
