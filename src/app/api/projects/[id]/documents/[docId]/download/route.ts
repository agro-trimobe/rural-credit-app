import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dynamodb } from '@/lib/aws-config';
import { authOptions } from '@/lib/auth-config';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/aws-config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id: projectId, docId } = resolvedParams;

    if (!projectId || !docId) {
      return NextResponse.json({ error: 'ID do projeto e do documento são obrigatórios' }, { status: 400 });
    }

    console.log('Buscando documento:', {
      tenantId: session.user.tenantId,
      projectId,
      docId
    });

    // Buscar o documento no DynamoDB
    const getResult = await dynamodb.send(
      new GetCommand({
        TableName: 'Documents',
        Key: {
          PK: `TENANT#${session.user.tenantId}`,
          SK: `PROJECT#${projectId}#DOC#${docId}`
        }
      })
    );

    if (!getResult.Item) {
      console.log('Documento não encontrado no DynamoDB');
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    console.log('Documento encontrado:', {
      name: getResult.Item.name,
      fileName: getResult.Item.fileName || getResult.Item.name,
      s3Key: getResult.Item.s3Key
    });

    // Usar o campo s3Key para localizar o arquivo
    const s3Key = getResult.Item.s3Key;
    const fileName = getResult.Item.fileName || getResult.Item.name;

    if (!s3Key) {
      console.error('S3Key do documento não encontrada no DynamoDB');
      return NextResponse.json({ error: 'S3Key do documento não encontrada' }, { status: 404 });
    }

    // Buscar o arquivo no S3
    try {
      console.log('Buscando arquivo no S3:', {
        bucket: process.env.S3_BUCKET_NAME,
        key: s3Key
      });

      const s3Response = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: s3Key
        })
      );

      // Criar um ReadableStream a partir do corpo da resposta do S3
      const stream = s3Response.Body as any;
      
      // Criar headers para o download
      const headers = new Headers();
      headers.set('Content-Type', s3Response.ContentType || 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      if (s3Response.ContentLength) {
        headers.set('Content-Length', s3Response.ContentLength.toString());
      }

      console.log('Download iniciado:', {
        fileName: fileName,
        contentType: s3Response.ContentType,
        contentLength: s3Response.ContentLength
      });

      // Retornar o stream com os headers apropriados
      return new NextResponse(stream, {
        status: 200,
        headers
      });

    } catch (s3Error: any) {
      console.error('Erro ao buscar arquivo no S3:', {
        error: s3Error.message,
        code: s3Error.code,
        bucket: process.env.S3_BUCKET_NAME,
        key: s3Key
      });
      return NextResponse.json({ 
        error: 'Erro ao buscar arquivo',
        details: s3Error.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erro ao fazer download do documento:', {
      error: error.message,
      code: error.code
    });
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}
