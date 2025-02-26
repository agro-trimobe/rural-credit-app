export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { s3 } from '@/lib/aws-config';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é uma requisição multipart
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;
    const category = formData.get('category') as string | null || 'documentos-pessoais';

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'Arquivo e ID do projeto são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('Iniciando upload de documento:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      projectId,
      category
    });

    // Verificar se o projeto existe
    const projectResult = await docClient.send(
      new GetCommand({
        TableName: 'Projects',
        Key: {
          PK: `TENANT#${session.user.tenantId}`,
          SK: `PROJECT#${projectId}`
        }
      })
    );

    if (!projectResult.Item) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    console.log('Projeto encontrado:', JSON.stringify(projectResult.Item, null, 2));

    // Buscar documentos existentes do projeto
    console.log('Buscando documentos existentes do projeto...');
    const documentsResult = await docClient.send(
      new QueryCommand({
        TableName: 'Documents',
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${session.user.tenantId}`,
          ':sk': `PROJECT#${projectId}#DOC#`
        },
        Limit: 1
      })
    );

    console.log('Resultado da busca de documentos:', JSON.stringify(documentsResult, null, 2));

    // Tentar obter o clientId e o padrão da chave S3 de um documento existente
    let s3KeyPrefix = '';
    if (documentsResult.Items && documentsResult.Items.length > 0) {
      const existingDoc = documentsResult.Items[0];
      if (existingDoc.s3Key) {
        // Extrair o prefixo da chave S3 até a pasta do projeto
        const match = existingDoc.s3Key.match(/(.*project-[^/]+)/);
        if (match) {
          s3KeyPrefix = match[1];
          console.log('Prefixo S3 obtido do documento existente:', s3KeyPrefix);
        }
      }
    }

    // Se não encontramos um prefixo, usar o padrão baseado no projeto atual
    if (!s3KeyPrefix) {
      // Modificando para uma estrutura mais simples para teste
      s3KeyPrefix = `documents/${session.user.tenantId}/${projectId}`;
    }

    // Gerar ID único para o documento
    const docId = uuidv4();
    
    // Construir a chave do S3 usando uma estrutura mais simples
    const s3Key = `${s3KeyPrefix}/${docId}/${file.name}`;

    console.log('Fazendo upload para S3:', {
      bucket: process.env.S3_BUCKET_NAME,
      key: s3Key,
      contentType: file.type,
      s3KeyPrefix
    });

    // Converter o arquivo para um buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload do arquivo para o S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
        ServerSideEncryption: "AES256"  // Adicionando criptografia do lado do servidor
      })
    );

    console.log('Upload para S3 concluído, salvando metadados no DynamoDB');

    // Salvar metadados no DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: 'Documents',
        Item: {
          PK: `TENANT#${session.user.tenantId}`,
          SK: `PROJECT#${projectId}#DOC#${docId}`,
          id: docId,
          projectId,
          tenantId: session.user.tenantId,
          name: file.name,
          type: file.type,
          size: file.size,
          category,
          s3Key,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          GSI1PK: `TENANT#${session.user.tenantId}#DOCTYPE#${category}`,
          GSI1SK: `PROJECT#${projectId}#DOC#${docId}`
        }
      })
    );

    console.log('Documento salvo com sucesso:', {
      docId,
      s3Key
    });

    return NextResponse.json({ 
      id: docId,
      name: file.name,
      type: file.type,
      size: file.size,
      category 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao fazer upload do documento:', {
      error: error.message,
      code: error.Code,
      requestId: error.$metadata?.requestId,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Erro ao processar upload do documento' },
      { status: 500 }
    );
  }
}
