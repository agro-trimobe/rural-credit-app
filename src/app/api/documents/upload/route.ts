import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { s3, dynamodb } from '@/lib/aws-config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { authOptions } from '@/app/api/auth/auth-options';
import crypto from 'crypto';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const category = formData.get('category') as string;
    const documentId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Construir o caminho do S3 seguindo a estrutura definida
    // clients/{cognitoId}/documents/project-{id}/{category}/{documentId}/
    const s3Key = `clients/${session.user.cognitoId}/documents/project-${projectId}/${category}/${documentId}/${file.name}`;
    
    // Upload para S3
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      Metadata: {
        'tenant-id': session.user.tenantId,
        'project-id': projectId,
        'category': category,
        'document-id': documentId
      },
      ServerSideEncryption: 'AES256'
    });
    await s3.send(putObjectCommand);

    // Salvar metadados no DynamoDB
    const putCommand = new PutCommand({
      TableName: 'Documents',
      Item: {
        PK: `TENANT#${session.user.tenantId}`,
        SK: `PROJECT#${projectId}#DOC#${documentId}`,
        id: documentId,
        tenantId: session.user.tenantId,
        projectId: projectId,
        name: file.name,
        type: file.type,
        size: file.size,
        s3Key: s3Key,
        category: category,
        createdAt: timestamp,
        updatedAt: timestamp,
        // GSI1 (documentos por tipo dentro do tenant)
        GSI1PK: `TENANT#${session.user.tenantId}#DOCTYPE#${category}`,
        GSI1SK: `PROJECT#${projectId}#DOC#${documentId}`
      }
    });
    await dynamodb.send(putCommand);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no upload do documento:', error);
    return NextResponse.json(
      { error: 'Erro no upload do documento' },
      { status: 500 }
    );
  }
}
