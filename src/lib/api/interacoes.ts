import { Interacao } from '@/lib/crm-utils';
import { interacaoRepository } from '@/lib/repositories';

// Obter o tenant ID da sessão (temporariamente fixo para testes)
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default-tenant';

export const interacoesApi = {
  listarInteracoes: async (): Promise<Interacao[]> => {
    try {
      console.log('API: Listando interações do DynamoDB');
      const interacoes = await interacaoRepository.listarInteracoes(TENANT_ID);
      return interacoes;
    } catch (error) {
      console.error('Erro ao listar interações:', error);
      throw new Error(`Falha ao listar interações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  buscarInteracaoPorId: async (id: string): Promise<Interacao | null> => {
    try {
      console.log(`API: Buscando interação ${id} do DynamoDB`);
      const interacao = await interacaoRepository.buscarInteracaoPorId(TENANT_ID, id);
      return interacao;
    } catch (error) {
      console.error(`Erro ao buscar interação ${id}:`, error);
      throw new Error(`Falha ao buscar interação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarInteracoesPorCliente: async (clienteId: string): Promise<Interacao[]> => {
    try {
      console.log(`API: Listando interações do cliente ${clienteId} do DynamoDB`);
      const interacoes = await interacaoRepository.listarInteracoesPorCliente(TENANT_ID, clienteId);
      return interacoes;
    } catch (error) {
      console.error(`Erro ao listar interações do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar interações do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarInteracoesPorData: async (data: string): Promise<Interacao[]> => {
    try {
      console.log(`API: Listando interações da data ${data} do DynamoDB`);
      const interacoes = await interacaoRepository.listarInteracoesPorData(TENANT_ID, data);
      return interacoes;
    } catch (error) {
      console.error(`Erro ao listar interações por data:`, error);
      throw new Error(`Falha ao listar interações por data: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  criarInteracao: async (interacao: Omit<Interacao, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Interacao> => {
    try {
      console.log('API: Criando interação no DynamoDB');
      const novaInteracao = await interacaoRepository.criarInteracao(TENANT_ID, interacao);
      return novaInteracao;
    } catch (error) {
      console.error('Erro ao criar interação:', error);
      throw new Error(`Falha ao criar interação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarInteracao: async (id: string, interacao: Partial<Omit<Interacao, 'id' | 'dataCriacao'>>): Promise<Interacao | null> => {
    try {
      console.log(`API: Atualizando interação ${id} no DynamoDB`);
      const interacaoAtualizada = await interacaoRepository.atualizarInteracao(TENANT_ID, id, interacao);
      return interacaoAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar interação ${id}:`, error);
      throw new Error(`Falha ao atualizar interação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  excluirInteracao: async (id: string): Promise<boolean> => {
    try {
      console.log(`API: Excluindo interação ${id} do DynamoDB`);
      const resultado = await interacaoRepository.excluirInteracao(TENANT_ID, id);
      return resultado;
    } catch (error) {
      console.error(`Erro ao excluir interação ${id}:`, error);
      throw new Error(`Falha ao excluir interação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
