import { Visita, gerarIdAleatorio } from '../crm-utils'

// Dados mockados para visitas
const visitasMock: Visita[] = [
  {
    id: '1',
    clienteId: '1',
    propriedadeId: '1',
    projetoId: '1',
    data: '2024-02-10T09:00:00Z',
    status: 'Realizada',
    observacoes: 'Visita para avaliação da área onde será utilizado o trator. Verificação das condições do solo e relevo. Cliente demonstrou interesse em adquirir implementos adicionais.',
    fotos: [
      '/fotos/visita-1-foto-1.jpg',
      '/fotos/visita-1-foto-2.jpg',
      '/fotos/visita-1-foto-3.jpg'
    ],
    dataCriacao: '2024-02-05T14:30:00Z',
    dataAtualizacao: '2024-02-10T16:00:00Z'
  },
  {
    id: '2',
    clienteId: '2',
    propriedadeId: '2',
    projetoId: '2',
    data: '2024-02-25T14:00:00Z',
    status: 'Realizada',
    observacoes: 'Visita para avaliação da área do pomar e planejamento do sistema de irrigação. Verificação das fontes de água disponíveis e desnível do terreno.',
    fotos: [
      '/fotos/visita-2-foto-1.jpg',
      '/fotos/visita-2-foto-2.jpg'
    ],
    dataCriacao: '2024-02-18T11:00:00Z',
    dataAtualizacao: '2024-02-25T17:30:00Z'
  },
  {
    id: '3',
    clienteId: '3',
    propriedadeId: '3',
    projetoId: '3',
    data: '2024-01-15T10:00:00Z',
    status: 'Realizada',
    observacoes: 'Visita para avaliação da área de expansão do sistema de irrigação. Verificação da capacidade da fonte de água e condições de solo.',
    fotos: [
      '/fotos/visita-3-foto-1.jpg',
      '/fotos/visita-3-foto-2.jpg',
      '/fotos/visita-3-foto-3.jpg',
      '/fotos/visita-3-foto-4.jpg'
    ],
    dataCriacao: '2024-01-10T13:00:00Z',
    dataAtualizacao: '2024-01-15T16:30:00Z'
  },
  {
    id: '4',
    clienteId: '3',
    propriedadeId: '4',
    projetoId: '4',
    data: '2023-11-20T09:30:00Z',
    status: 'Realizada',
    observacoes: 'Visita para definição do local de construção do galpão. Avaliação do acesso para caminhões e proximidade com a área de produção.',
    fotos: [
      '/fotos/visita-4-foto-1.jpg',
      '/fotos/visita-4-foto-2.jpg'
    ],
    dataCriacao: '2023-11-15T14:00:00Z',
    dataAtualizacao: '2023-11-20T15:00:00Z'
  },
  {
    id: '5',
    clienteId: '3',
    propriedadeId: '3',
    projetoId: '3',
    data: '2024-02-20T14:00:00Z',
    status: 'Realizada',
    observacoes: 'Visita de acompanhamento do projeto de irrigação. Verificação do cronograma de execução e qualidade dos materiais.',
    fotos: [
      '/fotos/visita-5-foto-1.jpg',
      '/fotos/visita-5-foto-2.jpg',
      '/fotos/visita-5-foto-3.jpg'
    ],
    dataCriacao: '2024-02-15T10:00:00Z',
    dataAtualizacao: '2024-02-20T17:00:00Z'
  },
  {
    id: '6',
    clienteId: '4',
    propriedadeId: '5',
    projetoId: '5',
    data: '2024-03-05T10:00:00Z',
    status: 'Agendada',
    observacoes: 'Visita para avaliação da estrutura existente para recebimento das matrizes bovinas.',
    fotos: [],
    dataCriacao: '2024-03-01T18:00:00Z',
    dataAtualizacao: '2024-03-01T18:00:00Z'
  },
  {
    id: '7',
    clienteId: '5',
    propriedadeId: '6',
    projetoId: '6',
    data: '2024-02-15T09:00:00Z',
    status: 'Realizada',
    observacoes: 'Visita para avaliação da área de expansão. Coleta de amostras de solo para análise e verificação de necessidade de correção.',
    fotos: [
      '/fotos/visita-7-foto-1.jpg',
      '/fotos/visita-7-foto-2.jpg',
      '/fotos/visita-7-foto-3.jpg',
      '/fotos/visita-7-foto-4.jpg',
      '/fotos/visita-7-foto-5.jpg'
    ],
    dataCriacao: '2024-02-10T11:00:00Z',
    dataAtualizacao: '2024-02-15T16:00:00Z'
  },
  {
    id: '8',
    clienteId: '5',
    propriedadeId: '6',
    projetoId: '6',
    data: '2024-03-10T14:00:00Z',
    status: 'Agendada',
    observacoes: 'Visita para apresentação dos resultados da análise de solo e discussão do plano de correção.',
    fotos: [],
    dataCriacao: '2024-02-25T10:30:00Z',
    dataAtualizacao: '2024-02-25T10:30:00Z'
  },
  {
    id: '9',
    clienteId: '1',
    propriedadeId: '1',
    projetoId: '1',
    data: '2024-03-15T09:00:00Z',
    status: 'Agendada',
    observacoes: 'Visita para acompanhamento do processo de aquisição do trator e verificação da documentação pendente.',
    fotos: [],
    dataCriacao: '2024-02-28T14:00:00Z',
    dataAtualizacao: '2024-02-28T14:00:00Z'
  }
]

// API mockada para visitas
export const visitasApi = {
  // Listar todas as visitas
  listarVisitas: async (): Promise<Visita[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...visitasMock])
      }, 500)
    })
  },

  // Buscar visita por ID
  buscarVisitaPorId: async (id: string): Promise<Visita | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const visita = visitasMock.find(v => v.id === id) || null
        resolve(visita ? { ...visita } : null)
      }, 300)
    })
  },

  // Listar visitas por cliente
  listarVisitasPorCliente: async (clienteId: string): Promise<Visita[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const visitas = visitasMock.filter(v => v.clienteId === clienteId)
        resolve([...visitas])
      }, 400)
    })
  },

  // Listar visitas por propriedade
  listarVisitasPorPropriedade: async (propriedadeId: string): Promise<Visita[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const visitas = visitasMock.filter(v => v.propriedadeId === propriedadeId)
        resolve([...visitas])
      }, 400)
    })
  },

  // Listar visitas por projeto
  listarVisitasPorProjeto: async (projetoId: string): Promise<Visita[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const visitas = visitasMock.filter(v => v.projetoId === projetoId)
        resolve([...visitas])
      }, 400)
    })
  },

  // Listar visitas agendadas
  listarVisitasAgendadas: async (): Promise<Visita[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const visitas = visitasMock.filter(v => v.status === 'Agendada')
        resolve([...visitas])
      }, 400)
    })
  },

  // Listar visitas por período
  listarVisitasPorPeriodo: async (dataInicio: string, dataFim: string): Promise<Visita[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const inicio = new Date(dataInicio).getTime()
        const fim = new Date(dataFim).getTime()
        
        const visitas = visitasMock.filter(v => {
          const dataVisita = new Date(v.data).getTime()
          return dataVisita >= inicio && dataVisita <= fim
        })
        
        resolve([...visitas])
      }, 500)
    })
  },

  // Criar nova visita
  criarVisita: async (visita: Omit<Visita, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Visita> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novaVisita: Visita = {
          ...visita,
          id: gerarIdAleatorio(),
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
        
        visitasMock.push(novaVisita)
        resolve({ ...novaVisita })
      }, 700)
    })
  },

  // Atualizar visita
  atualizarVisita: async (id: string, dadosAtualizados: Partial<Omit<Visita, 'id' | 'dataCriacao' | 'dataAtualizacao'>>): Promise<Visita | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = visitasMock.findIndex(v => v.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const visitaAtualizada: Visita = {
          ...visitasMock[index],
          ...dadosAtualizados,
          dataAtualizacao: new Date().toISOString()
        }
        
        visitasMock[index] = visitaAtualizada
        resolve({ ...visitaAtualizada })
      }, 600)
    })
  },

  // Excluir visita
  excluirVisita: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = visitasMock.findIndex(v => v.id === id)
        if (index === -1) {
          resolve(false)
          return
        }
        
        visitasMock.splice(index, 1)
        resolve(true)
      }, 400)
    })
  },

  // Adicionar fotos a uma visita
  adicionarFotos: async (id: string, fotos: string[]): Promise<Visita | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = visitasMock.findIndex(v => v.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const visita = visitasMock[index]
        const fotosAtuais = visita.fotos || []
        
        const visitaAtualizada: Visita = {
          ...visita,
          fotos: [...fotosAtuais, ...fotos],
          dataAtualizacao: new Date().toISOString()
        }
        
        visitasMock[index] = visitaAtualizada
        resolve({ ...visitaAtualizada })
      }, 500)
    })
  },

  // Atualizar status da visita
  atualizarStatusVisita: async (id: string, status: 'Agendada' | 'Realizada' | 'Cancelada'): Promise<Visita | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = visitasMock.findIndex(v => v.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const visitaAtualizada: Visita = {
          ...visitasMock[index],
          status,
          dataAtualizacao: new Date().toISOString()
        }
        
        visitasMock[index] = visitaAtualizada
        resolve({ ...visitaAtualizada })
      }, 400)
    })
  }
}
