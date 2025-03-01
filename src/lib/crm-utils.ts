// Tipos para o CRM
export interface Cliente {
  id: string
  nome: string
  cpfCnpj: string
  email: string
  telefone: string
  tipo: 'Pessoa Física' | 'Pessoa Jurídica'
  perfil: 'Pequeno' | 'Médio' | 'Grande'
  endereco: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  propriedades: Propriedade[]
  interacoes: Interacao[]
  dataCadastro: string
  dataAtualizacao: string
}

export interface Propriedade {
  id: string
  nome: string
  area: number
  unidadeMedida: 'ha' | 'alq'
  coordenadas?: {
    latitude: number
    longitude: number
  }
  endereco: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  clienteId: string
  dataCadastro: string
  dataAtualizacao: string
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
  documentos: Documento[]
  dataCriacao: string
  dataAtualizacao: string
  dataPrevisaoTermino?: string
}

export interface Documento {
  id: string
  nome: string
  tipo: string
  formato: string
  tamanho: number
  url: string
  clienteId: string
  projetoId?: string
  visitaId?: string
  status?: string
  dataCriacao: string
  dataAtualizacao: string
  tags?: string[]
}

export interface Visita {
  id: string
  clienteId: string
  propriedadeId: string
  projetoId?: string
  data: string
  status: 'Agendada' | 'Realizada' | 'Cancelada'
  observacoes?: string
  fotos?: string[]
  dataCriacao: string
  dataAtualizacao: string
}

export interface Oportunidade {
  id: string
  clienteId: string
  titulo: string
  descricao: string
  valor: number
  status: 'Prospecção' | 'Contato Inicial' | 'Proposta' | 'Negociação' | 'Fechado' | 'Perdido'
  proximoContato?: string
  dataCriacao: string
  dataAtualizacao: string
}

export interface Simulacao {
  id: string
  clienteId?: string
  linhaCredito: string
  valorFinanciamento: number
  taxaJuros: number
  prazoTotal: number
  carencia: number
  valorParcela: number
  dataCriacao: string
}

export interface Interacao {
  id: string
  clienteId: string
  tipo: 'Email' | 'Telefone' | 'Reunião' | 'WhatsApp' | 'Outro'
  descricao: string
  data: string
  responsavel: string
}

// Funções utilitárias para formatação
export function formatarCpfCnpj(valor: string): string {
  valor = valor.replace(/\D/g, '')
  
  if (valor.length <= 11) {
    // CPF: 000.000.000-00
    return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else {
    // CNPJ: 00.000.000/0000-00
    return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
}

export function formatarTelefone(valor: string): string {
  valor = valor.replace(/\D/g, '')
  
  if (valor.length === 11) {
    // Celular: (00) 00000-0000
    return valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else {
    // Fixo: (00) 0000-0000
    return valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

export function formatarDataHora(data: string): string {
  return new Date(data).toLocaleString('pt-BR')
}

// Funções para gerar dados mockados
export function gerarIdAleatorio(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function gerarDataAleatoria(minDias = -365, maxDias = 0): string {
  const hoje = new Date()
  const diasAleatorios = Math.floor(Math.random() * (maxDias - minDias + 1)) + minDias
  const dataAleatoria = new Date(hoje)
  dataAleatoria.setDate(hoje.getDate() + diasAleatorios)
  return dataAleatoria.toISOString()
}

export function gerarValorAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Cores para status
export const coresStatus = {
  projeto: {
    'Em Elaboração': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Em Análise': 'bg-blue-100 text-blue-800 border-blue-200',
    'Aprovado': 'bg-green-100 text-green-800 border-green-200',
    'Contratado': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cancelado': 'bg-red-100 text-red-800 border-red-200',
  },
  
  visita: {
    'Agendada': 'bg-blue-100 text-blue-800 border-blue-200',
    'Realizada': 'bg-green-100 text-green-800 border-green-200',
    'Cancelada': 'bg-red-100 text-red-800 border-red-200',
  },
  
  oportunidade: {
    'Prospecção': 'bg-gray-100 text-gray-800 border-gray-200',
    'Contato Inicial': 'bg-blue-100 text-blue-800 border-blue-200',
    'Proposta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Negociação': 'bg-purple-100 text-purple-800 border-purple-200',
    'Fechado': 'bg-green-100 text-green-800 border-green-200',
    'Perdido': 'bg-red-100 text-red-800 border-red-200',
  },
  
  documento: {
    'Pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Enviado': 'bg-blue-100 text-blue-800 border-blue-200',
    'Aprovado': 'bg-green-100 text-green-800 border-green-200',
    'Rejeitado': 'bg-red-100 text-red-800 border-red-200'
  }
}
