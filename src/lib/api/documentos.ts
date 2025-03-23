import { Documento } from '@/lib/crm-utils';
import { documentoRepository } from '@/lib/repositories';

// Obter o tenant ID da sessão (temporariamente fixo para testes)
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default-tenant';

export const documentosApi = {
  listarDocumentos: async (): Promise<Documento[]> => {
    try {
      console.log('API: Listando documentos do DynamoDB');
      const documentos = await documentoRepository.listarDocumentos(TENANT_ID);
      return documentos;
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      throw new Error(`Falha ao listar documentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  buscarDocumentoPorId: async (id: string): Promise<Documento | null> => {
    try {
      console.log(`API: Buscando documento ${id} do DynamoDB`);
      const documento = await documentoRepository.buscarDocumentoPorId(TENANT_ID, id);
      return documento;
    } catch (error) {
      console.error(`Erro ao buscar documento ${id}:`, error);
      throw new Error(`Falha ao buscar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarDocumentosPorCliente: async (clienteId: string): Promise<Documento[]> => {
    try {
      console.log(`API: Listando documentos do cliente ${clienteId} do DynamoDB`);
      const documentos = await documentoRepository.listarDocumentosPorCliente(TENANT_ID, clienteId);
      return documentos;
    } catch (error) {
      console.error(`Erro ao listar documentos do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar documentos do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarDocumentosPorTipo: async (tipo: string): Promise<Documento[]> => {
    try {
      console.log(`API: Listando documentos do tipo ${tipo} do DynamoDB`);
      const documentos = await documentoRepository.listarDocumentosPorTipo(TENANT_ID, tipo);
      return documentos;
    } catch (error) {
      console.error(`Erro ao listar documentos do tipo ${tipo}:`, error);
      throw new Error(`Falha ao listar documentos do tipo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarDocumentosPorProjeto: async (projetoId: string): Promise<Documento[]> => {
    try {
      console.log(`API: Listando documentos do projeto ${projetoId} do DynamoDB`);
      const documentos = await documentoRepository.listarDocumentosPorProjeto(TENANT_ID, projetoId);
      return documentos;
    } catch (error) {
      console.error(`Erro ao listar documentos do projeto ${projetoId}:`, error);
      throw new Error(`Falha ao listar documentos do projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  listarDocumentosPorVisita: async (visitaId: string): Promise<Documento[]> => {
    try {
      console.log(`API: Listando documentos da visita ${visitaId} do DynamoDB`);
      const documentos = await documentoRepository.listarDocumentosPorVisita(TENANT_ID, visitaId);
      return documentos;
    } catch (error) {
      console.error(`Erro ao listar documentos da visita ${visitaId}:`, error);
      throw new Error(`Falha ao listar documentos da visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  criarDocumento: async (documento: Omit<Documento, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Documento> => {
    try {
      console.log('API: Criando documento no DynamoDB');
      const novoDocumento = await documentoRepository.criarDocumento(TENANT_ID, documento);
      return novoDocumento;
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      throw new Error(`Falha ao criar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarDocumento: async (id: string, documento: Partial<Omit<Documento, 'id' | 'dataCriacao'>>): Promise<Documento | null> => {
    try {
      console.log(`API: Atualizando documento ${id} no DynamoDB`);
      const documentoAtualizado = await documentoRepository.atualizarDocumento(TENANT_ID, id, documento);
      return documentoAtualizado;
    } catch (error) {
      console.error(`Erro ao atualizar documento ${id}:`, error);
      throw new Error(`Falha ao atualizar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarStatusDocumento: async (id: string, status: string): Promise<Documento | null> => {
    try {
      console.log(`API: Atualizando status do documento ${id} para ${status} no DynamoDB`);
      // Utilizamos o método atualizarDocumento existente, mas passando apenas o campo status
      const documentoAtualizado = await documentoRepository.atualizarDocumento(TENANT_ID, id, { status });
      return documentoAtualizado;
    } catch (error) {
      console.error(`Erro ao atualizar status do documento ${id}:`, error);
      throw new Error(`Falha ao atualizar status do documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  excluirDocumento: async (id: string): Promise<boolean> => {
    try {
      console.log(`API: Excluindo documento ${id} do DynamoDB`);
      const resultado = await documentoRepository.excluirDocumento(TENANT_ID, id);
      return resultado;
    } catch (error) {
      console.error(`Erro ao excluir documento ${id}:`, error);
      throw new Error(`Falha ao excluir documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
