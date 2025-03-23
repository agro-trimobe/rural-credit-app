import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Interacao } from '../crm-utils';
import { InteracaoItem, interacaoToItem, itemToInteracao } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const interacaoRepository = {
  async listarInteracoes(tenantId: string): Promise<Interacao[]> {
    try {
      console.log(`Listando interações para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'INTERACAO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} interações`);
      
      return (response.Items || []).map(item => itemToInteracao(item as InteracaoItem));
    } catch (error) {
      console.error('Erro ao listar interações:', error);
      throw new Error(`Falha ao listar interações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarInteracaoPorId(tenantId: string, interacaoId: string): Promise<Interacao | null> {
    try {
      console.log(`Buscando interação ${interacaoId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `INTERACAO#${interacaoId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Interação ${interacaoId} não encontrada`);
        return null;
      }
      
      console.log(`Interação ${interacaoId} encontrada`);
      return itemToInteracao(response.Item as InteracaoItem);
    } catch (error) {
      console.error(`Erro ao buscar interação ${interacaoId}:`, error);
      throw new Error(`Falha ao buscar interação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarInteracoesPorCliente(tenantId: string, clienteId: string): Promise<Interacao[]> {
    try {
      console.log(`Listando interações para o cliente ${clienteId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
        ExpressionAttributeValues: {
          ':gsi1pk': `CLIENTE#${clienteId}`,
          ':gsi1sk': 'INTERACAO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} interações para o cliente ${clienteId}`);
      
      return (response.Items || []).map(item => itemToInteracao(item as InteracaoItem));
    } catch (error) {
      console.error(`Erro ao listar interações do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar interações do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarInteracoesPorData(tenantId: string, data: string): Promise<Interacao[]> {
    try {
      console.log(`Listando interações para a data ${data} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk',
        ExpressionAttributeValues: {
          ':gsi2pk': `TENANT#${tenantId}#DATA#${data}`
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} interações para a data ${data}`);
      
      return (response.Items || []).map(item => itemToInteracao(item as InteracaoItem));
    } catch (error) {
      console.error(`Erro ao listar interações da data ${data}:`, error);
      throw new Error(`Falha ao listar interações por data: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarInteracao(tenantId: string, interacao: Omit<Interacao, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Interacao> {
    try {
      console.log(`Criando nova interação para o tenant ${tenantId}`);
      
      const timestamp = new Date().toISOString();
      const interacaoId = uuidv4();

      const novaInteracao: Interacao = {
        id: interacaoId,
        ...interacao,
        dataCriacao: timestamp,
        dataAtualizacao: timestamp
      };

      const interacaoItem = interacaoToItem(novaInteracao, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: interacaoItem
      });

      await dynamodb.send(command);
      console.log(`Interação ${interacaoId} criada com sucesso`);
      
      return novaInteracao;
    } catch (error) {
      console.error('Erro ao criar interação:', error);
      throw new Error(`Falha ao criar interação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarInteracao(tenantId: string, interacaoId: string, dadosAtualizados: Partial<Omit<Interacao, 'id' | 'dataCriacao'>>): Promise<Interacao | null> {
    try {
      console.log(`Atualizando interação ${interacaoId} para o tenant ${tenantId}`);
      
      // Primeiro, buscar a interação atual
      const interacaoAtual = await this.buscarInteracaoPorId(tenantId, interacaoId);
      if (!interacaoAtual) {
        console.log(`Interação ${interacaoId} não encontrada para atualização`);
        return null;
      }

      const timestamp = new Date().toISOString();
      const interacaoAtualizada: Interacao = {
        ...interacaoAtual,
        ...dadosAtualizados,
        dataAtualizacao: timestamp
      };

      const interacaoItem = interacaoToItem(interacaoAtualizada, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: interacaoItem
      });

      await dynamodb.send(command);
      console.log(`Interação ${interacaoId} atualizada com sucesso`);
      
      return interacaoAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar interação ${interacaoId}:`, error);
      throw new Error(`Falha ao atualizar interação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirInteracao(tenantId: string, interacaoId: string): Promise<boolean> {
    try {
      console.log(`Excluindo interação ${interacaoId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `INTERACAO#${interacaoId}`
        }
      });

      await dynamodb.send(command);
      console.log(`Interação ${interacaoId} excluída com sucesso`);
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir interação ${interacaoId}:`, error);
      throw new Error(`Falha ao excluir interação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
