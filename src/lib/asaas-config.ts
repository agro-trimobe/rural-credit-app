// Define URL padrão baseada no ambiente
const apiBaseUrl = process.env.ASAAS_API_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3'
);

// Formata a chave da API adicionando o prefixo $ se necessário
const formatApiKey = (key?: string) => {
  if (!key) return undefined;
  return key.startsWith('$') ? key : `$${key}`;
};

// Remove caracteres não numéricos
const removeNonNumeric = (str: string) => {
  return str.replace(/\D/g, '');
};

// Configuração base do Asaas
const asaasConfig = {
  API_URL: apiBaseUrl,
  API_KEY: formatApiKey(process.env.ASAAS_API_KEY),
  SUBSCRIPTION_VALUE: 47.90,
  TRIAL_PERIOD_DAYS: 7,
};

// Validação e retorno da configuração
export function validateAsaasConfig() {
  if (!process.env.ASAAS_API_KEY) {
    throw new Error(
      'ASAAS_API_KEY é obrigatória. Crie uma conta no ambiente sandbox (https://sandbox.asaas.com) e configure a chave de API.'
    );
  }
  return asaasConfig;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  value: number;
  nextDueDate: string;
  status: string;
}

export async function createAsaasCustomer(data: {
  name: string;
  cpfCnpj: string;
  email: string;
}): Promise<AsaasCustomer> {
  const config = validateAsaasConfig();
  
  const requestData = {
    name: data.name,
    cpfCnpj: removeNonNumeric(data.cpfCnpj),
    email: data.email,
    notificationDisabled: true
  };

  console.log('Criando cliente no Asaas:', requestData);

  const response = await fetch(`${config.API_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': config.API_KEY!
    },
    body: JSON.stringify(requestData)
  });

  // Log da resposta bruta para debug
  const responseText = await response.text();
  console.log('Resposta bruta do Asaas:', {
    status: response.status,
    statusText: response.statusText,
    body: responseText
  });

  // Tenta fazer o parse do JSON apenas se houver conteúdo
  let responseData;
  try {
    responseData = responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error('Erro ao fazer parse da resposta:', error);
    throw new Error(`Falha ao processar resposta do Asaas. Status: ${response.status}, Resposta: ${responseText}`);
  }

  if (!response.ok) {
    console.error('Erro ao criar cliente:', {
      status: response.status,
      statusText: response.statusText,
      error: responseData
    });
    throw new Error(`Falha ao criar cliente no Asaas: ${JSON.stringify(responseData || 'Sem resposta')}`);
  }

  if (!responseData) {
    throw new Error('Resposta vazia do Asaas');
  }

  console.log('Cliente criado com sucesso:', responseData);
  return responseData;
}

export async function createAsaasSubscription(data: {
  customer: string;
  value: number;
  nextDueDate: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone?: string; 
  };
  remoteIp: string;
}): Promise<AsaasSubscription> {
  const config = validateAsaasConfig();

  const requestData = {
    customer: data.customer,
    billingType: 'CREDIT_CARD' as const,
    value: data.value,
    nextDueDate: data.nextDueDate,
    cycle: 'MONTHLY' as const,
    description: 'Assinatura Rural Credit App',
    creditCard: {
      holderName: data.creditCard.holderName,
      number: removeNonNumeric(data.creditCard.number),
      expiryMonth: data.creditCard.expiryMonth,
      expiryYear: data.creditCard.expiryYear.length === 2 
        ? `20${data.creditCard.expiryYear}` 
        : data.creditCard.expiryYear,
      ccv: data.creditCard.ccv
    },
    creditCardHolderInfo: {
      name: data.creditCardHolderInfo.name,
      email: data.creditCardHolderInfo.email,
      cpfCnpj: removeNonNumeric(data.creditCardHolderInfo.cpfCnpj),
      postalCode: removeNonNumeric(data.creditCardHolderInfo.postalCode),
      addressNumber: data.creditCardHolderInfo.addressNumber,
      phone: data.creditCardHolderInfo.phone || '11999999999' 
    },
    remoteIp: data.remoteIp
  };

  console.log('Criando assinatura no Asaas:', requestData);

  const response = await fetch(`${config.API_URL}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': config.API_KEY!
    },
    body: JSON.stringify(requestData)
  });

  // Log da resposta bruta para debug
  const responseText = await response.text();
  console.log('Resposta bruta do Asaas:', {
    status: response.status,
    statusText: response.statusText,
    body: responseText
  });

  // Tenta fazer o parse do JSON apenas se houver conteúdo
  let responseData;
  try {
    responseData = responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error('Erro ao fazer parse da resposta:', error);
    throw new Error(`Falha ao processar resposta do Asaas. Status: ${response.status}, Resposta: ${responseText}`);
  }

  if (!response.ok) {
    console.error('Erro ao criar assinatura:', {
      status: response.status,
      statusText: response.statusText,
      error: responseData
    });
    throw new Error(`Falha ao criar assinatura no Asaas: ${JSON.stringify(responseData || 'Sem resposta')}`);
  }

  if (!responseData) {
    throw new Error('Resposta vazia do Asaas');
  }

  console.log('Assinatura criada com sucesso:', responseData);
  return responseData;
}
