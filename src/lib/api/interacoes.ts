import { Interacao } from '@/lib/crm-utils';

/**
 * API de interações para o lado do cliente
 * Usa as APIs REST para acessar os dados em vez de acessar o DynamoDB diretamente
 */
export const interacoesApi = {
  listarInteracoes: async (): Promise<Interacao[]> => {
    try {
      const response = await fetch('/api/interacoes');
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao listar interações:', data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao listar interações:', error);
      return [];
    }
  },

  buscarInteracaoPorId: async (id: string): Promise<Interacao | null> => {
    try {
      const response = await fetch(`/api/interacoes/${id}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao buscar interação ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao buscar interação ${id}:`, error);
      return null;
    }
  },

  listarInteracoesPorCliente: async (clienteId: string): Promise<Interacao[]> => {
    try {
      const response = await fetch(`/api/interacoes/cliente/${clienteId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar interações do cliente ${clienteId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar interações do cliente ${clienteId}:`, error);
      return [];
    }
  },

  listarInteracoesPorData: async (data: string): Promise<Interacao[]> => {
    try {
      const response = await fetch(`/api/interacoes/data/${data}`);
      const responseData = await response.json();
      
      if (responseData.status === 'error') {
        console.error(`Erro ao listar interações por data:`, responseData.message);
        return [];
      }
      
      return responseData.data;
    } catch (error) {
      console.error(`Erro ao listar interações por data:`, error);
      return [];
    }
  },

  criarInteracao: async (interacao: Omit<Interacao, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Interacao> => {
    try {
      const response = await fetch('/api/interacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interacao)
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao criar interação:', data.message);
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao criar interação:', error);
      throw new Error(`Falha ao criar interação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarInteracao: async (id: string, interacao: Partial<Omit<Interacao, 'id' | 'dataCriacao'>>): Promise<Interacao | null> => {
    try {
      const response = await fetch(`/api/interacoes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interacao)
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar interação ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar interação ${id}:`, error);
      return null;
    }
  },

  excluirInteracao: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/interacoes/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao excluir interação ${id}:`, data.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir interação ${id}:`, error);
      return false;
    }
  }
};
