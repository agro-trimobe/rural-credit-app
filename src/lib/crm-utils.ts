// Tipos para o CRM
export interface Cliente {
  id: string
  nome: string
  cpfCnpj: string
  email: string
  telefone: string
  tipo: 'PF' | 'PJ'
  perfil: 'pequeno' | 'medio' | 'grande'
  dataNascimento?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  dataCadastro?: string
  dataAtualizacao?: string
  propriedades?: Propriedade[]
  projetos?: Projeto[]
  interacoes?: Interacao[]
}

export interface Propriedade {
  id: string
  nome: string
  clienteId: string
  endereco: string
  area: number
  municipio: string
  estado: string
  coordenadas?: {
    latitude: number
    longitude: number
  }
  dataCriacao: string
  dataAtualizacao?: string
}

export interface Projeto {
  id: string
  titulo: string
  descricao: string
  clienteId: string
  propriedadeId: string
  status: 'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado'
  valorTotal: number
  linhaCredito: string
  documentos: string[]
  dataCriacao: string
  dataAtualizacao: string
  dataPrevisaoTermino?: string
}

export interface Documento {
  id: string
  nome: string
  descricao?: string
  tipo: string
  formato: string
  tamanho: number
  status: string
  url: string
  tags?: string[]
  clienteId: string
  projetoId?: string
  visitaId?: string
  dataCriacao: string
  dataAtualizacao?: string
  s3Path?: string
  extensao?: string
}

export interface Interacao {
  id: string
  clienteId: string
  tipo: 'Ligação' | 'Email' | 'Reunião' | 'Visita' | 'Outro'
  data: string
  assunto: string
  descricao: string
  responsavel: string
  status?: string
  observacoes?: string
  dataCriacao: string
  dataAtualizacao?: string
}

export interface Oportunidade {
  id: string
  clienteId: string
  titulo: string
  descricao: string
  valor: number
  status: 'Contato Inicial' | 'Proposta Enviada' | 'Negociação' | 'Ganho' | 'Perdido'
  proximoContato?: string
  dataCriacao: string
  dataAtualizacao?: string
}

export interface Simulacao {
  id: string
  clienteId: string
  linhaCredito: string
  valorFinanciamento: number
  taxaJuros: number
  prazoTotal: number
  carencia: number
  valorParcela: number
  dataCriacao: string
  dataAtualizacao?: string
}

export interface Visita {
  id: string
  clienteId: string
  propriedadeId: string
  projetoId?: string
  data: string
  status: 'Agendada' | 'Realizada' | 'Cancelada'
  observacoes: string
  fotos: string[]
  dataCriacao: string
  dataAtualizacao?: string
}

// Re-exportar funções de formatação do arquivo formatters.ts
export {
  formatarMoeda,
  formatarValor,
  formatarData,
  formatarDataHora,
  formatarTamanhoArquivo,
  formatarCpfCnpj,
  formatarTelefone,
  coresStatus
} from './formatters';

// Funções para gerar dados mockados
export function gerarIdAleatorio(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function gerarDataAleatoria(minDias = -365, maxDias = 0): string {
  const hoje = new Date();
  const diasAleatorios = Math.floor(Math.random() * (maxDias - minDias + 1)) + minDias;
  const dataAleatoria = new Date(hoje);
  dataAleatoria.setDate(hoje.getDate() + diasAleatorios);
  return dataAleatoria.toISOString();
}

export function gerarValorAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
