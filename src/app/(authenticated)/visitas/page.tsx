'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Plus, 
  Search, 
  MoreHorizontal, 
  FileEdit, 
  Trash2, 
  Eye,
  FileText,
  Calendar,
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  Map,
  List,
  Filter,
  CheckSquare,
  X,
  CalendarDays
} from 'lucide-react'
import { Visita } from '@/lib/crm-utils'
import { formatarData, coresStatus } from '@/lib/formatters'
import { visitasApi, clientesApi } from '@/lib/api'
import { CalendarioVisitas } from '@/components/visitas/calendario-visitas'
import { MapaVisitas } from '@/components/visitas/mapa-visitas'
import { toast } from '@/hooks/use-toast'

export default function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [clientesMap, setClientesMap] = useState<{[key: string]: string}>({})
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | 'Agendada' | 'Realizada' | 'Cancelada'>('Todos')
  const [excluindo, setExcluindo] = useState(false)
  const [visitaParaExcluir, setVisitaParaExcluir] = useState<string | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)
  const [visualizacao, setVisualizacao] = useState<'lista' | 'calendario' | 'mapa'>('lista')
  const [periodoFiltro, setPeriodoFiltro] = useState<'todos' | 'hoje' | 'semana' | 'mes'>('todos')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar visitas e clientes em paralelo
        const [dadosVisitas, dadosClientes] = await Promise.all([
          visitasApi.listarVisitas(),
          clientesApi.listarClientes()
        ])
        
        setVisitas(dadosVisitas)
        
        // Criar mapa de ID do cliente para nome do cliente
        const mapaClientes: {[key: string]: string} = {}
        dadosClientes.forEach(cliente => {
          mapaClientes[cliente.id] = cliente.nome
        })
        setClientesMap(mapaClientes)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  // Funções auxiliares para estatísticas
  const calcularEstatisticas = () => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const emSeteDias = new Date(hoje)
    emSeteDias.setDate(hoje.getDate() + 7)
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    
    const totalVisitas = visitas.length
    const visitasPendentes = visitas.filter(v => v.status === 'Agendada').length
    const visitasRealizadasMes = visitas.filter(v => 
      v.status === 'Realizada' && 
      new Date(v.data) >= inicioMes
    ).length
    const visitasProximaSemana = visitas.filter(v => {
      const dataVisita = new Date(v.data)
      return v.status === 'Agendada' && 
             dataVisita >= hoje && 
             dataVisita <= emSeteDias
    }).length
    
    return {
      totalVisitas,
      visitasPendentes,
      visitasRealizadasMes,
      visitasProximaSemana
    }
  }
  
  // Aplicar filtro de período
  const filtrarPorPeriodo = (visita: Visita) => {
    if (periodoFiltro === 'todos') return true
    
    const dataVisita = new Date(visita.data)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    if (periodoFiltro === 'hoje') {
      const fimDoDia = new Date(hoje)
      fimDoDia.setHours(23, 59, 59, 999)
      return dataVisita >= hoje && dataVisita <= fimDoDia
    }
    
    if (periodoFiltro === 'semana') {
      const inicioSemana = new Date(hoje)
      inicioSemana.setDate(hoje.getDate() - hoje.getDay())
      const fimSemana = new Date(inicioSemana)
      fimSemana.setDate(inicioSemana.getDate() + 6)
      fimSemana.setHours(23, 59, 59, 999)
      return dataVisita >= inicioSemana && dataVisita <= fimSemana
    }
    
    if (periodoFiltro === 'mes') {
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999)
      return dataVisita >= inicioMes && dataVisita <= fimMes
    }
    
    return true
  }

  // Filtrar visitas com base na busca e no filtro
  const visitasFiltradas = visitas.filter(visita => {
    const correspondeAoBusca = 
      (clientesMap[visita.clienteId] && clientesMap[visita.clienteId].toLowerCase().includes(busca.toLowerCase())) ||
      (visita.observacoes && visita.observacoes.toLowerCase().includes(busca.toLowerCase()))
    
    const correspondeAoFiltro = filtro === 'Todos' || visita.status === filtro
    const correspondeAoPeriodo = filtrarPorPeriodo(visita)
    
    return correspondeAoBusca && correspondeAoFiltro && correspondeAoPeriodo
  })

  // Ordenar visitas: primeiro por data (próximas visitas agendadas primeiro)
  // e depois por status (Agendada, Realizada, Cancelada)
  const visitasOrdenadas = [...visitasFiltradas].sort((a, b) => {
    // Se ambas são agendadas, ordenar por data (mais próxima primeiro)
    if (a.status === 'Agendada' && b.status === 'Agendada') {
      return new Date(a.data).getTime() - new Date(b.data).getTime()
    }
    
    // Priorizar visitas agendadas
    if (a.status === 'Agendada' && b.status !== 'Agendada') return -1
    if (a.status !== 'Agendada' && b.status === 'Agendada') return 1
    
    // Para visitas realizadas ou canceladas, ordenar por data (mais recente primeiro)
    return new Date(b.data).getTime() - new Date(a.data).getTime()
  })

  // Verificar se a visita está atrasada (data no passado e status ainda é Agendada)
  const isVisitaAtrasada = (visita: Visita) => {
    return visita.status === 'Agendada' && new Date(visita.data) < new Date()
  }

  const handleExcluirVisita = async (id: string) => {
    setVisitaParaExcluir(id)
    setDialogoExclusaoAberto(true)
  }

  const confirmarExclusao = async () => {
    if (!visitaParaExcluir) return
    
    try {
      setExcluindo(true)
      const sucesso = await visitasApi.excluirVisita(visitaParaExcluir)
      
      if (sucesso) {
        // Atualizar a lista de visitas removendo a visita excluída
        setVisitas(visitas.filter(v => v.id !== visitaParaExcluir))
        
        toast({
          title: 'Visita excluída',
          description: 'A visita foi excluída com sucesso.',
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a visita.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao excluir visita:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a visita.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
      setVisitaParaExcluir(null)
      setDialogoExclusaoAberto(false)
    }
  }

  // Calcular estatísticas para os cards
  const estatisticas = calcularEstatisticas()

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container p-4 space-y-4 mx-auto max-w-7xl">
      {/* Cabeçalho e Ações Principais */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Visitas Técnicas
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas visitas técnicas e acompanhamentos em campo
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/visitas/nova">
            <Plus className="mr-2 h-4 w-4" /> Nova Visita
          </Link>
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total de Visitas</p>
              <h3 className="text-2xl font-bold">{estatisticas.totalVisitas}</h3>
            </div>
            <CalendarDays className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Visitas Pendentes</p>
              <h3 className="text-2xl font-bold">{estatisticas.visitasPendentes}</h3>
            </div>
            <Clock className="h-8 w-8 text-amber-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Realizadas este Mês</p>
              <h3 className="text-2xl font-bold">{estatisticas.visitasRealizadasMes}</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Próximos 7 dias</p>
              <h3 className="text-2xl font-bold">{estatisticas.visitasProximaSemana}</h3>
            </div>
            <Calendar className="h-8 w-8 text-blue-500 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Alternância entre Visualizações */}
      <Tabs defaultValue="lista" className="w-full" onValueChange={(value) => setVisualizacao(value as 'lista' | 'calendario' | 'mapa')}>
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="lista" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="mapa" className="flex items-center">
              <Map className="h-4 w-4 mr-2" />
              Mapa
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-muted-foreground">
            Total de {visitasFiltradas.length} visitas encontradas
          </div>
        </div>
        
        <TabsContent value="lista" className="mt-2">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              {/* Filtros e Busca */}
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por cliente ou observações..." 
                    className="pl-8 w-full"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={filtro} onValueChange={(value) => setFiltro(value as 'Todos' | 'Agendada' | 'Realizada' | 'Cancelada')}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="Agendada">Agendada</SelectItem>
                      <SelectItem value="Realizada">Realizada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={periodoFiltro} onValueChange={(value) => setPeriodoFiltro(value as 'todos' | 'hoje' | 'semana' | 'mes')}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="hoje">Hoje</SelectItem>
                      <SelectItem value="semana">Esta semana</SelectItem>
                      <SelectItem value="mes">Este mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Tabela de Visitas */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[130px]">Data</TableHead>
                      <TableHead className="w-[180px]">Cliente</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[120px]">Projeto</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead className="w-[80px]">Fotos</TableHead>
                      <TableHead className="w-[60px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitasOrdenadas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Nenhuma visita encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visitasOrdenadas.map((visita) => (
                        <TableRow key={visita.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{formatarData(visita.data)}</span>
                              {isVisitaAtrasada(visita) && (
                                <Badge variant="outline" className="mt-1 bg-red-50 text-red-800 border-red-200 text-xs">
                                  Atrasada
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{clientesMap[visita.clienteId] || 'Cliente não encontrado'}</TableCell>
                          <TableCell>
                            <Badge className={coresStatus.visita[visita.status]}>
                              {visita.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {visita.projetoId ? (
                              <Link href={`/projetos/${visita.projetoId}`} className="text-primary hover:underline">
                                Ver projeto
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-xs">Sem projeto</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {visita.observacoes ? (
                              <span className="line-clamp-1">{visita.observacoes}</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">Sem observações</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {visita.fotos && visita.fotos.length > 0 ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                {visita.fotos.length} foto(s)
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">Sem fotos</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/visitas/${visita.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Visualizar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/visitas/${visita.id}/editar`}>
                                    <FileEdit className="mr-2 h-4 w-4" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                {visita.status === 'Agendada' && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/visitas/${visita.id}/registrar`}>
                                      <CheckSquare className="mr-2 h-4 w-4" />
                                      Registrar Visita
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <Link href={`/visitas/${visita.id}/documentos`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Documentos
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/visitas/${visita.id}/fotos`}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Gerenciar Fotos
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleExcluirVisita(visita.id)}
                                  disabled={excluindo}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Paginação */}
              {visitasOrdenadas.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {visitasOrdenadas.length} de {visitasFiltradas.length} visitas
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendario" className="mt-2">
          <CalendarioVisitas visitas={visitasFiltradas} clientesMap={clientesMap} />
        </TabsContent>
        
        <TabsContent value="mapa" className="mt-2">
          <MapaVisitas visitas={visitasFiltradas} clientesMap={clientesMap} />
        </TabsContent>
      </Tabs>
      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Visita</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta visita?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
