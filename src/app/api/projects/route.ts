import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dynamodb } from '@/lib/aws-config';
import { authOptions } from '@/app/api/auth/auth-options';
import { QueryCommand, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

function parseBrazilianCurrency(value: string | number): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  
  // Remove o símbolo da moeda, espaços e pontos de milhar
  const cleanValue = value
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const parsedValue = parseFloat(cleanValue);
  return isNaN(parsedValue) ? 0 : parsedValue;
}

async function getClientName(tenantId: string, clientId: string): Promise<string> {
  try {
    console.log('Buscando cliente com:', { tenantId, clientId });
    
    const command = new GetCommand({
      TableName: 'Clients',
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `CLIENT#${clientId}`
      }
    });

    console.log('Comando DynamoDB:', JSON.stringify(command.input, null, 2));
    const result = await dynamodb.send(command);
    console.log('Resultado DynamoDB:', JSON.stringify(result.Item, null, 2));
    
    return result.Item?.name || 'Cliente não encontrado';
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return 'Cliente não encontrado';
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const command = new QueryCommand({
      TableName: 'Projects',
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${session.user.tenantId}`,
        ':sk': 'PROJECT#'
      }
    });

    const result = await dynamodb.send(command);
    
    // Log dos dados brutos para debug
    console.log('Dados do DynamoDB:', JSON.stringify(result.Items, null, 2));

    // Verificar se Items existe e é um array
    if (!result.Items || !Array.isArray(result.Items)) {
      console.log('Nenhum projeto encontrado ou resultado inválido');
      return NextResponse.json([]);
    }

    // Buscar os nomes dos clientes
    const projects = await Promise.all(result.Items.map(async item => {
      // Log de cada item para debug
      console.log('Item do DynamoDB:', item);

      // Usar o clientName do projeto se existir, senão buscar do DynamoDB
      let clientName = item.clientName;
      if (!clientName && item.clientId) {
        clientName = await getClientName(session.user.tenantId, item.clientId);
      }
      
      return {
        id: item.SK.replace('PROJECT#', ''),
        clientId: item.clientId,
        clientName: clientName || 'Cliente não encontrado',
        document: item.document,
        phone: item.phone || 'N/A',
        email: item.email || 'N/A',
        projectName: item.projectName || item.propertyName || 'Sem nome',
        purpose: item.purpose || 'N/A',
        amount: typeof item.amount === 'number' ? item.amount : parseBrazilianCurrency(item.amount || '0'),
        creditLine: item.creditLine || 'Outros',
        propertyName: item.propertyName || 'N/A',
        area: typeof item.area === 'string' ? parseFloat(item.area || '0') : (item.area || 0),
        location: item.location || 'N/A',
        status: item.status || 'em_andamento',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      };
    }));

    // Log dos projetos mapeados para debug
    console.log('Projetos mapeados:', JSON.stringify(projects, null, 2));

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const projectId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const command = new PutCommand({
      TableName: 'Projects',
      Item: {
        PK: `TENANT#${session.user.tenantId}`,
        SK: `PROJECT#${projectId}`,
        id: projectId,
        clientId: data.clientId,
        clientName: data.clientName,
        document: data.document,
        phone: data.phone,
        email: data.email,
        projectName: data.projectName,
        purpose: data.purpose,
        amount: data.amount,
        creditLine: data.creditLine,
        propertyName: data.propertyName,
        area: parseFloat(data.area),
        location: data.location,
        status: 'em_andamento',
        createdAt: timestamp,
        updatedAt: timestamp,
        // GSI1 para busca por cliente
        GSI1PK: `TENANT#${session.user.tenantId}#CLIENT#${data.clientId}`,
        GSI1SK: `PROJECT#${projectId}`,
        // GSI2 para busca por linha de crédito
        GSI2PK: `TENANT#${session.user.tenantId}#CREDITLINE#${data.creditLine}`,
        GSI2SK: `PROJECT#${projectId}`
      }
    });

    await dynamodb.send(command);

    return NextResponse.json({ id: projectId });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    );
  }
}
