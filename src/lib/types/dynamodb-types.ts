// Tipos para a camada de repositório do DynamoDB
import { 
  Cliente, 
  Propriedade, 
  Projeto, 
  Documento, 
  Interacao, 
  Oportunidade, 
  Visita,
  Simulacao
} from '../crm-utils';

// Tipo base para todos os itens do DynamoDB
export interface DynamoDBItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  tenantId: string;
}

// Tipos específicos para cada entidade no DynamoDB
export interface ClienteItem extends DynamoDBItem, Omit<Cliente, 'propriedades' | 'projetos' | 'interacoes'> {
  propriedades?: string[]; // IDs das propriedades
  projetos?: string[]; // IDs dos projetos
  interacoes?: string[]; // IDs das interações
}

export interface PropriedadeItem extends DynamoDBItem, Propriedade {}

export interface ProjetoItem extends DynamoDBItem, Projeto {}

export interface DocumentoItem extends DynamoDBItem, Documento {}

export interface InteracaoItem extends DynamoDBItem, Interacao {}

export interface OportunidadeItem extends DynamoDBItem, Oportunidade {}

export interface VisitaItem extends DynamoDBItem, Visita {}

export interface SimulacaoItem extends DynamoDBItem, Simulacao {}

// Funções auxiliares para conversão entre tipos de domínio e tipos do DynamoDB
export function clienteToItem(cliente: Cliente, tenantId: string): ClienteItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `CLIENTE#${cliente.id}`,
    GSI1PK: `CLIENTE#${cliente.id}`,
    GSI1SK: `TENANT#${tenantId}`,
    GSI2PK: `TENANT#${tenantId}#CPFCNPJ#${cliente.cpfCnpj}`,
    GSI2SK: `CLIENTE#${cliente.id}`,
    tenantId,
    ...cliente,
    propriedades: cliente.propriedades?.map(p => p.id),
    projetos: cliente.projetos?.map(p => p.id),
    interacoes: cliente.interacoes?.map(i => i.id)
  };
}

export function itemToCliente(item: ClienteItem): Cliente {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, propriedades, projetos, interacoes, ...cliente } = item;
  return cliente as Cliente;
}

export function propriedadeToItem(propriedade: Propriedade, tenantId: string): PropriedadeItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `PROPRIEDADE#${propriedade.id}`,
    GSI1PK: `CLIENTE#${propriedade.clienteId}`,
    GSI1SK: `PROPRIEDADE#${propriedade.id}`,
    GSI2PK: `TENANT#${tenantId}#MUNICIPIO#${propriedade.municipio}`,
    GSI2SK: `PROPRIEDADE#${propriedade.id}`,
    tenantId,
    ...propriedade
  };
}

export function itemToPropriedade(item: PropriedadeItem): Propriedade {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...propriedade } = item;
  return propriedade as Propriedade;
}

export function projetoToItem(projeto: Projeto, tenantId: string): ProjetoItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `PROJETO#${projeto.id}`,
    GSI1PK: `CLIENTE#${projeto.clienteId}`,
    GSI1SK: `PROJETO#${projeto.id}`,
    GSI2PK: `PROPRIEDADE#${projeto.propriedadeId}`,
    GSI2SK: `PROJETO#${projeto.id}`,
    tenantId,
    ...projeto
  };
}

export function itemToProjeto(item: ProjetoItem): Projeto {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...projeto } = item;
  return projeto as Projeto;
}

export function documentoToItem(documento: Documento, tenantId: string): DocumentoItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `DOCUMENTO#${documento.id}`,
    GSI1PK: `CLIENTE#${documento.clienteId}`,
    GSI1SK: `DOCUMENTO#${documento.id}`,
    GSI2PK: `TIPO#${documento.tipo}`,
    GSI2SK: `TENANT#${tenantId}#DOCUMENTO#${documento.id}`,
    tenantId,
    ...documento
  };
}

export function itemToDocumento(item: DocumentoItem): Documento {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...documento } = item;
  return documento as Documento;
}

export function interacaoToItem(interacao: Interacao, tenantId: string): InteracaoItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `INTERACAO#${interacao.id}`,
    GSI1PK: `CLIENTE#${interacao.clienteId}`,
    GSI1SK: `INTERACAO#${interacao.id}`,
    GSI2PK: `TENANT#${tenantId}#DATA#${interacao.data}`,
    GSI2SK: `INTERACAO#${interacao.id}`,
    tenantId,
    ...interacao
  };
}

export function itemToInteracao(item: InteracaoItem): Interacao {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...interacao } = item;
  return interacao as Interacao;
}

export function oportunidadeToItem(oportunidade: Oportunidade, tenantId: string): OportunidadeItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `OPORTUNIDADE#${oportunidade.id}`,
    GSI1PK: `CLIENTE#${oportunidade.clienteId}`,
    GSI1SK: `OPORTUNIDADE#${oportunidade.id}`,
    GSI2PK: `TENANT#${tenantId}#STATUS#${oportunidade.status}`,
    GSI2SK: `OPORTUNIDADE#${oportunidade.id}`,
    tenantId,
    ...oportunidade
  };
}

export function itemToOportunidade(item: OportunidadeItem): Oportunidade {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...oportunidade } = item;
  return oportunidade as Oportunidade;
}

export function visitaToItem(visita: Visita, tenantId: string): VisitaItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `VISITA#${visita.id}`,
    GSI1PK: `CLIENTE#${visita.clienteId}`,
    GSI1SK: `VISITA#${visita.id}`,
    GSI2PK: `PROPRIEDADE#${visita.propriedadeId}`,
    GSI2SK: `VISITA#${visita.id}`,
    tenantId,
    ...visita
  };
}

export function itemToVisita(item: VisitaItem): Visita {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...visita } = item;
  return visita as Visita;
}

export function simulacaoToItem(simulacao: Simulacao, tenantId: string): SimulacaoItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `SIMULACAO#${simulacao.id}`,
    GSI1PK: `CLIENTE#${simulacao.clienteId}`,
    GSI1SK: `SIMULACAO#${simulacao.id}`,
    GSI2PK: `TENANT#${tenantId}#LINHACREDITO#${simulacao.linhaCredito}`,
    GSI2SK: `SIMULACAO#${simulacao.id}`,
    tenantId,
    ...simulacao
  };
}

export function itemToSimulacao(item: SimulacaoItem): Simulacao {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...simulacao } = item;
  return simulacao as Simulacao;
}
