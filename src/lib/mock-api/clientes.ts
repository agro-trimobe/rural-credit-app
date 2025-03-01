import { Cliente, Propriedade, Interacao, gerarIdAleatorio, gerarDataAleatoria, gerarValorAleatorio } from '../crm-utils'

// Dados mockados para clientes
const clientesMock: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva',
    cpfCnpj: '123.456.789-00',
    email: 'joao.silva@email.com',
    telefone: '(11) 98765-4321',
    tipo: 'Pessoa Física',
    perfil: 'Pequeno',
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Ribeirão Preto',
      estado: 'SP',
      cep: '14010-000'
    },
    propriedades: [],
    interacoes: [],
    dataCadastro: '2024-01-15T10:30:00Z',
    dataAtualizacao: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    cpfCnpj: '987.654.321-00',
    email: 'maria.oliveira@email.com',
    telefone: '(16) 98765-1234',
    tipo: 'Pessoa Física',
    perfil: 'Médio',
    endereco: {
      logradouro: 'Avenida Brasil',
      numero: '456',
      bairro: 'Jardim América',
      cidade: 'São Carlos',
      estado: 'SP',
      cep: '13560-000'
    },
    propriedades: [],
    interacoes: [],
    dataCadastro: '2024-02-10T14:20:00Z',
    dataAtualizacao: '2024-02-10T14:20:00Z'
  },
  {
    id: '3',
    nome: 'Fazenda São Francisco Ltda',
    cpfCnpj: '12.345.678/0001-90',
    email: 'contato@fazendafrancisco.com.br',
    telefone: '(17) 3322-5544',
    tipo: 'Pessoa Jurídica',
    perfil: 'Grande',
    endereco: {
      logradouro: 'Rodovia SP-333',
      numero: 'Km 122',
      bairro: 'Zona Rural',
      cidade: 'Jaboticabal',
      estado: 'SP',
      cep: '14870-000'
    },
    propriedades: [],
    interacoes: [],
    dataCadastro: '2023-11-05T09:15:00Z',
    dataAtualizacao: '2024-01-20T11:30:00Z'
  },
  {
    id: '4',
    nome: 'Carlos Mendes',
    cpfCnpj: '456.789.123-00',
    email: 'carlos.mendes@email.com',
    telefone: '(14) 99876-5432',
    tipo: 'Pessoa Física',
    perfil: 'Pequeno',
    endereco: {
      logradouro: 'Rua dos Ipês',
      numero: '789',
      bairro: 'Jardim Primavera',
      cidade: 'Bauru',
      estado: 'SP',
      cep: '17020-000'
    },
    propriedades: [],
    interacoes: [],
    dataCadastro: '2024-03-01T16:45:00Z',
    dataAtualizacao: '2024-03-01T16:45:00Z'
  },
  {
    id: '5',
    nome: 'Agropecuária Bom Futuro S.A.',
    cpfCnpj: '98.765.432/0001-10',
    email: 'financeiro@bomfuturo.com.br',
    telefone: '(18) 3223-4455',
    tipo: 'Pessoa Jurídica',
    perfil: 'Grande',
    endereco: {
      logradouro: 'Rodovia BR-153',
      numero: 'Km 45',
      bairro: 'Zona Rural',
      cidade: 'Marília',
      estado: 'SP',
      cep: '17500-000'
    },
    propriedades: [],
    interacoes: [],
    dataCadastro: '2023-08-20T10:00:00Z',
    dataAtualizacao: '2024-02-15T14:30:00Z'
  }
]

// Dados mockados para propriedades
const propriedadesMock: Propriedade[] = [
  {
    id: '1',
    nome: 'Sítio Boa Esperança',
    area: 12.5,
    unidadeMedida: 'ha',
    coordenadas: {
      latitude: -21.1767,
      longitude: -47.8208
    },
    endereco: {
      logradouro: 'Estrada Municipal',
      numero: 'Km 5',
      bairro: 'Zona Rural',
      cidade: 'Ribeirão Preto',
      estado: 'SP',
      cep: '14110-000'
    },
    clienteId: '1',
    dataCadastro: '2024-01-15T11:00:00Z',
    dataAtualizacao: '2024-01-15T11:00:00Z'
  },
  {
    id: '2',
    nome: 'Fazenda Santa Luzia',
    area: 85,
    unidadeMedida: 'ha',
    coordenadas: {
      latitude: -22.0087,
      longitude: -47.8909
    },
    endereco: {
      logradouro: 'Rodovia SP-215',
      numero: 'Km 150',
      bairro: 'Zona Rural',
      cidade: 'São Carlos',
      estado: 'SP',
      cep: '13560-000'
    },
    clienteId: '2',
    dataCadastro: '2024-02-10T15:00:00Z',
    dataAtualizacao: '2024-02-10T15:00:00Z'
  },
  {
    id: '3',
    nome: 'Fazenda São Francisco - Sede',
    area: 1200,
    unidadeMedida: 'ha',
    coordenadas: {
      latitude: -21.2551,
      longitude: -48.3225
    },
    endereco: {
      logradouro: 'Rodovia SP-333',
      numero: 'Km 122',
      bairro: 'Zona Rural',
      cidade: 'Jaboticabal',
      estado: 'SP',
      cep: '14870-000'
    },
    clienteId: '3',
    dataCadastro: '2023-11-05T10:00:00Z',
    dataAtualizacao: '2023-11-05T10:00:00Z'
  },
  {
    id: '4',
    nome: 'Fazenda São Francisco - Filial',
    area: 850,
    unidadeMedida: 'ha',
    coordenadas: {
      latitude: -21.3012,
      longitude: -48.4001
    },
    endereco: {
      logradouro: 'Rodovia SP-333',
      numero: 'Km 135',
      bairro: 'Zona Rural',
      cidade: 'Jaboticabal',
      estado: 'SP',
      cep: '14870-000'
    },
    clienteId: '3',
    dataCadastro: '2023-11-05T10:30:00Z',
    dataAtualizacao: '2023-11-05T10:30:00Z'
  },
  {
    id: '5',
    nome: 'Chácara Recanto',
    area: 5.2,
    unidadeMedida: 'ha',
    coordenadas: {
      latitude: -22.3156,
      longitude: -49.0708
    },
    endereco: {
      logradouro: 'Estrada Municipal',
      numero: 'Km 3',
      bairro: 'Zona Rural',
      cidade: 'Bauru',
      estado: 'SP',
      cep: '17100-000'
    },
    clienteId: '4',
    dataCadastro: '2024-03-01T17:00:00Z',
    dataAtualizacao: '2024-03-01T17:00:00Z'
  },
  {
    id: '6',
    nome: 'Fazenda Bom Futuro - Unidade 1',
    area: 3500,
    unidadeMedida: 'ha',
    coordenadas: {
      latitude: -22.2145,
      longitude: -49.9458
    },
    endereco: {
      logradouro: 'Rodovia BR-153',
      numero: 'Km 45',
      bairro: 'Zona Rural',
      cidade: 'Marília',
      estado: 'SP',
      cep: '17500-000'
    },
    clienteId: '5',
    dataCadastro: '2023-08-20T11:00:00Z',
    dataAtualizacao: '2023-08-20T11:00:00Z'
  }
]

// Dados mockados para interações
const interacoesMock: Interacao[] = [
  {
    id: '1',
    clienteId: '1',
    tipo: 'Telefone',
    descricao: 'Cliente entrou em contato para solicitar informações sobre linhas de crédito para pequenos produtores.',
    data: '2024-02-01T09:30:00Z',
    responsavel: 'Ana Paula'
  },
  {
    id: '2',
    clienteId: '1',
    tipo: 'Email',
    descricao: 'Enviado material informativo sobre o Pronaf.',
    data: '2024-02-02T14:15:00Z',
    responsavel: 'Ana Paula'
  },
  {
    id: '3',
    clienteId: '2',
    tipo: 'Reunião',
    descricao: 'Reunião presencial para discutir projeto de financiamento para aquisição de trator.',
    data: '2024-02-15T10:00:00Z',
    responsavel: 'Carlos Eduardo'
  },
  {
    id: '4',
    clienteId: '3',
    tipo: 'WhatsApp',
    descricao: 'Cliente solicitou agendamento de visita técnica para avaliação de projeto de irrigação.',
    data: '2024-01-25T16:40:00Z',
    responsavel: 'Marcelo Santos'
  },
  {
    id: '5',
    clienteId: '3',
    tipo: 'Reunião',
    descricao: 'Apresentação de proposta para financiamento de sistema de irrigação.',
    data: '2024-02-10T14:00:00Z',
    responsavel: 'Marcelo Santos'
  },
  {
    id: '6',
    clienteId: '4',
    tipo: 'Telefone',
    descricao: 'Primeiro contato com o cliente, que busca informações sobre crédito para pequenos produtores.',
    data: '2024-03-01T15:30:00Z',
    responsavel: 'Ana Paula'
  },
  {
    id: '7',
    clienteId: '5',
    tipo: 'Email',
    descricao: 'Envio de documentação complementar para análise de projeto de expansão.',
    data: '2024-02-20T11:20:00Z',
    responsavel: 'Marcelo Santos'
  }
]

// Vincular propriedades e interações aos clientes
clientesMock.forEach(cliente => {
  cliente.propriedades = propriedadesMock.filter(prop => prop.clienteId === cliente.id)
  cliente.interacoes = interacoesMock.filter(inter => inter.clienteId === cliente.id)
})

// API mockada para clientes
export const clientesApi = {
  // Listar todos os clientes
  listarClientes: async (): Promise<Cliente[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...clientesMock])
      }, 500)
    })
  },

  // Buscar cliente por ID
  buscarClientePorId: async (id: string): Promise<Cliente | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cliente = clientesMock.find(c => c.id === id) || null
        resolve(cliente ? { ...cliente } : null)
      }, 300)
    })
  },

  // Criar novo cliente
  criarCliente: async (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'dataAtualizacao' | 'propriedades' | 'interacoes'>): Promise<Cliente> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novoCliente: Cliente = {
          ...cliente,
          id: gerarIdAleatorio(),
          propriedades: [],
          interacoes: [],
          dataCadastro: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
        clientesMock.push(novoCliente)
        resolve({ ...novoCliente })
      }, 700)
    })
  },

  // Atualizar cliente
  atualizarCliente: async (id: string, dadosAtualizados: Partial<Omit<Cliente, 'id' | 'dataCadastro' | 'dataAtualizacao'>>): Promise<Cliente | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = clientesMock.findIndex(c => c.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const clienteAtualizado: Cliente = {
          ...clientesMock[index],
          ...dadosAtualizados,
          dataAtualizacao: new Date().toISOString()
        }
        
        clientesMock[index] = clienteAtualizado
        resolve({ ...clienteAtualizado })
      }, 600)
    })
  },

  // Excluir cliente
  excluirCliente: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = clientesMock.findIndex(c => c.id === id)
        if (index === -1) {
          resolve(false)
          return
        }
        
        clientesMock.splice(index, 1)
        resolve(true)
      }, 400)
    })
  },

  // Listar propriedades de um cliente
  listarPropriedades: async (clienteId: string): Promise<Propriedade[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const propriedades = propriedadesMock.filter(p => p.clienteId === clienteId)
        resolve([...propriedades])
      }, 300)
    })
  },

  // Adicionar propriedade
  adicionarPropriedade: async (propriedade: Omit<Propriedade, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Promise<Propriedade> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novaPropriedade: Propriedade = {
          ...propriedade,
          id: gerarIdAleatorio(),
          dataCadastro: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
        
        propriedadesMock.push(novaPropriedade)
        
        // Atualizar a lista de propriedades do cliente
        const cliente = clientesMock.find(c => c.id === propriedade.clienteId)
        if (cliente) {
          cliente.propriedades.push(novaPropriedade)
        }
        
        resolve({ ...novaPropriedade })
      }, 500)
    })
  },

  // Listar interações de um cliente
  listarInteracoes: async (clienteId: string): Promise<Interacao[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const interacoes = interacoesMock.filter(i => i.clienteId === clienteId)
        resolve([...interacoes])
      }, 300)
    })
  },

  // Adicionar interação
  adicionarInteracao: async (interacao: Omit<Interacao, 'id'>): Promise<Interacao> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novaInteracao: Interacao = {
          ...interacao,
          id: gerarIdAleatorio()
        }
        
        interacoesMock.push(novaInteracao)
        
        // Atualizar a lista de interações do cliente
        const cliente = clientesMock.find(c => c.id === interacao.clienteId)
        if (cliente) {
          cliente.interacoes.push(novaInteracao)
        }
        
        resolve({ ...novaInteracao })
      }, 400)
    })
  }
}
