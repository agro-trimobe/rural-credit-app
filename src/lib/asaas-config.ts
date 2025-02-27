// Define URL padrão baseada no ambiente
const apiBaseUrl = process.env.ASAAS_API_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://api.asaas.com'
    : 'https://api-sandbox.asaas.com'
);

// Formata a chave da API adicionando o prefixo $ se necessário
const formatApiKey = (key?: string) => {
  if (!key) return undefined;
  // Sempre remove o $ do início (caso exista) e adiciona novamente
  const cleanKey = key.startsWith('$') ? key.slice(1) : key;
  return `$${cleanKey}`;
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
  TRIAL_PERIOD_MONTHS: 0, // Período de teste em meses (0 = sem período de teste em meses)
  SUBSCRIPTION_PERIOD_MONTHS: 1, // Período padrão para próximo vencimento (1 mês)
};

// Validação e retorno da configuração
export function validateAsaasConfig() {
  const formattedKey = formatApiKey(process.env.ASAAS_API_KEY);
  if (!formattedKey) {
    throw new Error(
      'ASAAS_API_KEY é obrigatória. Crie uma conta no ambiente sandbox (https://sandbox.asaas.com) e configure a chave de API.'
    );
  }
  return {
    ...asaasConfig,
    API_KEY: formattedKey
  };
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

  const response = await fetch(`${config.API_URL}/v3/customers`, {
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

// Função auxiliar para traduzir erros do Asaas
function translateAsaasError(error: any): string {
  if (!error || !error.errors || !error.errors.length) {
    return 'Erro desconhecido ao processar o pagamento.';
  }

  const errorMap: { [key: string]: string } = {
    'invalid_creditCard': 'Dados do cartão de crédito inválidos. Verifique todas as informações.',
    'expired_creditCard': 'Cartão de crédito vencido. Por favor, use um cartão válido.',
    'invalid_creditCardNumber': 'Número do cartão de crédito inválido. Verifique os dígitos.',
    'invalid_creditCardHolderName': 'Nome do titular do cartão inválido.',
    'invalid_creditCardExpiryMonth': 'Mês de validade do cartão inválido.',
    'invalid_creditCardExpiryYear': 'Ano de validade do cartão inválido.',
    'invalid_creditCardCcv': 'Código de segurança do cartão inválido.',
    'invalid_creditCardHolderInfo': 'Informações do titular do cartão inválidas.',
    'invalid_creditCardHolderPhone': 'Telefone do titular do cartão inválido.',
    'invalid_creditCardHolderEmail': 'E-mail do titular do cartão inválido.',
    'invalid_creditCardHolderCpfCnpj': 'CPF/CNPJ do titular do cartão inválido.',
    'invalid_creditCardHolderPostalCode': 'CEP do titular do cartão inválido.',
    'invalid_creditCardHolderAddressNumber': 'Número do endereço do titular do cartão inválido.',
  };

  const firstError = error.errors[0];
  // Se temos uma tradução específica, usamos ela, senão usamos a descrição do erro
  // Se não temos nem descrição, usamos uma mensagem genérica
  return errorMap[firstError.code] || 
         firstError.description || 
         'Erro ao processar o pagamento. Verifique os dados do cartão.';
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
    phone: string;
  };
  remoteIp: string;
}): Promise<AsaasSubscription> {
  const config = validateAsaasConfig();

  // Calcular próxima data de vencimento (1 mês a partir de hoje)
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  // Garantir que sempre tenhamos um número de telefone válido
  const phone = data.creditCardHolderInfo.phone 
    ? removeNonNumeric(data.creditCardHolderInfo.phone)
    : '11999999999'; // Número padrão caso não seja fornecido
  
  // Garantir que sempre tenhamos um número de endereço
  const addressNumber = data.creditCardHolderInfo.addressNumber || '0';
  
  const requestData = {
    customer: data.customer,
    billingType: 'CREDIT_CARD',
    value: data.value,
    nextDueDate: nextDueDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
    cycle: 'MONTHLY',
    description: 'Assinatura Rural Credit App',
    creditCard: {
      holderName: data.creditCard.holderName,
      number: data.creditCard.number,
      expiryMonth: data.creditCard.expiryMonth,
      expiryYear: data.creditCard.expiryYear,
      ccv: data.creditCard.ccv,
    },
    creditCardHolderInfo: {
      name: data.creditCardHolderInfo.name,
      email: data.creditCardHolderInfo.email,
      cpfCnpj: removeNonNumeric(data.creditCardHolderInfo.cpfCnpj),
      postalCode: removeNonNumeric(data.creditCardHolderInfo.postalCode),
      addressNumber: addressNumber,
      phone: phone,
    },
    remoteIp: data.remoteIp
  };

  console.log('Criando assinatura no Asaas:', requestData);

  const response = await fetch(`${config.API_URL}/v3/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': config.API_KEY!
    },
    body: JSON.stringify(requestData)
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error('Erro ao criar assinatura:', responseData);
    throw new Error(translateAsaasError(responseData));
  }

  return responseData;
}
