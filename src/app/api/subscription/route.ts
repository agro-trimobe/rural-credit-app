import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getUserByEmail } from '@/lib/tenant-utils';
import { 
  validateAsaasConfig,
  createAsaasCustomer, 
  createAsaasSubscription 
} from '@/lib/asaas-config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
}));

export async function GET(req: NextRequest) {
  try {
    const config = validateAsaasConfig();
    
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await getUserByEmail(token.email!);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Se não tiver dados de assinatura, cria com período de teste
    if (!user.subscription) {
      const now = new Date();
      const trialEndsAt = new Date(now);
      trialEndsAt.setDate(now.getDate() + config.TRIAL_PERIOD_DAYS);

      const subscription = {
        createdAt: now.toISOString(),
        trialEndsAt: trialEndsAt.toISOString(),
        status: 'TRIAL',
      };

      await dynamoDb.send(new UpdateCommand({
        TableName: 'Users',
        Key: {
          PK: user.PK,
          SK: user.SK,
        },
        UpdateExpression: 'SET subscription = :subscription',
        ExpressionAttributeValues: {
          ':subscription': subscription,
        },
      }));

      return NextResponse.json(subscription);
    }

    return NextResponse.json(user.subscription);
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const config = validateAsaasConfig();
    
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await getUserByEmail(token.email!);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { creditCard, creditCardHolderInfo } = body;

    // Validar CPF
    const formattedCpf = creditCardHolderInfo.cpfCnpj.replace(/\D/g, '');
    if (!formattedCpf || formattedCpf.length !== 11) {
      return NextResponse.json({ 
        error: 'CPF inválido. Por favor, forneça um CPF válido.' 
      }, { status: 400 });
    }

    console.log('Dados do usuário:', {
      name: user.name,
      email: user.email,
      currentCpf: user.cpf,
      newCpf: formattedCpf
    });

    // Atualizar CPF do usuário se necessário
    if (!user.cpf || user.cpf !== formattedCpf) {
      console.log('Atualizando CPF do usuário no DynamoDB...');
      
      await dynamoDb.send(new UpdateCommand({
        TableName: 'Users',
        Key: {
          PK: user.PK,
          SK: user.SK,
        },
        UpdateExpression: 'SET cpf = :cpf',
        ExpressionAttributeValues: {
          ':cpf': formattedCpf,
        },
      }));

      console.log('CPF atualizado com sucesso');
    }

    // Cria cliente no Asaas
    console.log('Criando cliente no Asaas com os dados:', {
      name: creditCardHolderInfo.name || user.name,
      email: user.email,
      cpfMasked: formattedCpf.replace(/\d/g, '*')
    });

    const customer = await createAsaasCustomer({
      name: creditCardHolderInfo.name || user.name,
      cpfCnpj: formattedCpf,
      email: user.email,
    });

    console.log('Cliente criado com sucesso:', {
      customerId: customer.id,
      name: customer.name,
      email: customer.email
    });

    // Obtém IP do cliente de diferentes headers
    const clientIp = req.headers.get('x-forwarded-for') || 
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Cria assinatura no Asaas
    console.log('Criando assinatura com os dados:', {
      customerId: customer.id,
      value: config.SUBSCRIPTION_VALUE,
      nextDueDate: new Date().toISOString().split('T')[0],
      holderName: creditCard.holderName,
      email: user.email
    });

    const subscription = await createAsaasSubscription({
      customer: customer.id,
      value: config.SUBSCRIPTION_VALUE,
      nextDueDate: new Date().toISOString().split('T')[0],
      creditCard,
      creditCardHolderInfo: {
        name: creditCardHolderInfo.name,
        email: user.email,
        cpfCnpj: formattedCpf, // Incluir CPF nas informações do titular
        postalCode: creditCardHolderInfo.postalCode,
        addressNumber: creditCardHolderInfo.addressNumber
      },
      remoteIp: clientIp,
    });

    console.log('Assinatura criada com sucesso:', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status
    });

    // Atualiza dados da assinatura no DynamoDB
    console.log('Atualizando dados da assinatura no DynamoDB...');

    await dynamoDb.send(new UpdateCommand({
      TableName: 'Users',
      Key: {
        PK: user.PK,
        SK: user.SK,
      },
      UpdateExpression: 'SET subscription = :subscription',
      ExpressionAttributeValues: {
        ':subscription': {
          status: 'ACTIVE',
          asaasCustomerId: customer.id,
          asaasSubscriptionId: subscription.id,
          createdAt: new Date().toISOString(),
          subscriptionEndsAt: subscription.nextDueDate,
        },
      },
    }));

    console.log('Dados da assinatura atualizados com sucesso');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro ao processar assinatura' 
    }, { status: 500 });
  }
}
