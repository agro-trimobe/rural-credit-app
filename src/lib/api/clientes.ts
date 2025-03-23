import { Cliente } from '@/lib/crm-utils';
import { clienteRepository } from '@/lib/repositories';

// Obter o tenant ID da sessão (temporariamente fixo para testes)
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default-tenant';

export const clientesApi = {
  listarClientes: async (): Promise<Cliente[]> => {
    try {
      console.log('API: Listando clientes do DynamoDB');
      const clientes = await clienteRepository.listarClientes(TENANT_ID);
      return clientes;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw new Error(`Falha ao listar clientes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  buscarClientePorId: async (id: string): Promise<Cliente | null> => {
    try {
      console.log(`API: Buscando cliente ${id} do DynamoDB`);
      const cliente = await clienteRepository.buscarClientePorId(TENANT_ID, id);
      return cliente;
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      throw new Error(`Falha ao buscar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  criarCliente: async (cliente: Omit<Cliente, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Cliente> => {
    try {
      console.log('API: Criando cliente no DynamoDB');
      const novoCliente = await clienteRepository.criarCliente(TENANT_ID, cliente);
      return novoCliente;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw new Error(`Falha ao criar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarCliente: async (id: string, cliente: Partial<Omit<Cliente, 'id' | 'dataCriacao'>>): Promise<Cliente | null> => {
    try {
      console.log(`API: Atualizando cliente ${id} no DynamoDB`);
      const clienteAtualizado = await clienteRepository.atualizarCliente(TENANT_ID, id, cliente);
      return clienteAtualizado;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw new Error(`Falha ao atualizar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  excluirCliente: async (id: string): Promise<boolean> => {
    try {
      console.log(`API: Excluindo cliente ${id} do DynamoDB`);
      const resultado = await clienteRepository.excluirCliente(TENANT_ID, id);
      return resultado;
    } catch (error) {
      console.error(`Erro ao excluir cliente ${id}:`, error);
      throw new Error(`Falha ao excluir cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
