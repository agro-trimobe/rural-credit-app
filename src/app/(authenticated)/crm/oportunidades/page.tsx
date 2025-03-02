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
  ArrowUpRight
} from 'lucide-react'
import { Oportunidade, formatarMoeda, formatarData, formatarDataHora, coresStatus } from '@/lib/crm-utils'
import { oportunidadesApi } from '@/lib/mock-api/oportunidades'
import { clientesApi } from '@/lib/mock-api/clientes'

export default function OportunidadesPage() {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([])
  const [clientesMap, setClientesMap] = useState<{[key: string]: string}>({})
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | 'Prospecção' | 'Contato Inicial' | 'Proposta' | 'Negociação' | 'Fechado' | 'Perdido'>('Todos')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar oportunidades e clientes em paralelo
        const [dadosOportunidades, dadosClientes] = await Promise.all([
          oportunidadesApi.listarOportunidades(),
          clientesApi.listarClientes()
        ])
        
        setOportunidades(dadosOportunidades)
        
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

  // Filtrar oportunidades com base na busca e no filtro
  const oportunidadesFiltradas = oportunidades.filter(oportunidade => {
    const correspondeAoBusca = 
      oportunidade.titulo.toLowerCase().includes(busca.toLowerCase()) || 
      oportunidade.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (clientesMap[oportunidade.clienteId] && clientesMap[oportunidade.clienteId].toLowerCase().includes(busca.toLowerCase()))
    
    const correspondeAoFiltro = filtro === 'Todos' || oportunidade.status === filtro
    
    return correspondeAoBusca && correspondeAoFiltro
  })

  // Ordenar oportunidades: primeiro por status (Negociação, Proposta, Contato Inicial, Prospecção, Fechado, Perdido)
  // e depois por data de próximo contato (se existir) ou data de atualização
  const oportunidadesOrdenadas = [...oportunidadesFiltradas].sort((a, b) => {
    // Definir prioridade de status
    const prioridade: {[key: string]: number} = {
      'Negociação': 1,
      'Proposta': 2,
      'Contato Inicial': 3,
      'Prospecção': 4,
      'Fechado': 5,
      'Perdido': 6
    }
    
    // Primeiro ordenar por status
    if (prioridade[a.status] !== prioridade[b.status]) {
      return prioridade[a.status] - prioridade[b.status]
    }
    
    // Depois ordenar por próximo contato (se existir)
    if (a.proximoContato && b.proximoContato) {
      return new Date(a.proximoContato).getTime() - new Date(b.proximoContato).getTime()
    }
    
    // Se um tem próximo contato e outro não, priorizar o que tem
    if (a.proximoContato && !b.proximoContato) return -1
    if (!a.proximoContato && b.proximoContato) return 1
    
    // Por fim, ordenar por data de atualização (mais recente primeiro)
    const dataA = a.dataAtualizacao || a.dataCriacao
    const dataB = b.dataAtualizacao || b.dataCriacao
    return new Date(dataB).getTime() - new Date(dataA).getTime()
  })

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
          <h1 className="text-3xl font-bold tracking-tight">Oportunidades</h1>
          <p className="text-muted-foreground">
            Gerencie seu funil de vendas e oportunidades de negócio
          </p>
        </div>
        <Button asChild>
          <Link href="/crm/oportunidades/nova">
            <Plus className="mr-2 h-4 w-4" /> Nova Oportunidade
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funil de Vendas</CardTitle>
          <CardDescription>
            Total de {oportunidadesFiltradas.length} oportunidades encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por título, descrição ou cliente..."
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
                <DropdownMenuItem onClick={() => setFiltro('Prospecção')}>
                  Prospecção
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Contato Inicial')}>
                  Contato Inicial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Proposta')}>
                  Proposta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Negociação')}>
                  Negociação
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Fechado')}>
                  Fechado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Perdido')}>
                  Perdido
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Próximo Contato</TableHead>
                  <TableHead>Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oportunidadesOrdenadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhuma oportunidade encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  oportunidadesOrdenadas.map((oportunidade) => (
                    <TableRow key={oportunidade.id}>
                      <TableCell className="font-medium">{oportunidade.titulo}</TableCell>
                      <TableCell>{clientesMap[oportunidade.clienteId] || 'Cliente não encontrado'}</TableCell>
                      <TableCell>{formatarMoeda(oportunidade.valor)}</TableCell>
                      <TableCell>
                        <Badge className={coresStatus.oportunidade[oportunidade.status]}>
                          {oportunidade.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {oportunidade.proximoContato ? (
                          <div className="flex items-center">
                            {formatarData(oportunidade.proximoContato)}
                            {new Date(oportunidade.proximoContato) <= new Date() && (
                              <Badge variant="outline" className="ml-2 bg-red-50 text-red-800 border-red-200">
                                Atrasado
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Não agendado</span>
                        )}
                      </TableCell>
                      <TableCell>{formatarData(oportunidade.dataAtualizacao)}</TableCell>
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
                              <Link href={`/crm/oportunidades/${oportunidade.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/crm/oportunidades/${oportunidade.id}/editar`}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            {oportunidade.status !== 'Ganho' && oportunidade.status !== 'Perdido' && (
                              <DropdownMenuItem asChild>
                                <Link href={`/crm/oportunidades/${oportunidade.id}/avancar`}>
                                  <ArrowUpRight className="mr-2 h-4 w-4" />
                                  Avançar Status
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
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
