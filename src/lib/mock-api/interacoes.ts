import { Interacao } from '../crm-utils'
import { gerarIdAleatorio, gerarDataAleatoria } from '../crm-utils'

// Dados mockados de interações
const interacoesMock: Interacao[] = [
  {
    id: 'int-001',
    clienteId: '1',
    tipo: 'Ligação',
    data: '2024-12-15T10:00:00Z',
    assunto: 'Apresentação de proposta',
    descricao: 'Ligação para apresentar proposta de financiamento para aquisição de maquinário',
    responsavel: 'Ana Silva',
    status: 'Concluída',
    observacoes: 'Cliente demonstrou interesse, solicitou envio de detalhes por email',
    dataCriacao: '2024-12-15T10:30:00Z',
    dataAtualizacao: '2024-12-15T10:30:00Z'
  },
  {
    id: 'int-002',
    clienteId: '1',
    tipo: 'Email',
    data: '2024-12-16T14:30:00Z',
    assunto: 'Envio de documentação',
    descricao: 'Email com detalhes da proposta e documentação necessária para análise',
    responsavel: 'Ana Silva',
    status: 'Concluída',
    dataCriacao: '2024-12-16T14:35:00Z',
    dataAtualizacao: '2024-12-16T14:35:00Z'
  },
  {
    id: 'int-003',
    clienteId: '1',
    tipo: 'Reunião',
    data: '2024-12-20T09:00:00Z',
    assunto: 'Assinatura de contrato',
    descricao: 'Reunião para assinatura do contrato de financiamento',
    responsavel: 'Carlos Mendes',
    status: 'Agendada',
    observacoes: 'Confirmar presença do cliente no dia anterior',
    dataCriacao: '2024-12-17T11:20:00Z',
    dataAtualizacao: '2024-12-17T11:20:00Z'
  },
  {
    id: 'int-004',
    clienteId: '2',
    tipo: 'Visita',
    data: '2024-12-18T14:00:00Z',
    assunto: 'Visita técnica à propriedade',
    descricao: 'Visita para avaliação da propriedade e verificação das condições para implementação do projeto',
    responsavel: 'Pedro Alves',
    status: 'Concluída',
    observacoes: 'Propriedade em excelentes condições, apta para o projeto',
    dataCriacao: '2024-12-18T17:30:00Z',
    dataAtualizacao: '2024-12-18T17:30:00Z'
  },
  {
    id: 'int-005',
    clienteId: '3',
    tipo: 'Ligação',
    data: '2024-12-19T11:00:00Z',
    assunto: 'Acompanhamento de proposta',
    descricao: 'Ligação para verificar se o cliente recebeu a proposta e tirar dúvidas',
    responsavel: 'Ana Silva',
    status: 'Em andamento',
    dataCriacao: '2024-12-19T11:15:00Z',
    dataAtualizacao: '2024-12-19T11:15:00Z'
  },
  {
    id: 'int-006',
    clienteId: '4',
    tipo: 'Email',
    data: '2024-12-14T09:45:00Z',
    assunto: 'Solicitação de documentos adicionais',
    descricao: 'Email solicitando documentos complementares para análise de crédito',
    responsavel: 'Carlos Mendes',
    status: 'Aguardando retorno',
    dataCriacao: '2024-12-14T09:50:00Z',
    dataAtualizacao: '2024-12-14T09:50:00Z'
  },
  {
    id: 'int-007',
    clienteId: '5',
    tipo: 'Reunião',
    data: '2024-12-21T10:00:00Z',
    assunto: 'Apresentação de linhas de crédito',
    descricao: 'Reunião para apresentar as opções de linhas de crédito disponíveis',
    responsavel: 'Pedro Alves',
    status: 'Agendada',
    dataCriacao: '2024-12-15T16:20:00Z',
    dataAtualizacao: '2024-12-15T16:20:00Z'
  },
  {
    id: 'int-008',
    clienteId: '2',
    tipo: 'Outro',
    data: '2024-12-13T13:30:00Z',
    assunto: 'Análise de documentação',
    descricao: 'Análise interna da documentação enviada pelo cliente',
    responsavel: 'Ana Silva',
    status: 'Concluída',
    dataCriacao: '2024-12-13T15:45:00Z',
    dataAtualizacao: '2024-12-13T15:45:00Z'
  }
];

// Simulação de delay para simular uma API real
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API mockada para interações
export const interacoesApi = {
  // Listar todas as interações
  listarInteracoes: async (): Promise<Interacao[]> => {
    await delay(500);
    return [...interacoesMock];
  },
  
  // Buscar interação por ID
  buscarInteracaoPorId: async (id: string): Promise<Interacao | null> => {
    await delay(300);
    const interacao = interacoesMock.find(i => i.id === id);
    return interacao ? { ...interacao } : null;
  },
  
  // Listar interações por cliente
  listarInteracoesPorCliente: async (clienteId: string): Promise<Interacao[]> => {
    await delay(400);
    return interacoesMock
      .filter(i => i.clienteId === clienteId)
      .map(i => ({ ...i }));
  },
  
  // Criar nova interação
  criarInteracao: async (interacao: Omit<Interacao, 'id'>): Promise<Interacao> => {
    await delay(600);
    
    // Garantir que a data fornecida pelo usuário seja preservada
    const novaInteracao: Interacao = {
      id: `int-${gerarIdAleatorio().substring(0, 6)}`,
      ...interacao,
    };
    
    // Log para debug
    console.log('Interação criada na API mockada:', novaInteracao);
    
    interacoesMock.push(novaInteracao);
    return { ...novaInteracao };
  },
  
  // Atualizar interação existente
  atualizarInteracao: async (id: string, dadosAtualizados: Partial<Interacao>): Promise<Interacao | null> => {
    await delay(500);
    
    const index = interacoesMock.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    // Log para debug
    console.log('Dados antes da atualização:', interacoesMock[index]);
    console.log('Dados para atualização:', dadosAtualizados);
    
    // Preservar a data fornecida pelo usuário
    const interacaoAtualizada: Interacao = {
      ...interacoesMock[index],
      ...dadosAtualizados,
    };
    
    // Log para debug
    console.log('Interação atualizada na API mockada:', interacaoAtualizada);
    
    interacoesMock[index] = interacaoAtualizada;
    return { ...interacaoAtualizada };
  },
  
  // Excluir interação
  excluirInteracao: async (id: string): Promise<boolean> => {
    await delay(400);
    
    const index = interacoesMock.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    interacoesMock.splice(index, 1);
    return true;
  }
};
