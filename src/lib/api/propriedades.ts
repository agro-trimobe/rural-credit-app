import { Propriedade } from '@/lib/crm-utils';
import { propriedadeRepository } from '@/lib/repositories';

// Obter o tenant ID da sessão (temporariamente fixo para testes)
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default-tenant';

export const propriedadesApi = {
  listarPropriedades: async (): Promise<Propriedade[]> => {
    try {
      console.log('API: Listando propriedades do DynamoDB');
      const propriedades = await propriedadeRepository.listarPropriedades(TENANT_ID);
      return propriedades;
    } catch (error) {
      console.error('Erro ao listar propriedades:', error);
      throw new Error(`Falha ao listar propriedades: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  buscarPropriedadePorId: async (id: string): Promise<Propriedade | null> => {
    try {
      console.log(`API: Buscando propriedade ${id} do DynamoDB`);
      const propriedade = await propriedadeRepository.buscarPropriedadePorId(TENANT_ID, id);
      return propriedade;
    } catch (error) {
      console.error(`Erro ao buscar propriedade ${id}:`, error);
      throw new Error(`Falha ao buscar propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarPropriedadesPorCliente: async (clienteId: string): Promise<Propriedade[]> => {
    try {
      console.log(`API: Listando propriedades do cliente ${clienteId} do DynamoDB`);
      const propriedades = await propriedadeRepository.listarPropriedadesPorCliente(TENANT_ID, clienteId);
      return propriedades;
    } catch (error) {
      console.error(`Erro ao listar propriedades do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar propriedades do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  criarPropriedade: async (propriedade: Omit<Propriedade, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Propriedade> => {
    try {
      console.log('API: Criando propriedade no DynamoDB');
      const novaPropriedade = await propriedadeRepository.criarPropriedade(TENANT_ID, propriedade);
      return novaPropriedade;
    } catch (error) {
      console.error('Erro ao criar propriedade:', error);
      throw new Error(`Falha ao criar propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarPropriedade: async (id: string, propriedade: Partial<Omit<Propriedade, 'id' | 'dataCriacao'>>): Promise<Propriedade | null> => {
    try {
      console.log(`API: Atualizando propriedade ${id} no DynamoDB`);
      const propriedadeAtualizada = await propriedadeRepository.atualizarPropriedade(TENANT_ID, id, propriedade);
      return propriedadeAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar propriedade ${id}:`, error);
      throw new Error(`Falha ao atualizar propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  excluirPropriedade: async (id: string): Promise<boolean> => {
    try {
      console.log(`API: Excluindo propriedade ${id} do DynamoDB`);
      const resultado = await propriedadeRepository.excluirPropriedade(TENANT_ID, id);
      return resultado;
    } catch (error) {
      console.error(`Erro ao excluir propriedade ${id}:`, error);
      throw new Error(`Falha ao excluir propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
