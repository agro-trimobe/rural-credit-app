import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dynamodb } from '@/lib/aws-config';
import { authOptions } from '@/app/api/auth/auth-options';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { s3 } from '@/lib/aws-config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o bucket está configurado
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      console.error('S3_BUCKET_NAME não está configurado');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    // Aguardar os parâmetros da rota
    const { id: projectId, docId } = await context.params;
    if (!projectId || !docId) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Buscar o documento no DynamoDB
    const queryCommand = new QueryCommand({
      TableName: 'Documents',
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: `TENANT#${session.user.tenantId}` },
        ':sk': { S: `PROJECT#${projectId}#DOC#${docId}` }
      }
    });

    const docResult = await dynamodb.send(queryCommand);
    const doc = docResult.Items?.[0];

    if (!doc) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    // Log para debug
    console.log('Documento encontrado:', doc);
    console.log('S3 Key do documento:', doc.s3Key?.S);

    // Gerar URL assinada para download usando a chave do S3
    const s3Key = doc.s3Key?.S;
    if (!s3Key) {
      return NextResponse.json({ error: 'Chave S3 do documento não encontrada' }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key
    });

    console.log('Bucket:', bucketName);
    console.log('Key:', s3Key);

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Erro ao gerar URL de download:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar URL de download' },
      { status: 500 }
    );
  }
}
