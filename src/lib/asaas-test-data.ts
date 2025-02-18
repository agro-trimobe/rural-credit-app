// Cartões de teste para o ambiente sandbox do Asaas
// Fonte: https://docs.asaas.com/docs/testando-os-cartoes

export const TEST_CREDIT_CARDS = {
  // Cartão que sempre será aprovado
  SUCCESS: {
    number: '5162306219378829',
    holderName: 'TEST CREDIT CARD',
    expiryMonth: '05',
    expiryYear: '2025',
    ccv: '318',
  },

  // Cartão que sempre será recusado
  FAILURE: {
    number: '5162306219378828',
    holderName: 'TEST CREDIT CARD',
    expiryMonth: '05',
    expiryYear: '2025',
    ccv: '318',
  },

  // Cartão que sempre retornará erro de comunicação
  TIMEOUT: {
    number: '5162306219378827',
    holderName: 'TEST CREDIT CARD',
    expiryMonth: '05',
    expiryYear: '2025',
    ccv: '318',
  }
};

// CEPs válidos para teste
export const TEST_POSTAL_CODES = [
  '01001000', // São Paulo - SP
  '20010010', // Rio de Janeiro - RJ
  '70070900', // Brasília - DF
];

// Dados de exemplo para testes
export const TEST_USER_DATA = {
  name: 'João da Silva',
  email: 'joao.silva@example.com',
  cpf: '11111111111',
  addressNumber: '123',
};
