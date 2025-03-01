import { gerarIdAleatorio, gerarDataAleatoria } from '../crm-utils'

// Interfaces para a base de conhecimento
export interface ArtigoConhecimento {
  id: string
  titulo: string
  conteudo: string
  categoria: string
  tags: string[]
  autor: string
  dataPublicacao: string
  dataAtualizacao: string
  visualizacoes: number
}

export interface Legislacao {
  id: string
  titulo: string
  numero: string
  orgao: string
  dataPublicacao: string
  resumo: string
  linkOficial: string
  categoria: string
  tags: string[]
}

export interface ProgramaFinanciamento {
  id: string
  nome: string
  instituicao: string
  descricao: string
  taxaJuros: string
  prazoMaximo: number
  valorMaximo: number
  publicoAlvo: string
  requisitos: string[]
  dataInicio: string
  dataFim?: string
  status: 'Ativo' | 'Encerrado' | 'Em breve'
}

// Dados mockados para artigos
const artigosMock: ArtigoConhecimento[] = [
  {
    id: 'art001',
    titulo: 'Guia Completo do Pronaf: Tudo que você precisa saber',
    conteudo: 'O Programa Nacional de Fortalecimento da Agricultura Familiar (Pronaf) é uma das principais linhas de crédito para pequenos produtores rurais no Brasil...',
    categoria: 'Linhas de Crédito',
    tags: ['Pronaf', 'Agricultura Familiar', 'Financiamento'],
    autor: 'João Silva',
    dataPublicacao: new Date('2024-12-10').toISOString(),
    dataAtualizacao: new Date('2025-01-15').toISOString(),
    visualizacoes: 1245
  },
  {
    id: 'art002',
    titulo: 'Como elaborar um projeto de crédito rural com alta taxa de aprovação',
    conteudo: 'A elaboração de um projeto de crédito rural bem estruturado é fundamental para garantir a aprovação junto às instituições financeiras...',
    categoria: 'Projetos',
    tags: ['Elaboração de Projetos', 'Aprovação', 'Dicas'],
    autor: 'Maria Oliveira',
    dataPublicacao: new Date('2025-01-05').toISOString(),
    dataAtualizacao: new Date('2025-01-05').toISOString(),
    visualizacoes: 876
  },
  {
    id: 'art003',
    titulo: 'Análise de viabilidade econômica em projetos de irrigação',
    conteudo: 'A análise de viabilidade econômica é um passo crucial antes de investir em sistemas de irrigação...',
    categoria: 'Técnico',
    tags: ['Irrigação', 'Viabilidade Econômica', 'Investimento'],
    autor: 'Carlos Mendes',
    dataPublicacao: new Date('2025-01-20').toISOString(),
    dataAtualizacao: new Date('2025-02-10').toISOString(),
    visualizacoes: 543
  },
  {
    id: 'art004',
    titulo: 'Calendário Agrícola: Planejando o ano de financiamentos',
    conteudo: 'O planejamento financeiro na agricultura deve seguir o calendário agrícola, considerando os ciclos de plantio e colheita...',
    categoria: 'Planejamento',
    tags: ['Calendário Agrícola', 'Planejamento', 'Safra'],
    autor: 'Ana Costa',
    dataPublicacao: new Date('2025-02-01').toISOString(),
    dataAtualizacao: new Date('2025-02-15').toISOString(),
    visualizacoes: 921
  },
  {
    id: 'art005',
    titulo: 'Documentação necessária para projetos de crédito rural',
    conteudo: 'Um dos principais desafios na obtenção de crédito rural é a preparação da documentação necessária...',
    categoria: 'Documentação',
    tags: ['Documentos', 'Checklist', 'Requisitos'],
    autor: 'Roberto Almeida',
    dataPublicacao: new Date('2025-02-18').toISOString(),
    dataAtualizacao: new Date('2025-02-25').toISOString(),
    visualizacoes: 1087
  }
]

// Dados mockados para legislação
const legislacaoMock: Legislacao[] = [
  {
    id: 'leg001',
    titulo: 'Manual de Crédito Rural (MCR)',
    numero: 'MCR',
    orgao: 'Banco Central do Brasil',
    dataPublicacao: new Date('2024-07-01').toISOString(),
    resumo: 'O Manual de Crédito Rural (MCR) codifica as normas aprovadas pelo Conselho Monetário Nacional (CMN) e aquelas divulgadas pelo Banco Central do Brasil relativas ao crédito rural.',
    linkOficial: 'https://www3.bcb.gov.br/mcr',
    categoria: 'Manual',
    tags: ['MCR', 'Normas', 'Banco Central']
  },
  {
    id: 'leg002',
    titulo: 'Resolução nº 4.883 - Plano Safra 2024/2025',
    numero: '4.883',
    orgao: 'Conselho Monetário Nacional',
    dataPublicacao: new Date('2024-06-15').toISOString(),
    resumo: 'Dispõe sobre os encargos financeiros e limites de crédito das operações de crédito rural contratadas no âmbito do Plano Safra 2024/2025.',
    linkOficial: 'https://www.bcb.gov.br/resolucoes',
    categoria: 'Resolução',
    tags: ['Plano Safra', 'Encargos Financeiros', 'Limites de Crédito']
  },
  {
    id: 'leg003',
    titulo: 'Lei nº 8.171 - Política Agrícola',
    numero: '8.171',
    orgao: 'Presidência da República',
    dataPublicacao: new Date('1991-01-17').toISOString(),
    resumo: 'Dispõe sobre a política agrícola brasileira, seus princípios, objetivos e instrumentos.',
    linkOficial: 'http://www.planalto.gov.br/ccivil_03/leis/l8171.htm',
    categoria: 'Lei',
    tags: ['Política Agrícola', 'Legislação Base', 'Princípios']
  },
  {
    id: 'leg004',
    titulo: 'Decreto nº 10.828 - Programa Nacional de Fortalecimento da Agricultura Familiar',
    numero: '10.828',
    orgao: 'Presidência da República',
    dataPublicacao: new Date('2021-10-01').toISOString(),
    resumo: 'Regulamenta o Programa Nacional de Fortalecimento da Agricultura Familiar - Pronaf.',
    linkOficial: 'http://www.planalto.gov.br/decretos',
    categoria: 'Decreto',
    tags: ['Pronaf', 'Regulamentação', 'Agricultura Familiar']
  },
  {
    id: 'leg005',
    titulo: 'Portaria nº 123 - Zoneamento Agrícola de Risco Climático',
    numero: '123',
    orgao: 'Ministério da Agricultura e Pecuária',
    dataPublicacao: new Date('2025-01-10').toISOString(),
    resumo: 'Estabelece o Zoneamento Agrícola de Risco Climático para as principais culturas agrícolas do país.',
    linkOficial: 'https://www.gov.br/agricultura/zarc',
    categoria: 'Portaria',
    tags: ['ZARC', 'Risco Climático', 'Culturas']
  }
]

// Dados mockados para programas de financiamento
const programasMock: ProgramaFinanciamento[] = [
  {
    id: 'prog001',
    nome: 'Pronaf Mais Alimentos',
    instituicao: 'Banco do Brasil, Caixa, BNDES',
    descricao: 'Linha de crédito destinada a financiar investimentos em infraestrutura produtiva da propriedade familiar.',
    taxaJuros: '4% a 4,5% a.a.',
    prazoMaximo: 120,
    valorMaximo: 200000,
    publicoAlvo: 'Agricultores familiares enquadrados no Pronaf',
    requisitos: [
      'DAP ativa',
      'Projeto técnico aprovado',
      'Regularidade ambiental'
    ],
    dataInicio: new Date('2024-07-01').toISOString(),
    dataFim: new Date('2025-06-30').toISOString(),
    status: 'Ativo'
  },
  {
    id: 'prog002',
    nome: 'Pronamp',
    instituicao: 'Banco do Brasil, Bradesco, Santander',
    descricao: 'Programa Nacional de Apoio ao Médio Produtor Rural, destinado a promover o desenvolvimento das atividades rurais dos médios produtores.',
    taxaJuros: '6% a.a.',
    prazoMaximo: 96,
    valorMaximo: 1500000,
    publicoAlvo: 'Produtores rurais com renda bruta anual de até R$ 2,4 milhões',
    requisitos: [
      'Comprovação de renda',
      'Projeto técnico',
      'Garantias reais'
    ],
    dataInicio: new Date('2024-07-01').toISOString(),
    dataFim: new Date('2025-06-30').toISOString(),
    status: 'Ativo'
  },
  {
    id: 'prog003',
    nome: 'Inovagro',
    instituicao: 'BNDES, Banco do Brasil',
    descricao: 'Programa de Incentivo à Inovação Tecnológica na Produção Agropecuária, destinado a financiar investimentos em inovação tecnológica.',
    taxaJuros: '7% a 7,5% a.a.',
    prazoMaximo: 120,
    valorMaximo: 1500000,
    publicoAlvo: 'Produtores rurais e cooperativas',
    requisitos: [
      'Projeto técnico específico',
      'Comprovação de viabilidade',
      'Garantias reais'
    ],
    dataInicio: new Date('2024-07-01').toISOString(),
    dataFim: new Date('2025-06-30').toISOString(),
    status: 'Ativo'
  },
  {
    id: 'prog004',
    nome: 'ABC+ Ambiental',
    instituicao: 'Banco do Brasil, BNDES, Sicredi',
    descricao: 'Programa para Redução da Emissão de Gases de Efeito Estufa na Agricultura, destinado a financiar práticas sustentáveis.',
    taxaJuros: '5,5% a.a.',
    prazoMaximo: 144,
    valorMaximo: 5000000,
    publicoAlvo: 'Produtores rurais e cooperativas',
    requisitos: [
      'Projeto técnico com práticas sustentáveis',
      'Regularidade ambiental',
      'Garantias reais'
    ],
    dataInicio: new Date('2024-07-01').toISOString(),
    dataFim: new Date('2025-06-30').toISOString(),
    status: 'Ativo'
  },
  {
    id: 'prog005',
    nome: 'Moderfrota',
    instituicao: 'BNDES, Banco do Brasil',
    descricao: 'Programa de Modernização da Frota de Tratores Agrícolas e Implementos Associados e Colheitadeiras.',
    taxaJuros: '8% a 8,5% a.a.',
    prazoMaximo: 84,
    valorMaximo: 3000000,
    publicoAlvo: 'Produtores rurais e cooperativas',
    requisitos: [
      'Orçamento do bem a ser financiado',
      'Garantias reais',
      'Comprovação de capacidade de pagamento'
    ],
    dataInicio: new Date('2024-07-01').toISOString(),
    dataFim: new Date('2025-06-30').toISOString(),
    status: 'Ativo'
  },
  {
    id: 'prog006',
    nome: 'Crédito Verde',
    instituicao: 'Banco Sustentável',
    descricao: 'Linha de crédito especial para projetos de energia renovável e práticas agrícolas regenerativas.',
    taxaJuros: '4,5% a.a.',
    prazoMaximo: 180,
    valorMaximo: 2000000,
    publicoAlvo: 'Produtores rurais com certificação orgânica ou em transição',
    requisitos: [
      'Certificação orgânica ou plano de transição',
      'Projeto técnico sustentável',
      'Garantias reais'
    ],
    dataInicio: new Date('2025-04-01').toISOString(),
    status: 'Em breve'
  }
]

// API simulada para base de conhecimento
export const conhecimentoApi = {
  // Artigos
  getArtigos: async (): Promise<ArtigoConhecimento[]> => {
    return [...artigosMock]
  },

  getArtigoPorId: async (id: string): Promise<ArtigoConhecimento | undefined> => {
    return artigosMock.find(artigo => artigo.id === id)
  },

  getArtigosPorCategoria: async (categoria: string): Promise<ArtigoConhecimento[]> => {
    return artigosMock.filter(artigo => 
      artigo.categoria.toLowerCase() === categoria.toLowerCase()
    )
  },

  getArtigosPorTag: async (tag: string): Promise<ArtigoConhecimento[]> => {
    return artigosMock.filter(artigo => 
      artigo.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    )
  },

  pesquisarArtigos: async (termo: string): Promise<ArtigoConhecimento[]> => {
    const termoBusca = termo.toLowerCase()
    return artigosMock.filter(artigo => 
      artigo.titulo.toLowerCase().includes(termoBusca) || 
      artigo.conteudo.toLowerCase().includes(termoBusca) ||
      artigo.tags.some(tag => tag.toLowerCase().includes(termoBusca))
    )
  },

  // Legislação
  getLegislacoes: async (): Promise<Legislacao[]> => {
    return [...legislacaoMock]
  },

  getLegislacaoPorId: async (id: string): Promise<Legislacao | undefined> => {
    return legislacaoMock.find(leg => leg.id === id)
  },

  getLegislacoesPorCategoria: async (categoria: string): Promise<Legislacao[]> => {
    return legislacaoMock.filter(leg => 
      leg.categoria.toLowerCase() === categoria.toLowerCase()
    )
  },

  pesquisarLegislacao: async (termo: string): Promise<Legislacao[]> => {
    const termoBusca = termo.toLowerCase()
    return legislacaoMock.filter(leg => 
      leg.titulo.toLowerCase().includes(termoBusca) || 
      leg.resumo.toLowerCase().includes(termoBusca) ||
      leg.tags.some(tag => tag.toLowerCase().includes(termoBusca))
    )
  },

  // Programas de Financiamento
  getProgramas: async (): Promise<ProgramaFinanciamento[]> => {
    return [...programasMock]
  },

  getProgramaPorId: async (id: string): Promise<ProgramaFinanciamento | undefined> => {
    return programasMock.find(prog => prog.id === id)
  },

  getProgramasAtivos: async (): Promise<ProgramaFinanciamento[]> => {
    return programasMock.filter(prog => prog.status === 'Ativo')
  },

  pesquisarProgramas: async (termo: string): Promise<ProgramaFinanciamento[]> => {
    const termoBusca = termo.toLowerCase()
    return programasMock.filter(prog => 
      prog.nome.toLowerCase().includes(termoBusca) || 
      prog.descricao.toLowerCase().includes(termoBusca) ||
      prog.publicoAlvo.toLowerCase().includes(termoBusca)
    )
  },

  // Estatísticas para dashboard
  getEstatisticas: async () => {
    return {
      totalArtigos: artigosMock.length,
      totalLegislacao: legislacaoMock.length,
      totalProgramas: programasMock.length,
      programasAtivos: programasMock.filter(prog => prog.status === 'Ativo').length,
      artigosMaisVistos: artigosMock
        .sort((a, b) => b.visualizacoes - a.visualizacoes)
        .slice(0, 5),
      categoriasArtigos: [...new Set(artigosMock.map(art => art.categoria))],
      categoriasLegislacao: [...new Set(legislacaoMock.map(leg => leg.categoria))],
      tagsPopulares: obterTagsPopulares([
        ...artigosMock.flatMap(art => art.tags),
        ...legislacaoMock.flatMap(leg => leg.tags)
      ])
    }
  }
}

// Função auxiliar para obter tags mais populares
function obterTagsPopulares(todasTags: string[]): {tag: string, contagem: number}[] {
  const contagem: Record<string, number> = {}
  
  todasTags.forEach(tag => {
    contagem[tag] = (contagem[tag] || 0) + 1
  })
  
  return Object.entries(contagem)
    .map(([tag, contagem]) => ({ tag, contagem }))
    .sort((a, b) => b.contagem - a.contagem)
    .slice(0, 10)
}
