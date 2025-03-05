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
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileEdit, 
  Trash2, 
  Eye,
  FileText,
  Calendar,
  Camera
} from 'lucide-react'
import { Visita } from '@/lib/crm-utils'
import { formatarData, coresStatus } from '@/lib/formatters'
import { visitasApi } from '@/lib/mock-api/visitas'
import { clientesApi } from '@/lib/mock-api/clientes'
import { toast } from '@/hooks/use-toast'

export default function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [clientesMap, setClientesMap] = useState<{[key: string]: string}>({})
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | 'Agendada' | 'Realizada' | 'Cancelada'>('Todos')
  const [excluindo, setExcluindo] = useState(false)

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

  // Filtrar visitas com base na busca e no filtro
  const visitasFiltradas = visitas.filter(visita => {
    const correspondeAoBusca = 
      (clientesMap[visita.clienteId] && clientesMap[visita.clienteId].toLowerCase().includes(busca.toLowerCase())) ||
      (visita.observacoes && visita.observacoes.toLowerCase().includes(busca.toLowerCase()))
    
    const correspondeAoFiltro = filtro === 'Todos' || visita.status === filtro
    
    return correspondeAoBusca && correspondeAoFiltro
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
    if (!confirm('Tem certeza que deseja excluir esta visita?')) {
      return
    }
    
    try {
      setExcluindo(true)
      const sucesso = await visitasApi.excluirVisita(id)
      
      if (sucesso) {
        // Atualizar a lista de visitas
        setVisitas(prevVisitas => 
          prevVisitas.filter(v => v.id !== id)
        )
        
        toast({
          title: 'Visita excluída',
          description: 'A visita foi excluída com sucesso.',
        })
      } else {
        throw new Error('Não foi possível excluir a visita.')
      }
    } catch (error) {
      console.error('Erro ao excluir visita:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a visita.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitas Técnicas</h1>
          <p className="text-muted-foreground">
            Gerencie suas visitas técnicas e acompanhamentos em campo
          </p>
        </div>
        <Button asChild>
          <Link href="/visitas/nova">
            <Plus className="mr-2 h-4 w-4" /> Nova Visita
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de Visitas</CardTitle>
          <CardDescription>
            Total de {visitasFiltradas.length} visitas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por cliente ou observações..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Status: {filtro} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFiltro('Todos')}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Agendada')}>
                  Agendada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Realizada')}>
                  Realizada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Cancelada')}>
                  Cancelada
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Fotos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                            <Badge variant="outline" className="mt-1 bg-red-50 text-red-800 border-red-200">
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
                          <span className="text-muted-foreground">Sem projeto</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {visita.observacoes ? (
                          <span className="line-clamp-1">{visita.observacoes}</span>
                        ) : (
                          <span className="text-muted-foreground">Sem observações</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {visita.fotos && visita.fotos.length > 0 ? (
                          <span>{visita.fotos.length} foto(s)</span>
                        ) : (
                          <span className="text-muted-foreground">Sem fotos</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                                  <Calendar className="mr-2 h-4 w-4" />
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
        </CardContent>
      </Card>
    </div>
  )
}
