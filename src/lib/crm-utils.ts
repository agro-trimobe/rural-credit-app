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
}

export interface Interacao {
  id: string
  clienteId: string
  tipo: 'Ligação' | 'Email' | 'Reunião' | 'Visita' | 'Outro'
  data: string
  assunto: string
  descricao: string
  responsavel: string
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

// Funções utilitárias para formatação
export function formatarCpfCnpj(valor: string): string {
  if (!valor) return ''
  
  // Remove caracteres não numéricos
  const apenasNumeros = valor.replace(/\D/g, '')
  
  if (apenasNumeros.length === 11) {
    // CPF: 000.000.000-00
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (apenasNumeros.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  
  return valor
}

export function formatarValor(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
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

export const formatarData = (data?: string): string => {
  if (!data) return 'N/A'
  return new Date(data).toLocaleDateString('pt-BR')
}

export const formatarDataHora = (data: string | undefined): string => {
  if (!data) return 'N/A'
  return new Date(data).toLocaleString('pt-BR')
}

export const formatarTamanhoArquivo = (bytes: number): string => {
  if (!bytes && bytes !== 0) return 'N/A'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

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
    'Contato Inicial': 'bg-blue-100 text-blue-800 border-blue-200',
    'Proposta Enviada': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Negociação': 'bg-purple-100 text-purple-800 border-purple-200',
    'Ganho': 'bg-green-100 text-green-800 border-green-200',
    'Perdido': 'bg-red-100 text-red-800 border-red-200',
  },
  
  documento: {
    'Pendente': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'Enviado': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'Aprovado': 'bg-green-100 text-green-800 hover:bg-green-200',
    'Rejeitado': 'bg-red-100 text-red-800 hover:bg-red-200'
  }
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
