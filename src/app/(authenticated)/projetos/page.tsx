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
  FileText
} from 'lucide-react'
import { Projeto, formatarMoeda, formatarData, coresStatus } from '@/lib/crm-utils'
import { projetosApi, clientesApi } from '@/lib/mock-api'

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [clientesMap, setClientesMap] = useState<{[key: string]: string}>({})
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | 'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado'>('Todos')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar projetos e clientes em paralelo
        const [dadosProjetos, dadosClientes] = await Promise.all([
          projetosApi.listarProjetos(),
          clientesApi.listarClientes()
        ])
        
        setProjetos(dadosProjetos)
        
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

  // Filtrar projetos com base na busca e no filtro
  const projetosFiltrados = projetos.filter(projeto => {
    const correspondeAoBusca = 
      projeto.titulo.toLowerCase().includes(busca.toLowerCase()) || 
      (clientesMap[projeto.clienteId] && clientesMap[projeto.clienteId].toLowerCase().includes(busca.toLowerCase())) ||
      projeto.linhaCredito.toLowerCase().includes(busca.toLowerCase())
    
    const correspondeAoFiltro = filtro === 'Todos' || projeto.status === filtro
    
    return correspondeAoBusca && correspondeAoFiltro
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os projetos de crédito rural
          </p>
        </div>
        <Button asChild>
          <Link href="/projetos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Projetos</CardTitle>
          <CardDescription>
            Total de {projetosFiltrados.length} projetos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por título, cliente ou linha de crédito..."
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
                <DropdownMenuItem onClick={() => setFiltro('Em Elaboração')}>
                  Em Elaboração
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Em Análise')}>
                  Em Análise
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Aprovado')}>
                  Aprovado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Contratado')}>
                  Contratado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Cancelado')}>
                  Cancelado
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
                  <TableHead>Linha de Crédito</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projetosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum projeto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  projetosFiltrados.map((projeto) => (
                    <TableRow key={projeto.id}>
                      <TableCell className="font-medium">{projeto.titulo}</TableCell>
                      <TableCell>{clientesMap[projeto.clienteId] || 'Cliente não encontrado'}</TableCell>
                      <TableCell>{projeto.linhaCredito}</TableCell>
                      <TableCell>{formatarMoeda(projeto.valorTotal)}</TableCell>
                      <TableCell>
                        <Badge className={coresStatus.projeto[projeto.status]}>
                          {projeto.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatarData(projeto.dataCriacao)}</TableCell>
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
                              <Link href={`/projetos/${projeto.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/projetos/${projeto.id}/editar`}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/projetos/${projeto.id}/documentos`}>
                                <FileText className="mr-2 h-4 w-4" />
                                Documentos
                              </Link>
                            </DropdownMenuItem>
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
