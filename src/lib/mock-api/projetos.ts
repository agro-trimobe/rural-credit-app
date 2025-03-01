import { Projeto, Documento, gerarIdAleatorio } from '../crm-utils'

// Dados mockados para projetos
const projetosMock: Projeto[] = [
  {
    id: '1',
    titulo: 'Financiamento para Aquisição de Trator',
    descricao: 'Projeto para aquisição de trator agrícola para pequena propriedade através do Pronaf.',
    clienteId: '1',
    propriedadeId: '1',
    status: 'Em Análise',
    valorTotal: 120000,
    linhaCredito: 'Pronaf Mais Alimentos',
    documentos: [],
    dataCriacao: '2024-02-05T10:30:00Z',
    dataAtualizacao: '2024-02-20T14:15:00Z',
    dataPrevisaoTermino: '2024-04-10T00:00:00Z'
  },
  {
    id: '2',
    titulo: 'Sistema de Irrigação por Gotejamento',
    descricao: 'Implantação de sistema de irrigação por gotejamento em pomar de laranja.',
    clienteId: '2',
    propriedadeId: '2',
    status: 'Em Elaboração',
    valorTotal: 85000,
    linhaCredito: 'Pronamp',
    documentos: [],
    dataCriacao: '2024-02-18T09:45:00Z',
    dataAtualizacao: '2024-02-18T09:45:00Z',
    dataPrevisaoTermino: '2024-05-20T00:00:00Z'
  },
  {
    id: '3',
    titulo: 'Expansão de Sistema de Irrigação',
    descricao: 'Projeto para expansão do sistema de irrigação por pivô central em área de 500ha de milho.',
    clienteId: '3',
    propriedadeId: '3',
    status: 'Aprovado',
    valorTotal: 1200000,
    linhaCredito: 'Moderinfra',
    documentos: [],
    dataCriacao: '2024-01-10T11:20:00Z',
    dataAtualizacao: '2024-02-25T16:30:00Z',
    dataPrevisaoTermino: '2024-03-30T00:00:00Z'
  },
  {
    id: '4',
    titulo: 'Construção de Galpão para Armazenamento',
    descricao: 'Projeto para construção de galpão para armazenamento de grãos com capacidade para 2.000 toneladas.',
    clienteId: '3',
    propriedadeId: '4',
    status: 'Contratado',
    valorTotal: 750000,
    linhaCredito: 'PCA - Programa para Construção e Ampliação de Armazéns',
    documentos: [],
    dataCriacao: '2023-11-15T10:00:00Z',
    dataAtualizacao: '2024-01-20T14:45:00Z',
    dataPrevisaoTermino: '2024-06-30T00:00:00Z'
  },
  {
    id: '5',
    titulo: 'Financiamento para Aquisição de Matrizes',
    descricao: 'Projeto para aquisição de 10 matrizes bovinas para produção leiteira.',
    clienteId: '4',
    propriedadeId: '5',
    status: 'Em Elaboração',
    valorTotal: 60000,
    linhaCredito: 'Pronaf',
    documentos: [],
    dataCriacao: '2024-03-01T17:30:00Z',
    dataAtualizacao: '2024-03-01T17:30:00Z',
    dataPrevisaoTermino: '2024-05-15T00:00:00Z'
  },
  {
    id: '6',
    titulo: 'Expansão de Área de Plantio',
    descricao: 'Projeto para expansão de área de plantio de soja em 1.000ha, incluindo correção de solo e aquisição de maquinário.',
    clienteId: '5',
    propriedadeId: '6',
    status: 'Em Análise',
    valorTotal: 3500000,
    linhaCredito: 'Inovagro',
    documentos: [],
    dataCriacao: '2024-02-01T09:00:00Z',
    dataAtualizacao: '2024-02-28T11:20:00Z',
    dataPrevisaoTermino: '2024-07-30T00:00:00Z'
  }
]

// Dados mockados para documentos
const documentosMock: Documento[] = [
  {
    id: '1',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2500000,
    status: 'Aprovado',
    url: '/documentos/projeto-tecnico-1.pdf',
    dataCriacao: '2024-02-05T11:00:00Z',
    dataAtualizacao: '2024-02-20T14:00:00Z',
    clienteId: '1',
  },
  {
    id: '2',
    nome: 'Matrícula do Imóvel',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1800000,
    status: 'Aprovado',
    url: '/documentos/matricula-1.pdf',
    dataCriacao: '2024-02-05T11:15:00Z',
    dataAtualizacao: '2024-02-20T14:00:00Z',
    clienteId: '1',
  },
  {
    id: '3',
    nome: 'Orçamento do Trator',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1200000,
    status: 'Aprovado',
    url: '/documentos/orcamento-trator-1.pdf',
    dataCriacao: '2024-02-05T11:30:00Z',
    dataAtualizacao: '2024-02-20T14:00:00Z',
    clienteId: '1',
  },
  {
    id: '4',
    nome: 'DAP - Declaração de Aptidão ao Pronaf',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 950000,
    status: 'Pendente',
    url: '/documentos/dap-1.pdf',
    dataCriacao: '2024-02-05T11:45:00Z',
    dataAtualizacao: '2024-02-05T11:45:00Z',
    clienteId: '1',
  },
  {
    id: '5',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2200000,
    status: 'Enviado',
    url: '/documentos/projeto-tecnico-2.pdf',
    dataCriacao: '2024-02-18T10:00:00Z',
    dataAtualizacao: '2024-02-18T10:00:00Z',
    clienteId: '2',
  },
  {
    id: '6',
    nome: 'Orçamento do Sistema de Irrigação',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1500000,
    status: 'Enviado',
    url: '/documentos/orcamento-irrigacao-2.pdf',
    dataCriacao: '2024-02-18T10:15:00Z',
    dataAtualizacao: '2024-02-18T10:15:00Z',
    clienteId: '2',
  },
  {
    id: '7',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2000000,
    status: 'Aprovado',
    url: '/documentos/projeto-tecnico-3.pdf',
    dataCriacao: '2024-01-10T11:30:00Z',
    dataAtualizacao: '2024-02-25T16:00:00Z',
    clienteId: '3',
  },
  {
    id: '8',
    nome: 'Licença Ambiental',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1000000,
    status: 'Aprovado',
    url: '/documentos/licenca-ambiental-3.pdf',
    dataCriacao: '2024-01-10T11:45:00Z',
    dataAtualizacao: '2024-02-25T16:00:00Z',
    clienteId: '3',
  },
  {
    id: '9',
    nome: 'Orçamento do Sistema de Irrigação',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1800000,
    status: 'Aprovado',
    url: '/documentos/orcamento-irrigacao-3.pdf',
    dataCriacao: '2024-01-10T12:00:00Z',
    dataAtualizacao: '2024-02-25T16:00:00Z',
    clienteId: '3',
  },
  {
    id: '10',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2500000,
    status: 'Aprovado',
    url: '/documentos/projeto-tecnico-4.pdf',
    dataCriacao: '2023-11-15T10:30:00Z',
    dataAtualizacao: '2024-01-20T14:30:00Z',
    clienteId: '3',
  },
  {
    id: '11',
    nome: 'Licença Ambiental',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1200000,
    status: 'Aprovado',
    url: '/documentos/licenca-ambiental-4.pdf',
    dataCriacao: '2023-11-15T10:45:00Z',
    dataAtualizacao: '2024-01-20T14:30:00Z',
    clienteId: '3',
  },
  {
    id: '12',
    nome: 'Orçamento da Construção',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2000000,
    status: 'Aprovado',
    url: '/documentos/orcamento-construcao-4.pdf',
    dataCriacao: '2023-11-15T11:00:00Z',
    dataAtualizacao: '2024-01-20T14:30:00Z',
    clienteId: '3',
  },
  {
    id: '13',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2200000,
    status: 'Pendente',
    url: '/documentos/projeto-tecnico-5.pdf',
    dataCriacao: '2024-03-01T17:45:00Z',
    dataAtualizacao: '2024-03-01T17:45:00Z',
    clienteId: '4',
  },
  {
    id: '14',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2000000,
    status: 'Enviado',
    url: '/documentos/projeto-tecnico-6.pdf',
    dataCriacao: '2024-02-01T09:30:00Z',
    dataAtualizacao: '2024-02-28T11:00:00Z',
    clienteId: '5',
  },
  {
    id: '15',
    nome: 'Estudo de Viabilidade Econômica',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1500000,
    status: 'Enviado',
    url: '/documentos/viabilidade-6.pdf',
    dataCriacao: '2024-02-01T09:45:00Z',
    dataAtualizacao: '2024-02-28T11:00:00Z',
    clienteId: '5',
  },
  {
    id: '16',
    nome: 'Licença Ambiental',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1000000,
    status: 'Pendente',
    url: '/documentos/licenca-ambiental-5.pdf',
    dataCriacao: '2024-02-01T10:00:00Z',
    dataAtualizacao: '2024-02-01T10:00:00Z',
    clienteId: '5',
  }
]

// Associar documentos aos projetos
const documentosPorProjeto = {
  '1': ['1', '2', '3', '4'],
  '2': ['5', '6'],
  '3': ['7', '8', '9'],
  '4': ['10', '11', '12'],
  '5': ['13'],
  '6': ['14', '15', '16']
}

Object.entries(documentosPorProjeto).forEach(([projetoId, docsIds]) => {
  const projeto = projetosMock.find(p => p.id === projetoId)
  if (projeto) {
    projeto.documentos = docsIds.map(docId => {
      const doc = documentosMock.find(d => d.id === docId)
      return doc ? { ...doc } : null
    }).filter(Boolean) as Documento[]
  }
})

// API mockada para projetos
export const projetosApi = {
  // Listar todos os projetos
  listarProjetos: async (): Promise<Projeto[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...projetosMock])
      }, 500)
    })
  },

  // Buscar projeto por ID
  buscarProjetoPorId: async (id: string): Promise<Projeto | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projeto = projetosMock.find(p => p.id === id) || null
        resolve(projeto ? { ...projeto } : null)
      }, 300)
    })
  },

  // Listar projetos por cliente
  listarProjetosPorCliente: async (clienteId: string): Promise<Projeto[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projetos = projetosMock.filter(p => p.clienteId === clienteId)
        resolve([...projetos])
      }, 400)
    })
  },

  // Listar projetos por propriedade
  listarProjetosPorPropriedade: async (propriedadeId: string): Promise<Projeto[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projetos = projetosMock.filter(p => p.propriedadeId === propriedadeId)
        resolve([...projetos])
      }, 400)
    })
  },

  // Criar novo projeto
  criarProjeto: async (projeto: Omit<Projeto, 'id' | 'dataCriacao' | 'dataAtualizacao' | 'documentos'>): Promise<Projeto> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novoProjeto: Projeto = {
          ...projeto,
          id: gerarIdAleatorio(),
          documentos: [],
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
        
        projetosMock.push(novoProjeto)
        resolve({ ...novoProjeto })
      }, 700)
    })
  },

  // Atualizar projeto
  atualizarProjeto: async (id: string, dadosAtualizados: Partial<Omit<Projeto, 'id' | 'dataCriacao' | 'dataAtualizacao'>>): Promise<Projeto | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = projetosMock.findIndex(p => p.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const projetoAtualizado: Projeto = {
          ...projetosMock[index],
          ...dadosAtualizados,
          dataAtualizacao: new Date().toISOString()
        }
        
        projetosMock[index] = projetoAtualizado
        resolve({ ...projetoAtualizado })
      }, 600)
    })
  },

  // Excluir projeto
  excluirProjeto: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = projetosMock.findIndex(p => p.id === id)
        if (index === -1) {
          resolve(false)
          return
        }
        
        projetosMock.splice(index, 1)
        resolve(true)
      }, 400)
    })
  },

  // Listar documentos de um projeto
  listarDocumentos: async (projetoId: string): Promise<Documento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projeto = projetosMock.find(p => p.id === projetoId)
        if (!projeto) {
          resolve([])
          return
        }
        
        resolve([...projeto.documentos])
      }, 300)
    })
  },

  // Adicionar documento
  adicionarDocumento: async (projetoId: string, documento: Omit<Documento, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Documento | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projeto = projetosMock.find(p => p.id === projetoId)
        if (!projeto) {
          resolve(null)
          return
        }
        
        const novoDocumento: Documento = {
          ...documento,
          id: gerarIdAleatorio(),
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
        
        documentosMock.push(novoDocumento)
        projeto.documentos.push(novoDocumento)
        
        resolve({ ...novoDocumento })
      }, 500)
    })
  },

  // Atualizar status do documento
  atualizarStatusDocumento: async (documentoId: string, status: string): Promise<Documento | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documento = documentosMock.find(d => d.id === documentoId)
        if (!documento) {
          resolve(null)
          return
        }
        
        documento.status = status
        documento.dataAtualizacao = new Date().toISOString()
        
        // Atualizar o documento no projeto
        projetosMock.forEach(projeto => {
          const docIndex = projeto.documentos.findIndex(d => d.id === documentoId)
          if (docIndex !== -1) {
            projeto.documentos[docIndex] = { ...documento }
          }
        })
        
        resolve({ ...documento })
      }, 400)
    })
  }
}
