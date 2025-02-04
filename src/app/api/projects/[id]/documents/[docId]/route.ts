import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3, dynamodb } from '@/lib/aws-config';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenantId = session.user.tenantId;
    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const docId = resolvedParams.docId;

    if (!projectId || !docId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Buscando documento para excluir:', {
      tenantId,
      projectId,
      docId
    });

    // Buscar o documento para obter a chave do S3
    const getDocumentCommand = new GetCommand({
      TableName: 'Documents',
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `PROJECT#${projectId}#DOC#${docId}`
      }
    });

    const documentResult = await dynamodb.send(getDocumentCommand);
    const document = documentResult.Item;

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    console.log('Documento encontrado:', {
      name: document.name,
      fileName: document.fileName,
      s3Key: document.s3Key
    });

    // Deletar o arquivo do S3
    if (document.s3Key) {
      console.log('Deletando arquivo do S3:', {
        bucket: process.env.S3_BUCKET_NAME,
        key: document.s3Key
      });

      const deleteS3Command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || '',
        Key: document.s3Key
      });

      await s3.send(deleteS3Command);
    }

    // Deletar o registro do DynamoDB
    const deleteDocCommand = new DeleteCommand({
      TableName: 'Documents',
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `PROJECT#${projectId}#DOC#${docId}`
      }
    });

    await dynamodb.send(deleteDocCommand);

    // Return 204 No Content without a response body
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
