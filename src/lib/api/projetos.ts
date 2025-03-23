import { Projeto } from '@/lib/crm-utils';
import { projetoRepository } from '@/lib/repositories';

// Obter o tenant ID da sessão (temporariamente fixo para testes)
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default-tenant';

export const projetosApi = {
  listarProjetos: async (): Promise<Projeto[]> => {
    try {
      console.log('API: Listando projetos do DynamoDB');
      const projetos = await projetoRepository.listarProjetos(TENANT_ID);
      return projetos;
    } catch (error) {
      console.error('Erro ao listar projetos:', error);
      throw new Error(`Falha ao listar projetos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  buscarProjetoPorId: async (id: string): Promise<Projeto | null> => {
    try {
      console.log(`API: Buscando projeto ${id} do DynamoDB`);
      const projeto = await projetoRepository.buscarProjetoPorId(TENANT_ID, id);
      return projeto;
    } catch (error) {
      console.error(`Erro ao buscar projeto ${id}:`, error);
      throw new Error(`Falha ao buscar projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarProjetosPorCliente: async (clienteId: string): Promise<Projeto[]> => {
    try {
      console.log(`API: Listando projetos do cliente ${clienteId} do DynamoDB`);
      const projetos = await projetoRepository.listarProjetosPorCliente(TENANT_ID, clienteId);
      return projetos;
    } catch (error) {
      console.error(`Erro ao listar projetos do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar projetos do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarProjetosPorPropriedade: async (propriedadeId: string): Promise<Projeto[]> => {
    try {
      console.log(`API: Listando projetos da propriedade ${propriedadeId} do DynamoDB`);
      const projetos = await projetoRepository.listarProjetosPorPropriedade(TENANT_ID, propriedadeId);
      return projetos;
    } catch (error) {
      console.error(`Erro ao listar projetos da propriedade ${propriedadeId}:`, error);
      throw new Error(`Falha ao listar projetos da propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  criarProjeto: async (projeto: Omit<Projeto, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Projeto> => {
    try {
      console.log('API: Criando projeto no DynamoDB');
      const novoProjeto = await projetoRepository.criarProjeto(TENANT_ID, projeto);
      return novoProjeto;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw new Error(`Falha ao criar projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarProjeto: async (id: string, projeto: Partial<Omit<Projeto, 'id' | 'dataCriacao'>>): Promise<Projeto | null> => {
    try {
      console.log(`API: Atualizando projeto ${id} no DynamoDB`);
      const projetoAtualizado = await projetoRepository.atualizarProjeto(TENANT_ID, id, projeto);
      return projetoAtualizado;
    } catch (error) {
      console.error(`Erro ao atualizar projeto ${id}:`, error);
      throw new Error(`Falha ao atualizar projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  excluirProjeto: async (id: string): Promise<boolean> => {
    try {
      console.log(`API: Excluindo projeto ${id} do DynamoDB`);
      const resultado = await projetoRepository.excluirProjeto(TENANT_ID, id);
      return resultado;
    } catch (error) {
      console.error(`Erro ao excluir projeto ${id}:`, error);
      throw new Error(`Falha ao excluir projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
