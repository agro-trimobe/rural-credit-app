import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id, docId } = resolvedParams;

    if (!id || !docId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Primeiro, buscar o documento para obter a chave do S3
    const getResult = await docClient.send(
      new GetCommand({
        TableName: 'Documents',
        Key: {
          PK: `TENANT#${session.user.tenantId}`,
          SK: `PROJECT#${id}#DOC#${docId}`
        }
      })
    );

    if (!getResult.Item) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Deletar o arquivo do S3
    if (getResult.Item.s3Key) {
      try {
        console.log('Deletando arquivo do S3:', {
          bucket: process.env.S3_BUCKET_NAME,
          key: getResult.Item.s3Key
        });

        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: getResult.Item.s3Key
          })
        );
      } catch (error) {
        console.error('Error deleting file from S3:', error);
        // Continuar mesmo se falhar a deleção do S3
      }
    }

    // Deletar o registro do DynamoDB
    await docClient.send(
      new DeleteCommand({
        TableName: 'Documents',
        Key: {
          PK: `TENANT#${session.user.tenantId}`,
          SK: `PROJECT#${id}#DOC#${docId}`
        }
      })
    );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
