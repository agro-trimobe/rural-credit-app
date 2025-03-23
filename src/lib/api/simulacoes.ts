import { Simulacao } from '@/lib/crm-utils';
import { simulacaoRepository } from '@/lib/repositories';

// Obter o tenant ID da sessão (temporariamente fixo para testes)
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default-tenant';

export const simulacoesApi = {
  listarSimulacoes: async (): Promise<Simulacao[]> => {
    try {
      console.log('API: Listando simulações do DynamoDB');
      const simulacoes = await simulacaoRepository.listarSimulacoes(TENANT_ID);
      return simulacoes;
    } catch (error) {
      console.error('Erro ao listar simulações:', error);
      throw new Error(`Falha ao listar simulações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  buscarSimulacaoPorId: async (id: string): Promise<Simulacao | null> => {
    try {
      console.log(`API: Buscando simulação ${id} do DynamoDB`);
      const simulacao = await simulacaoRepository.buscarSimulacaoPorId(TENANT_ID, id);
      return simulacao;
    } catch (error) {
      console.error(`Erro ao buscar simulação ${id}:`, error);
      throw new Error(`Falha ao buscar simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarSimulacoesPorCliente: async (clienteId: string): Promise<Simulacao[]> => {
    try {
      console.log(`API: Listando simulações do cliente ${clienteId} do DynamoDB`);
      const simulacoes = await simulacaoRepository.listarSimulacoesPorCliente(TENANT_ID, clienteId);
      return simulacoes;
    } catch (error) {
      console.error(`Erro ao listar simulações do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar simulações do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarSimulacoesPorProjeto: async (projetoId: string): Promise<Simulacao[]> => {
    try {
      console.log(`API: Listando simulações do projeto ${projetoId} do DynamoDB`);
      const simulacoes = await simulacaoRepository.listarSimulacoesPorProjeto(TENANT_ID, projetoId);
      return simulacoes;
    } catch (error) {
      console.error(`Erro ao listar simulações do projeto ${projetoId}:`, error);
      throw new Error(`Falha ao listar simulações do projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarSimulacoesPorLinha: async (linhaCredito: string): Promise<Simulacao[]> => {
    try {
      console.log(`API: Listando simulações da linha de crédito ${linhaCredito} do DynamoDB`);
      const simulacoes = await simulacaoRepository.listarSimulacoesPorLinha(TENANT_ID, linhaCredito);
      return simulacoes;
    } catch (error) {
      console.error(`Erro ao listar simulações da linha de crédito ${linhaCredito}:`, error);
      throw new Error(`Falha ao listar simulações da linha de crédito: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  criarSimulacao: async (simulacao: Omit<Simulacao, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Simulacao> => {
    try {
      console.log('API: Criando simulação no DynamoDB');
      const novaSimulacao = await simulacaoRepository.criarSimulacao(TENANT_ID, simulacao);
      return novaSimulacao;
    } catch (error) {
      console.error('Erro ao criar simulação:', error);
      throw new Error(`Falha ao criar simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarSimulacao: async (id: string, simulacao: Partial<Omit<Simulacao, 'id' | 'dataCriacao'>>): Promise<Simulacao | null> => {
    try {
      console.log(`API: Atualizando simulação ${id} no DynamoDB`);
      const simulacaoAtualizada = await simulacaoRepository.atualizarSimulacao(TENANT_ID, id, simulacao);
      return simulacaoAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar simulação ${id}:`, error);
      throw new Error(`Falha ao atualizar simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  excluirSimulacao: async (id: string): Promise<boolean> => {
    try {
      console.log(`API: Excluindo simulação ${id} do DynamoDB`);
      const resultado = await simulacaoRepository.excluirSimulacao(TENANT_ID, id);
      return resultado;
    } catch (error) {
      console.error(`Erro ao excluir simulação ${id}:`, error);
      throw new Error(`Falha ao excluir simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  calcularParcela: async (
    valorFinanciamento: number,
    taxaJuros: number,
    prazoTotal: number,
    carencia: number
  ): Promise<number> => {
    try {
      console.log('API: Calculando parcela de financiamento');
      
      // Converter taxa anual para mensal
      const taxaMensal = Math.pow(1 + taxaJuros / 100, 1 / 12) - 1;
      
      // Número de parcelas (prazo total menos carência)
      const numParcelas = prazoTotal - carencia;
      
      // Cálculo da parcela usando a fórmula de amortização
      // P = VP * [r * (1 + r)^n] / [(1 + r)^n - 1]
      const parcela = valorFinanciamento * 
        (taxaMensal * Math.pow(1 + taxaMensal, numParcelas)) / 
        (Math.pow(1 + taxaMensal, numParcelas) - 1);
      
      return Math.round(parcela * 100) / 100; // Arredondar para 2 casas decimais
    } catch (error) {
      console.error('Erro ao calcular parcela:', error);
      throw new Error(`Falha ao calcular parcela: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
