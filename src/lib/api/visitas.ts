import { Visita } from '@/lib/crm-utils';

/**
 * API de visitas para o lado do cliente
 * Usa as APIs REST para acessar os dados em vez de acessar o DynamoDB diretamente
 */
export const visitasApi = {
  listarVisitas: async (): Promise<Visita[]> => {
    try {
      const response = await fetch('/api/visitas');
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao listar visitas:', data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao listar visitas:', error);
      return [];
    }
  },

  buscarVisitaPorId: async (id: string): Promise<Visita | null> => {
    try {
      const response = await fetch(`/api/visitas/${id}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao buscar visita ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao buscar visita ${id}:`, error);
      return null;
    }
  },

  listarVisitasPorCliente: async (clienteId: string): Promise<Visita[]> => {
    try {
      const response = await fetch(`/api/visitas/cliente/${clienteId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar visitas do cliente ${clienteId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar visitas do cliente ${clienteId}:`, error);
      return [];
    }
  },

  listarVisitasPorPropriedade: async (propriedadeId: string): Promise<Visita[]> => {
    try {
      const response = await fetch(`/api/visitas/propriedade/${propriedadeId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar visitas da propriedade ${propriedadeId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar visitas da propriedade ${propriedadeId}:`, error);
      return [];
    }
  },

  listarVisitasPorProjeto: async (projetoId: string): Promise<Visita[]> => {
    try {
      const response = await fetch(`/api/visitas/projeto/${projetoId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar visitas do projeto ${projetoId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar visitas do projeto ${projetoId}:`, error);
      return [];
    }
  },

  criarVisita: async (visita: Omit<Visita, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Visita> => {
    try {
      const response = await fetch('/api/visitas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visita),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao criar visita:', error);
      throw error;
    }
  },

  atualizarVisita: async (id: string, visita: Partial<Omit<Visita, 'id' | 'dataCriacao'>>): Promise<Visita | null> => {
    try {
      const response = await fetch(`/api/visitas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visita),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar visita ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar visita ${id}:`, error);
      return null;
    }
  },

  excluirVisita: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/visitas/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao excluir visita ${id}:`, data.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir visita ${id}:`, error);
      return false;
    }
  },

  adicionarFotos: async (id: string, fotos: string[]): Promise<Visita | null> => {
    try {
      const response = await fetch(`/api/visitas/${id}/fotos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fotos }),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao adicionar fotos à visita ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao adicionar fotos à visita ${id}:`, error);
      return null;
    }
  },

  atualizarStatusVisita: async (id: string, status: 'Agendada' | 'Realizada' | 'Cancelada'): Promise<Visita | null> => {
    try {
      const response = await fetch(`/api/visitas/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar status da visita ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar status da visita ${id}:`, error);
      return null;
    }
  }
};
