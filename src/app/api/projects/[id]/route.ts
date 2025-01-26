import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dynamodb } from '@/lib/aws-config';
import { authOptions } from '@/app/api/auth/auth-options';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

async function getClientDetails(tenantId: string, clientId: string) {
  try {
    const command = new GetCommand({
      TableName: 'Clients',
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `CLIENT#${clientId}`
      }
    });

    const result = await dynamodb.send(command);
    return result.Item;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Extrair o ID do projeto da URL
  const id = request.nextUrl.pathname.split('/').pop();
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: 'ID do projeto é obrigatório' }, { status: 400 });
  }

  try {
    const command = new GetCommand({
      TableName: 'Projects',
      Key: {
        PK: `TENANT#${session.user.tenantId}`,
        SK: `PROJECT#${id}`
      }
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Log para debug
    console.log('Dados do DynamoDB:', JSON.stringify(result.Item, null, 2));

    // Usar dados do cliente do projeto se disponíveis, senão buscar do DynamoDB
    let clientDetails = null;
    if (result.Item.clientName) {
      clientDetails = {
        name: result.Item.clientName,
        cpf: result.Item.document,
        email: result.Item.email,
        phone: result.Item.phone
      };
    } else if (result.Item.clientId) {
      clientDetails = await getClientDetails(session.user.tenantId, result.Item.clientId);
    }

    // Formatar os dados antes de enviar
    const formattedProject = {
      id: result.Item.id,
      clientId: result.Item.clientId,
      clientName: clientDetails?.name || 'Cliente não encontrado',
      document: clientDetails?.cpf || result.Item.document || 'N/A',
      email: clientDetails?.email || result.Item.email || 'N/A',
      phone: clientDetails?.phone || result.Item.phone || 'N/A',
      projectName: result.Item.projectName || result.Item.propertyName,
      purpose: result.Item.purpose,
      creditLine: result.Item.creditLine,
      amount: typeof result.Item.amount === 'string' 
        ? parseFloat(result.Item.amount.replace(/\./g, '').replace(',', '.'))
        : result.Item.amount || 0,
      status: result.Item.status === 'pending' ? 'Em Andamento' :
              result.Item.status === 'completed' ? 'Concluído' :
              'Cancelado',
      propertyName: result.Item.propertyName,
      area: typeof result.Item.area === 'string'
        ? parseFloat(result.Item.area)
        : result.Item.area || 0,
      location: result.Item.propertyLocation || result.Item.location || 'N/A',
      createdAt: result.Item.createdAt,
      updatedAt: result.Item.updatedAt
    };

    // Log para debug
    console.log('Projeto formatado:', JSON.stringify(formattedProject, null, 2));

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projeto' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Extrair o ID do projeto da URL
  const id = request.nextUrl.pathname.split('/').pop();
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: 'ID do projeto é obrigatório' }, { status: 400 });
  }

  try {
    const data = await request.json();

    // Construir a expressão de atualização dinamicamente
    let updateExpression = 'SET projectName = :projectName, purpose = :purpose, creditLine = :creditLine, amount = :amount, propertyName = :propertyName, area = :area, #loc = :location, clientName = :clientName, document = :document, phone = :phone, email = :email, updatedAt = :updatedAt';
    const expressionAttributeNames: Record<string, string> = {
      '#loc': 'location'
    };
    const expressionAttributeValues: Record<string, any> = {
      ':projectName': data.projectName,
      ':purpose': data.purpose,
      ':creditLine': data.creditLine,
      ':amount': data.amount,
      ':propertyName': data.propertyName,
      ':area': data.area,
      ':location': data.location,
      ':clientName': data.clientName,
      ':document': data.document,
      ':phone': data.phone,
      ':email': data.email,
      ':updatedAt': new Date().toISOString()
    };

    // Adicionar status apenas se ele for fornecido
    if (data.status !== undefined) {
      updateExpression += ', #status = :status';
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = data.status;
    }

    // Atualizar o projeto no DynamoDB
    const command = new UpdateCommand({
      TableName: 'Projects',
      Key: {
        PK: `TENANT#${session.user.tenantId}`,
        SK: `PROJECT#${id}`
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await dynamodb.send(command);

    if (!result.Attributes) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.Attributes);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar projeto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Extrair o ID do projeto da URL
  const id = request.nextUrl.pathname.split('/').pop();
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: 'ID do projeto é obrigatório' }, { status: 400 });
  }

  try {
    const command = new DeleteCommand({
      TableName: 'Projects',
      Key: {
        PK: `TENANT#${session.user.tenantId}`,
        SK: `PROJECT#${id}`
      }
    });

    await dynamodb.send(command);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir projeto' },
      { status: 500 }
    );
  }
}
