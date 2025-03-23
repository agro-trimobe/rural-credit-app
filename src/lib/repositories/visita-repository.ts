import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Visita } from '../crm-utils';
import { VisitaItem, visitaToItem, itemToVisita } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const visitaRepository = {
  async listarVisitas(tenantId: string): Promise<Visita[]> {
    try {
      console.log(`Listando visitas para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'VISITA#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} visitas`);
      
      return (response.Items || []).map(item => itemToVisita(item as VisitaItem));
    } catch (error) {
      console.error('Erro ao listar visitas:', error);
      throw new Error(`Falha ao listar visitas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarVisitaPorId(tenantId: string, visitaId: string): Promise<Visita | null> {
    try {
      console.log(`Buscando visita ${visitaId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `VISITA#${visitaId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Visita ${visitaId} não encontrada`);
        return null;
      }
      
      console.log(`Visita ${visitaId} encontrada`);
      return itemToVisita(response.Item as VisitaItem);
    } catch (error) {
      console.error(`Erro ao buscar visita ${visitaId}:`, error);
      throw new Error(`Falha ao buscar visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarVisitasPorCliente(tenantId: string, clienteId: string): Promise<Visita[]> {
    try {
      console.log(`Listando visitas para o cliente ${clienteId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
        ExpressionAttributeValues: {
          ':gsi1pk': `CLIENTE#${clienteId}`,
          ':gsi1sk': 'VISITA#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} visitas para o cliente ${clienteId}`);
      
      return (response.Items || []).map(item => itemToVisita(item as VisitaItem));
    } catch (error) {
      console.error(`Erro ao listar visitas do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar visitas do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarVisitasPorPropriedade(tenantId: string, propriedadeId: string): Promise<Visita[]> {
    try {
      console.log(`Listando visitas para a propriedade ${propriedadeId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk AND begins_with(GSI2SK, :gsi2sk)',
        ExpressionAttributeValues: {
          ':gsi2pk': `PROPRIEDADE#${propriedadeId}`,
          ':gsi2sk': 'VISITA#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} visitas para a propriedade ${propriedadeId}`);
      
      return (response.Items || []).map(item => itemToVisita(item as VisitaItem));
    } catch (error) {
      console.error(`Erro ao listar visitas da propriedade ${propriedadeId}:`, error);
      throw new Error(`Falha ao listar visitas da propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarVisitasPorProjeto(tenantId: string, projetoId: string): Promise<Visita[]> {
    try {
      console.log(`Listando visitas para o projeto ${projetoId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        FilterExpression: 'projetoId = :projetoId',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'VISITA#',
          ':projetoId': projetoId
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} visitas para o projeto ${projetoId}`);
      
      return (response.Items || []).map(item => itemToVisita(item as VisitaItem));
    } catch (error) {
      console.error(`Erro ao listar visitas do projeto ${projetoId}:`, error);
      throw new Error(`Falha ao listar visitas do projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarVisita(tenantId: string, visita: Omit<Visita, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Visita> {
    try {
      console.log(`Criando nova visita para o tenant ${tenantId}`);
      
      const timestamp = new Date().toISOString();
      const visitaId = uuidv4();

      const novaVisita: Visita = {
        id: visitaId,
        ...visita,
        dataCriacao: timestamp,
        dataAtualizacao: timestamp
      };

      const visitaItem = visitaToItem(novaVisita, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: visitaItem
      });

      await dynamodb.send(command);
      console.log(`Visita ${visitaId} criada com sucesso`);
      
      return novaVisita;
    } catch (error) {
      console.error('Erro ao criar visita:', error);
      throw new Error(`Falha ao criar visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarVisita(tenantId: string, visitaId: string, dadosAtualizados: Partial<Omit<Visita, 'id' | 'dataCriacao'>>): Promise<Visita | null> {
    try {
      console.log(`Atualizando visita ${visitaId} para o tenant ${tenantId}`);
      
      // Primeiro, buscar a visita atual
      const visitaAtual = await this.buscarVisitaPorId(tenantId, visitaId);
      if (!visitaAtual) {
        console.log(`Visita ${visitaId} não encontrada para atualização`);
        return null;
      }

      const timestamp = new Date().toISOString();
      const visitaAtualizada: Visita = {
        ...visitaAtual,
        ...dadosAtualizados,
        dataAtualizacao: timestamp
      };

      const visitaItem = visitaToItem(visitaAtualizada, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: visitaItem
      });

      await dynamodb.send(command);
      console.log(`Visita ${visitaId} atualizada com sucesso`);
      
      return visitaAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar visita ${visitaId}:`, error);
      throw new Error(`Falha ao atualizar visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirVisita(tenantId: string, visitaId: string): Promise<boolean> {
    try {
      console.log(`Excluindo visita ${visitaId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `VISITA#${visitaId}`
        }
      });

      await dynamodb.send(command);
      console.log(`Visita ${visitaId} excluída com sucesso`);
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir visita ${visitaId}:`, error);
      throw new Error(`Falha ao excluir visita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
