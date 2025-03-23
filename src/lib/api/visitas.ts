import { Visita } from '@/lib/crm-utils';
import { visitaRepository } from '@/lib/repositories';

// Obter o tenant ID da sessão (temporariamente fixo para testes)
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default-tenant';

export const visitasApi = {
  listarVisitas: async (): Promise<Visita[]> => {
    try {
      console.log('API: Listando visitas do DynamoDB');
      const visitas = await visitaRepository.listarVisitas(TENANT_ID);
      return visitas;
    } catch (error) {
      console.error('Erro ao listar visitas:', error);
      throw new Error(`Falha ao listar visitas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  buscarVisitaPorId: async (id: string): Promise<Visita | null> => {
    try {
      console.log(`API: Buscando visita ${id} do DynamoDB`);
      const visita = await visitaRepository.buscarVisitaPorId(TENANT_ID, id);
      return visita;
    } catch (error) {
      console.error(`Erro ao buscar visita ${id}:`, error);
      throw new Error(`Falha ao buscar visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarVisitasPorCliente: async (clienteId: string): Promise<Visita[]> => {
    try {
      console.log(`API: Listando visitas do cliente ${clienteId} do DynamoDB`);
      const visitas = await visitaRepository.listarVisitasPorCliente(TENANT_ID, clienteId);
      return visitas;
    } catch (error) {
      console.error(`Erro ao listar visitas do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar visitas do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarVisitasPorPropriedade: async (propriedadeId: string): Promise<Visita[]> => {
    try {
      console.log(`API: Listando visitas da propriedade ${propriedadeId} do DynamoDB`);
      const visitas = await visitaRepository.listarVisitasPorPropriedade(TENANT_ID, propriedadeId);
      return visitas;
    } catch (error) {
      console.error(`Erro ao listar visitas da propriedade ${propriedadeId}:`, error);
      throw new Error(`Falha ao listar visitas da propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarVisitasPorProjeto: async (projetoId: string): Promise<Visita[]> => {
    try {
      console.log(`API: Listando visitas do projeto ${projetoId} do DynamoDB`);
      const visitas = await visitaRepository.listarVisitasPorProjeto(TENANT_ID, projetoId);
      return visitas;
    } catch (error) {
      console.error(`Erro ao listar visitas do projeto ${projetoId}:`, error);
      throw new Error(`Falha ao listar visitas do projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  criarVisita: async (visita: Omit<Visita, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Visita> => {
    try {
      console.log('API: Criando visita no DynamoDB');
      const novaVisita = await visitaRepository.criarVisita(TENANT_ID, visita);
      return novaVisita;
    } catch (error) {
      console.error('Erro ao criar visita:', error);
      throw new Error(`Falha ao criar visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarVisita: async (id: string, visita: Partial<Omit<Visita, 'id' | 'dataCriacao'>>): Promise<Visita | null> => {
    try {
      console.log(`API: Atualizando visita ${id} no DynamoDB`);
      const visitaAtualizada = await visitaRepository.atualizarVisita(TENANT_ID, id, visita);
      return visitaAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar visita ${id}:`, error);
      throw new Error(`Falha ao atualizar visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  excluirVisita: async (id: string): Promise<boolean> => {
    try {
      console.log(`API: Excluindo visita ${id} do DynamoDB`);
      const resultado = await visitaRepository.excluirVisita(TENANT_ID, id);
      return resultado;
    } catch (error) {
      console.error(`Erro ao excluir visita ${id}:`, error);
      throw new Error(`Falha ao excluir visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  adicionarFotos: async (id: string, fotos: string[]): Promise<Visita | null> => {
    try {
      console.log(`API: Adicionando fotos à visita ${id} no DynamoDB`);
      // Primeiro, buscar a visita atual para obter as fotos existentes
      const visita = await visitaRepository.buscarVisitaPorId(TENANT_ID, id);
      
      if (!visita) {
        console.error(`Visita ${id} não encontrada`);
        return null;
      }
      
      // Combinar as fotos existentes com as novas fotos
      const fotosAtualizadas = [...(visita.fotos || []), ...fotos];
      
      // Atualizar a visita com as novas fotos
      const visitaAtualizada = await visitaRepository.atualizarVisita(TENANT_ID, id, {
        fotos: fotosAtualizadas
      });
      
      return visitaAtualizada;
    } catch (error) {
      console.error(`Erro ao adicionar fotos à visita ${id}:`, error);
      throw new Error(`Falha ao adicionar fotos à visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarStatusVisita: async (id: string, status: 'Agendada' | 'Realizada' | 'Cancelada'): Promise<Visita | null> => {
    try {
      console.log(`API: Atualizando status da visita ${id} para ${status} no DynamoDB`);
      // Utilizamos o método atualizarVisita existente, mas passando apenas o campo status
      const visitaAtualizada = await visitaRepository.atualizarVisita(TENANT_ID, id, { status });
      return visitaAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar status da visita ${id}:`, error);
      throw new Error(`Falha ao atualizar status da visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
