'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Calendar, 
  MessageSquare, 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  ChevronDown, 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Phone, 
  Mail, 
  Users, 
  MapPin, 
  Clock, 
  RefreshCw, 
  ChevronRight,
  CalendarCheck
} from 'lucide-react'
import { Interacao, Cliente } from '@/lib/crm-utils'
import { interacoesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { formatarData, formatarDataHora } from '@/lib/formatters'

// Importação dos componentes padronizados
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { FiltrosPadrao } from '@/components/ui/filtros-padrao'
import { CardEstatistica } from '@/components/ui/card-padrao'
import { TabelaPadrao } from '@/components/ui/tabela-padrao'
import { AbasPadrao } from '@/components/ui/abas-padrao'

export default function InteracoesConteudo() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [interacoes, setInteracoes] = useState<Interacao[]>([])
  const [clientesMap, setClientesMap] = useState<Record<string, Cliente>>({})
  const [busca, setBusca] = useState('')
  const [interacoesFiltradas, setInteracoesFiltradas] = useState<Interacao[]>([])
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [visualizacao, setVisualizacao] = useState<'recentes' | 'todas'>('recentes')
  
  // Estatísticas calculadas
  const totalInteracoes = interacoes.length
  const interacoesPendentes = interacoes.filter(i => i.status === 'Pendente' || i.status === 'Em andamento').length
  const ultimaInteracao = interacoes.length > 0 ? 
    interacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0] : null
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar todas as interações
        const todasInteracoes = await interacoesApi.listarInteracoes()
        setInteracoes(todasInteracoes)
        setInteracoesFiltradas(todasInteracoes)
        
        // Carregar informações dos clientes relacionados
        const clientesIds = [...new Set(todasInteracoes.map(i => i.clienteId).filter(Boolean))]
        const clientesMap: Record<string, Cliente> = {}
        
        for (const clienteId of clientesIds) {
          if (clienteId) {
            const cliente = await clientesApi.buscarClientePorId(clienteId)
            if (cliente) {
              clientesMap[clienteId] = cliente
            }
          }
        }
        
        setClientesMap(clientesMap)
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as interações',
          variant: 'destructive',
        })
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])
  
  useEffect(() => {
    let filtradas = [...interacoes]
    
    // Aplicar filtro de busca
    if (busca.trim() !== '') {
      const termoBusca = busca.toLowerCase()
      filtradas = filtradas.filter(interacao => {
        const clienteNome = interacao.clienteId && clientesMap[interacao.clienteId]
          ? clientesMap[interacao.clienteId].nome.toLowerCase()
          : ''
          
        return (
          interacao.assunto.toLowerCase().includes(termoBusca) ||
          interacao.descricao.toLowerCase().includes(termoBusca) ||
          interacao.tipo.toLowerCase().includes(termoBusca) ||
          (interacao.status ? interacao.status.toLowerCase().includes(termoBusca) : false) ||
          clienteNome.includes(termoBusca)
        )
      })
    }
    
    // Aplicar filtro de tipo
    if (filtroTipo !== 'todos') {
      filtradas = filtradas.filter(interacao => 
        interacao.tipo.toLowerCase() === filtroTipo.toLowerCase()
      )
    }
    
    // Aplicar filtro de status
    if (filtroStatus !== 'todos') {
      filtradas = filtradas.filter(interacao => 
        interacao.status?.toLowerCase() === filtroStatus.toLowerCase()
      )
    }
    
    // Aplicar filtro de visualização
    if (visualizacao === 'recentes') {
      // Mostrar apenas as 20 interações mais recentes
      filtradas = filtradas
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 20)
    }
    
    setInteracoesFiltradas(filtradas)
  }, [busca, interacoes, clientesMap, filtroTipo, filtroStatus, visualizacao])
  
  // Função para obter ícone baseado no tipo de interação
  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'ligação':
        return <Phone className="h-3 w-3" />
      case 'email':
        return <Mail className="h-3 w-3" />
      case 'reunião':
        return <Users className="h-3 w-3" />
      case 'visita':
        return <MapPin className="h-3 w-3" />
      default:
        return <MessageSquare className="h-3 w-3" />
    }
  }
  
  // Função para limpar filtros
  const limparFiltros = () => {
    setBusca('')
    setFiltroTipo('todos')
    setFiltroStatus('todos')
    setVisualizacao('recentes')
  }
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho padronizado */}
      <CabecalhoPagina
        titulo="Interações"
        descricao="Gerencie todas as interações com clientes"
        acoes={
          <Button 
            onClick={() => router.push('/interacoes/nova')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Interação
          </Button>
        }
      />
      
      {/* Cards de estatísticas padronizados */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CardEstatistica
          titulo="Total de Interações"
          valor={totalInteracoes.toString()}
          icone={<MessageSquare className="h-6 w-6" />}
        />
        <CardEstatistica
          titulo="Pendentes/Em Andamento"
          valor={interacoesPendentes.toString()}
          icone={<Clock className="h-6 w-6" />}
        />
        <CardEstatistica
          titulo="Última Interação"
          valor={ultimaInteracao ? formatarData(ultimaInteracao.data) : "Nenhuma"}
          icone={<CalendarCheck className="h-6 w-6" />}
          className="text-sm"
        />
      </div>
      
      {/* Filtros padronizados */}
      <FiltrosPadrao
        valorBusca={busca}
        onBusca={(valor) => setBusca(valor)}
        placeholderBusca="Buscar interações..."
        onResetarFiltros={limparFiltros}
        botaoNovo={{
          texto: "Nova Interação",
          onClick: () => router.push('/interacoes/nova'),
          icone: <Plus className="h-4 w-4" />
        }}
        filtrosAvancados={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="tipo" className="text-xs">Tipo de Interação</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger id="tipo" className="h-8">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="ligação">Ligação</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="reunião">Reunião</SelectItem>
                  <SelectItem value="visita">Visita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="status" className="text-xs">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="status" className="h-8">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em andamento">Em andamento</SelectItem>
                  <SelectItem value="concluída">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="visualizacao" className="text-xs">Visualização</Label>
              <Select value={visualizacao} onValueChange={(v) => setVisualizacao(v as 'recentes' | 'todas')}>
                <SelectTrigger id="visualizacao" className="h-8">
                  <SelectValue placeholder="Visualização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recentes">Interações recentes</SelectItem>
                  <SelectItem value="todas">Todas as interações</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      >  
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            setCarregando(true)
            interacoesApi.listarInteracoes().then(data => {
              setInteracoes(data)
              setInteracoesFiltradas(data)
              setCarregando(false)
            })
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </FiltrosPadrao>
      
      {/* Tabs de visualização */}
      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-9">
          <TabsTrigger value="todas" className="text-xs">Todas as Interações</TabsTrigger>
          <TabsTrigger value="pendentes" className="text-xs">Pendentes/Em Andamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todas" className="mt-2">
          <Card className="border overflow-hidden">
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-sm">Interações</CardTitle>
              <CardDescription className="text-xs">
                {interacoesFiltradas.length === 0 
                  ? "Nenhuma interação encontrada" 
                  : `Mostrando ${interacoesFiltradas.length} ${interacoesFiltradas.length === 1 ? 'interação' : 'interações'}`}
              </CardDescription>
            </CardHeader>
            
            <TabelaPadrao
              dados={interacoesFiltradas}
              mensagemVazia="Nenhuma interação encontrada"
              idChave="id"
              colunas={[
                {
                  chave: "data",
                  titulo: "Data",
                  largura: "100px",
                  renderizador: (valor, item) => (
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                      {formatarData(valor)}
                    </div>
                  )
                },
                {
                  chave: "clienteId",
                  titulo: "Cliente",
                  largura: "180px",
                  renderizador: (valor, item) => (
                    valor && clientesMap[valor] ? (
                      <Link 
                        href={`/clientes/${valor}`}
                        className="font-medium text-primary hover:underline text-sm"
                      >
                        {clientesMap[valor].nome}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">Cliente não disponível</span>
                    )
                  )
                },
                {
                  chave: "tipo",
                  titulo: "Tipo",
                  largura: "100px",
                  renderizador: (valor) => (
                    <Badge variant="outline" className="flex items-center gap-1 h-6">
                      {getTipoIcon(valor)}
                      <span className="text-xs">{valor}</span>
                    </Badge>
                  )
                },
                {
                  chave: "assunto",
                  titulo: "Assunto",
                  largura: "250px",
                  renderizador: (valor, item) => (
                    <>
                      <div className="font-medium text-sm">{valor}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {item.descricao}
                      </div>
                    </>
                  )
                },
                {
                  chave: "status",
                  titulo: "Status",
                  largura: "120px",
                  renderizador: (valor) => (
                    <Badge 
                      variant={
                        valor === 'Concluída' ? 'default' : 
                        valor === 'Em andamento' ? 'secondary' : 
                        'outline'
                      }
                      className={
                        valor === 'Concluída' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                        valor === 'Em andamento' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                        'bg-orange-100 text-orange-800 hover:bg-orange-100'
                      }
                    >
                      {valor}
                    </Badge>
                  )
                }
              ]}
              acaoRenderizador={(interacao) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => router.push(`/interacoes/${interacao.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Visualizar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/interacoes/${interacao.id}/editar`)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir esta interação?")) {
                          interacoesApi.excluirInteracao(interacao.id).then(() => {
                            toast({
                              title: "Sucesso",
                              description: "Interação excluída com sucesso",
                            })
                            // Atualizar lista após exclusão
                            interacoesApi.listarInteracoes().then(data => {
                              setInteracoes(data)
                              setInteracoesFiltradas(data)
                            })
                          })
                        }
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="pendentes" className="mt-2">
          <Card className="border overflow-hidden">
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-sm">Interações Pendentes</CardTitle>
              <CardDescription className="text-xs">
                Interações que requerem acompanhamento
              </CardDescription>
            </CardHeader>
            
            <TabelaPadrao
              dados={interacoesFiltradas.filter(i => i.status === 'Pendente' || i.status === 'Em andamento')}
              mensagemVazia="Nenhuma interação pendente encontrada"
              idChave="id"
              colunas={[
                {
                  chave: "data",
                  titulo: "Data",
                  largura: "100px",
                  renderizador: (valor, item) => (
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                      {formatarData(valor)}
                    </div>
                  )
                },
                {
                  chave: "clienteId",
                  titulo: "Cliente",
                  largura: "180px",
                  renderizador: (valor, item) => (
                    valor && clientesMap[valor] ? (
                      <Link 
                        href={`/clientes/${valor}`}
                        className="font-medium text-primary hover:underline text-sm"
                      >
                        {clientesMap[valor].nome}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">Cliente não disponível</span>
                    )
                  )
                },
                {
                  chave: "tipo",
                  titulo: "Tipo",
                  largura: "100px",
                  renderizador: (valor) => (
                    <Badge variant="outline" className="flex items-center gap-1 h-6">
                      {getTipoIcon(valor)}
                      <span className="text-xs">{valor}</span>
                    </Badge>
                  )
                },
                {
                  chave: "assunto",
                  titulo: "Assunto",
                  largura: "250px",
                  renderizador: (valor, item) => (
                    <>
                      <div className="font-medium text-sm">{valor}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {item.descricao}
                      </div>
                    </>
                  )
                },
                {
                  chave: "status",
                  titulo: "Status",
                  largura: "120px",
                  renderizador: (valor) => (
                    <Badge 
                      variant={
                        valor === 'Em andamento' ? 'secondary' : 'outline'
                      }
                      className={
                        valor === 'Em andamento' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                        'bg-orange-100 text-orange-800 hover:bg-orange-100'
                      }
                    >
                      {valor}
                    </Badge>
                  )
                }
              ]}
              acaoRenderizador={(interacao) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => router.push(`/interacoes/${interacao.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Visualizar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/interacoes/${interacao.id}/editar`)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        const novaInteracao = {...interacao, status: 'Concluída'}
                        interacoesApi.atualizarInteracao(interacao.id, novaInteracao).then(() => {
                          toast({
                            title: "Sucesso",
                            description: "Interação marcada como concluída",
                          })
                          // Atualizar lista após atualização
                          interacoesApi.listarInteracoes().then(data => {
                            setInteracoes(data)
                            setInteracoesFiltradas(data)
                          })
                        }).catch(error => {
                          toast({
                            title: "Erro",
                            description: "Não foi possível atualizar a interação",
                            variant: "destructive",
                          })
                        })
                      }}
                    >
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      <span>Marcar Concluída</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}