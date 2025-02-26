export const runtime = 'nodejs';

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

    // Verificar e atualizar status da assinatura se necessário
    const now = new Date();
    let status = user.subscription.status;
    const trialEndsAt = user.subscription.trialEndsAt;
    const subscriptionEndsAt = user.subscription.subscriptionEndsAt;

    if (status === 'TRIAL' && trialEndsAt && new Date(trialEndsAt) <= now) {
      status = 'TRIAL_EXPIRED';
      await dynamoDb.send(new UpdateCommand({
        TableName: 'Users',
        Key: {
          PK: user.PK,
          SK: user.SK,
        },
        UpdateExpression: 'SET subscription.#st = :status',
        ExpressionAttributeNames: {
          '#st': 'status'
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
      }));
    } else if (status === 'ACTIVE' && subscriptionEndsAt && new Date(subscriptionEndsAt) <= now) {
      status = 'EXPIRED';
      await dynamoDb.send(new UpdateCommand({
        TableName: 'Users',
        Key: {
          PK: user.PK,
          SK: user.SK,
        },
        UpdateExpression: 'SET subscription.#st = :status',
        ExpressionAttributeNames: {
          '#st': 'status'
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
      }));
    }

    return NextResponse.json({
      ...user.subscription,
      status,
    });
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
    const { 
      name, 
      email, 
      cpf, 
      cardNumber, 
      cardExpiry, 
      cardCvc, 
      postalCode, 
      addressNumber,
      phone, 
    } = body;

    // Validar campos obrigatórios
    if (!name || !email || !cpf || !cardNumber || !cardExpiry || !cardCvc || !postalCode || !addressNumber || !phone) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos obrigatórios.' },
        { status: 400 }
      );
    }

    // Validar formato do CPF
    const cpfRegex = /^\d{11}$/;
    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cpfRegex.test(cleanCpf)) {
      return NextResponse.json({ 
        error: 'CPF inválido. Por favor, forneça um CPF válido com 11 dígitos.' 
      }, { status: 400 });
    }

    // Validar formato do telefone
    const phoneRegex = /^\d{10,11}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json({ 
        error: 'Telefone inválido. Por favor, forneça um número de telefone válido com DDD.' 
      }, { status: 400 });
    }

    // Validar formato do CEP
    const cepRegex = /^\d{8}$/;
    const cleanCep = postalCode.replace(/\D/g, '');
    if (!cepRegex.test(cleanCep)) {
      return NextResponse.json({ 
        error: 'CEP inválido. Por favor, forneça um CEP válido com 8 dígitos.' 
      }, { status: 400 });
    }

    // Validar data de validade do cartão
    const [expiryMonth, expiryYear] = cardExpiry.split('/');
    const now = new Date();
    const cardExpiration = new Date(2000 + parseInt(expiryYear), parseInt(expiryMonth) - 1);
    
    if (cardExpiration <= now) {
      return NextResponse.json({ 
        error: 'Cartão vencido. Por favor, use um cartão com data de validade válida.' 
      }, { status: 400 });
    }

    console.log('Dados do usuário:', {
      name: user.name,
      email: user.email,
      currentCpf: user.cpf,
      newCpf: cpf
    });

    // Atualizar CPF do usuário se necessário
    if (!user.cpf || user.cpf !== cpf) {
      console.log('Atualizando CPF do usuário no DynamoDB...');
      
      await dynamoDb.send(new UpdateCommand({
        TableName: 'Users',
        Key: {
          PK: user.PK,
          SK: user.SK,
        },
        UpdateExpression: 'SET cpf = :cpf',
        ExpressionAttributeValues: {
          ':cpf': cpf,
        },
      }));

      console.log('CPF atualizado com sucesso');
    }

    // Cria cliente no Asaas
    console.log('Criando cliente no Asaas com os dados:', {
      name: name || user.name,
      email: user.email,
      cpfMasked: cpf.replace(/\d/g, '*')
    });

    const customer = await createAsaasCustomer({
      name: name || user.name,
      cpfCnpj: cpf,
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

    // Cria assinatura
    const subscriptionData = {
      customer: customer.id,
      value: config.SUBSCRIPTION_VALUE,
      nextDueDate: new Date().toISOString().split('T')[0],
      creditCard: {
        holderName: name,
        number: cardNumber,
        expiryMonth: cardExpiry.split('/')[0],
        expiryYear: cardExpiry.split('/')[1],
        ccv: cardCvc,
      },
      creditCardHolderInfo: {
        name,
        email: user.email,
        cpfCnpj: cpf,
        postalCode,
        addressNumber,
        phone,
      },
      remoteIp: clientIp,
    };

    const subscription = await createAsaasSubscription(subscriptionData);

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
