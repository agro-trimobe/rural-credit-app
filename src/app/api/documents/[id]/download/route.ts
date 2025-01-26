import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dynamodb } from '@/lib/aws-config';
import { authOptions } from '@/app/api/auth/auth-options';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/aws-config';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Extrair o ID do documento da URL
  const id = request.nextUrl.pathname.split('/')[3];
  if (!id) {
    return NextResponse.json({ error: 'ID do documento é obrigatório' }, { status: 400 });
  }

  try {
    // Buscar o documento no DynamoDB
    const command = new GetCommand({
      TableName: 'Documents',
      Key: {
        PK: `TENANT#${session.user.tenantId}`,
        SK: `DOCUMENT#${id}`
      }
    });

    const result = await dynamodb.send(command);
    if (!result.Item) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    // Gerar URL do S3
    const s3Command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: result.Item.key
    });

    // Redirecionar para o S3
    const url = await s3.send(s3Command);
    return NextResponse.json({ url: url.Body });
  } catch (error) {
    console.error('Erro ao gerar URL de download:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar URL de download' },
      { status: 500 }
    );
  }
}
