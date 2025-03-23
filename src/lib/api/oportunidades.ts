import { Oportunidade } from '@/lib/crm-utils';
import { oportunidadeRepository } from '@/lib/repositories';

// Obter o tenant ID da sessão (temporariamente fixo para testes)
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default-tenant';

export const oportunidadesApi = {
  listarOportunidades: async (): Promise<Oportunidade[]> => {
    try {
      console.log('API: Listando oportunidades do DynamoDB');
      const oportunidades = await oportunidadeRepository.listarOportunidades(TENANT_ID);
      return oportunidades;
    } catch (error) {
      console.error('Erro ao listar oportunidades:', error);
      throw new Error(`Falha ao listar oportunidades: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  buscarOportunidadePorId: async (id: string): Promise<Oportunidade | null> => {
    try {
      console.log(`API: Buscando oportunidade ${id} do DynamoDB`);
      const oportunidade = await oportunidadeRepository.buscarOportunidadePorId(TENANT_ID, id);
      return oportunidade;
    } catch (error) {
      console.error(`Erro ao buscar oportunidade ${id}:`, error);
      throw new Error(`Falha ao buscar oportunidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarOportunidadesPorCliente: async (clienteId: string): Promise<Oportunidade[]> => {
    try {
      console.log(`API: Listando oportunidades do cliente ${clienteId} do DynamoDB`);
      const oportunidades = await oportunidadeRepository.listarOportunidadesPorCliente(TENANT_ID, clienteId);
      return oportunidades;
    } catch (error) {
      console.error(`Erro ao listar oportunidades do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar oportunidades do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarOportunidadesPorStatus: async (status: string): Promise<Oportunidade[]> => {
    try {
      console.log(`API: Listando oportunidades com status ${status} do DynamoDB`);
      const oportunidades = await oportunidadeRepository.listarOportunidadesPorStatus(TENANT_ID, status);
      return oportunidades;
    } catch (error) {
      console.error(`Erro ao listar oportunidades com status ${status}:`, error);
      throw new Error(`Falha ao listar oportunidades por status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  criarOportunidade: async (oportunidade: Omit<Oportunidade, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Oportunidade> => {
    try {
      console.log('API: Criando oportunidade no DynamoDB');
      const novaOportunidade = await oportunidadeRepository.criarOportunidade(TENANT_ID, oportunidade);
      return novaOportunidade;
    } catch (error) {
      console.error('Erro ao criar oportunidade:', error);
      throw new Error(`Falha ao criar oportunidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarOportunidade: async (id: string, oportunidade: Partial<Omit<Oportunidade, 'id' | 'dataCriacao'>>): Promise<Oportunidade | null> => {
    try {
      console.log(`API: Atualizando oportunidade ${id} no DynamoDB`);
      const oportunidadeAtualizada = await oportunidadeRepository.atualizarOportunidade(TENANT_ID, id, oportunidade);
      return oportunidadeAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar oportunidade ${id}:`, error);
      throw new Error(`Falha ao atualizar oportunidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  excluirOportunidade: async (id: string): Promise<boolean> => {
    try {
      console.log(`API: Excluindo oportunidade ${id} do DynamoDB`);
      const resultado = await oportunidadeRepository.excluirOportunidade(TENANT_ID, id);
      return resultado;
    } catch (error) {
      console.error(`Erro ao excluir oportunidade ${id}:`, error);
      throw new Error(`Falha ao excluir oportunidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  obterEstatisticas: async () => {
    try {
      console.log('API: Obtendo estatísticas de oportunidades do DynamoDB');
      const oportunidades = await oportunidadeRepository.listarOportunidades(TENANT_ID);
      
      // Calcular estatísticas por status
      const porStatus: Record<string, number> = {};
      oportunidades.forEach(oportunidade => {
        if (!porStatus[oportunidade.status]) {
          porStatus[oportunidade.status] = 0;
        }
        porStatus[oportunidade.status]++;
      });
      
      // Calcular valor total das oportunidades
      const valorTotal = oportunidades.reduce((total, oportunidade) => {
        if (oportunidade.status !== 'Perdido' && oportunidade.status !== 'Contato Inicial') {
          return total + (oportunidade.valor || 0);
        }
        return total;
      }, 0);
      
      return {
        total: oportunidades.length,
        porStatus,
        valorTotal,
        abertas: oportunidades.filter(o => o.status === 'Contato Inicial').length,
        emNegociacao: oportunidades.filter(o => o.status === 'Negociação').length,
        ganhas: oportunidades.filter(o => o.status === 'Ganho').length,
        perdidas: oportunidades.filter(o => o.status === 'Perdido').length
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de oportunidades:', error);
      throw new Error(`Falha ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
