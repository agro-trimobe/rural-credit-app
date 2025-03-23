import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Documento } from '../crm-utils';
import { DocumentoItem, documentoToItem, itemToDocumento } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';
import { uploadFile } from '../upload-utils';

const TABLE_NAME = 'RuralCredit';

export const documentoRepository = {
  async listarDocumentos(tenantId: string): Promise<Documento[]> {
    try {
      console.log(`Listando documentos para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'DOCUMENTO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} documentos`);
      
      return (response.Items || []).map(item => itemToDocumento(item as DocumentoItem));
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      throw new Error(`Falha ao listar documentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarDocumentoPorId(tenantId: string, documentoId: string): Promise<Documento | null> {
    try {
      console.log(`Buscando documento ${documentoId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `DOCUMENTO#${documentoId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Documento ${documentoId} não encontrado`);
        return null;
      }
      
      console.log(`Documento ${documentoId} encontrado`);
      return itemToDocumento(response.Item as DocumentoItem);
    } catch (error) {
      console.error(`Erro ao buscar documento ${documentoId}:`, error);
      throw new Error(`Falha ao buscar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarDocumentosPorCliente(tenantId: string, clienteId: string): Promise<Documento[]> {
    try {
      console.log(`Listando documentos para o cliente ${clienteId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
        ExpressionAttributeValues: {
          ':gsi1pk': `CLIENTE#${clienteId}`,
          ':gsi1sk': 'DOCUMENTO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} documentos para o cliente ${clienteId}`);
      
      return (response.Items || []).map(item => itemToDocumento(item as DocumentoItem));
    } catch (error) {
      console.error(`Erro ao listar documentos do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar documentos do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarDocumentosPorTipo(tenantId: string, tipo: string): Promise<Documento[]> {
    try {
      console.log(`Listando documentos do tipo ${tipo} para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk AND begins_with(GSI2SK, :gsi2sk)',
        ExpressionAttributeValues: {
          ':gsi2pk': `TIPO#${tipo}`,
          ':gsi2sk': `TENANT#${tenantId}#DOCUMENTO#`
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} documentos do tipo ${tipo}`);
      
      return (response.Items || []).map(item => itemToDocumento(item as DocumentoItem));
    } catch (error) {
      console.error(`Erro ao listar documentos do tipo ${tipo}:`, error);
      throw new Error(`Falha ao listar documentos por tipo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarDocumentosPorProjeto(tenantId: string, projetoId: string): Promise<Documento[]> {
    try {
      console.log(`Listando documentos para o projeto ${projetoId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        FilterExpression: 'projetoId = :projetoId',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'DOCUMENTO#',
          ':projetoId': projetoId
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} documentos para o projeto ${projetoId}`);
      
      return (response.Items || []).map(item => itemToDocumento(item as DocumentoItem));
    } catch (error) {
      console.error(`Erro ao listar documentos do projeto ${projetoId}:`, error);
      throw new Error(`Falha ao listar documentos do projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarDocumento(tenantId: string, documento: Omit<Documento, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Documento> {
    try {
      console.log(`Criando novo documento para o tenant ${tenantId}`);
      
      const timestamp = new Date().toISOString();
      const documentoId = uuidv4();

      // Verificar se o URL é um blob URL e fazer upload para o servidor
      let documentoUrl = documento.url;
      let uploadResult = null;

      if (documento.url && documento.url.startsWith('blob:')) {
        console.log(`Detectado blob URL. Fazendo upload para o servidor...`);
        try {
          // Determinar o tipo de entidade e ID com base nos dados do documento
          const tipoEntidade = documento.projetoId 
            ? 'projetos' 
            : documento.clienteId 
              ? 'clientes' 
              : documento.visitaId 
                ? 'visitas' 
                : 'clientes';
          
          const entidadeId = documento.projetoId || documento.clienteId || documento.visitaId || '';
          
          // Fazer upload usando a nova estrutura de pastas
          uploadResult = await uploadFile(documento.url, {
            fileName: documento.nome,
            contentType: documento.tipo,
            tenantId: tenantId,
            tipoEntidade: tipoEntidade as any,
            entidadeId: entidadeId,
            tipoArquivo: 'documentos',
            arquivoId: documentoId
          });
          
          documentoUrl = uploadResult.url;
          console.log(`Upload concluído. Nova URL: ${documentoUrl}`);
        } catch (uploadError) {
          console.error('Erro ao fazer upload do arquivo:', uploadError);
          throw new Error(`Falha ao fazer upload do arquivo: ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`);
        }
      }

      const novoDocumento: Documento = {
        id: documentoId,
        ...documento,
        url: documentoUrl, // Usar a URL do S3 se foi feito upload
        dataCriacao: timestamp,
        dataAtualizacao: timestamp
      };

      // Se tiver informações adicionais do upload, salvar no documento
      if (uploadResult) {
        novoDocumento.s3Path = uploadResult.path;
        novoDocumento.extensao = uploadResult.extensao;
      }

      const documentoItem = documentoToItem(novoDocumento, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: documentoItem
      });

      await dynamodb.send(command);
      console.log(`Documento ${documentoId} criado com sucesso`);
      
      return novoDocumento;
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      throw new Error(`Falha ao criar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarDocumento(tenantId: string, documentoId: string, dadosAtualizados: Partial<Omit<Documento, 'id' | 'dataCriacao'>>): Promise<Documento | null> {
    try {
      console.log(`Atualizando documento ${documentoId} para o tenant ${tenantId}`);
      
      // Buscar o documento atual
      const documentoAtual = await this.buscarDocumentoPorId(tenantId, documentoId);
      if (!documentoAtual) {
        console.log(`Documento ${documentoId} não encontrado`);
        return null;
      }
      
      // Verificar se há um novo arquivo para upload
      let documentoUrl = dadosAtualizados.url || documentoAtual.url;
      let uploadResult = null;

      if (dadosAtualizados.url && dadosAtualizados.url.startsWith('blob:')) {
        console.log(`Detectado novo blob URL. Fazendo upload para o servidor...`);
        try {
          // Determinar o tipo de entidade e ID com base nos dados do documento
          const tipoEntidade = documentoAtual.projetoId 
            ? 'projetos' 
            : documentoAtual.clienteId 
              ? 'clientes' 
              : documentoAtual.visitaId 
                ? 'visitas' 
                : 'clientes';
          
          const entidadeId = documentoAtual.projetoId || documentoAtual.clienteId || documentoAtual.visitaId || '';
          
          // Fazer upload usando a nova estrutura de pastas
          uploadResult = await uploadFile(dadosAtualizados.url, {
            fileName: dadosAtualizados.nome || documentoAtual.nome,
            contentType: dadosAtualizados.tipo || documentoAtual.tipo,
            tenantId: tenantId,
            tipoEntidade: tipoEntidade as any,
            entidadeId: entidadeId,
            tipoArquivo: 'documentos',
            arquivoId: documentoId
          });
          
          documentoUrl = uploadResult.url;
          console.log(`Upload concluído. Nova URL: ${documentoUrl}`);
        } catch (uploadError) {
          console.error('Erro ao fazer upload do arquivo:', uploadError);
          throw new Error(`Falha ao fazer upload do arquivo: ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`);
        }
      }
      
      const timestamp = new Date().toISOString();
      
      const documentoAtualizado: Documento = {
        ...documentoAtual,
        ...dadosAtualizados,
        url: documentoUrl,
        dataAtualizacao: timestamp
      };
      
      // Se tiver informações adicionais do upload, salvar no documento
      if (uploadResult) {
        documentoAtualizado.s3Path = uploadResult.path;
        documentoAtualizado.extensao = uploadResult.extensao;
      }
      
      const documentoItem = documentoToItem(documentoAtualizado, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: documentoItem
      });
      
      await dynamodb.send(command);
      console.log(`Documento ${documentoId} atualizado com sucesso`);
      
      return documentoAtualizado;
    } catch (error) {
      console.error(`Erro ao atualizar documento ${documentoId}:`, error);
      throw new Error(`Falha ao atualizar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirDocumento(tenantId: string, documentoId: string): Promise<boolean> {
    try {
      console.log(`Excluindo documento ${documentoId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `DOCUMENTO#${documentoId}`
        }
      });

      await dynamodb.send(command);
      console.log(`Documento ${documentoId} excluído com sucesso`);
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir documento ${documentoId}:`, error);
      throw new Error(`Falha ao excluir documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarTags(tenantId: string, documentoId: string, tags: string[]): Promise<Documento | null> {
    return this.atualizarDocumento(tenantId, documentoId, { tags });
  },

  async listarDocumentosPorVisita(tenantId: string, visitaId: string): Promise<Documento[]> {
    try {
      console.log(`Listando documentos para a visita ${visitaId} do tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': `VISITA#${visitaId}#DOCUMENTO#`
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} documentos para a visita ${visitaId}`);
      
      return (response.Items || []).map(item => itemToDocumento(item as DocumentoItem));
    } catch (error) {
      console.error(`Erro ao listar documentos para a visita ${visitaId}:`, error);
      throw new Error(`Falha ao listar documentos para a visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
