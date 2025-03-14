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
import { Projeto } from '@/lib/crm-utils'
import { formatarMoeda, formatarData, coresStatus } from '@/lib/formatters'
import { projetosApi, clientesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [clientesMap, setClientesMap] = useState<{[key: string]: string}>({})
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | 'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado'>('Todos')
  const [excluindo, setExcluindo] = useState(false)
  const [projetoParaExcluir, setProjetoParaExcluir] = useState<string | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)

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

  const handleExcluirProjeto = (id: string) => {
    setProjetoParaExcluir(id)
    setDialogoExclusaoAberto(true)
  }

  const confirmarExclusao = async () => {
    if (!projetoParaExcluir) return
    
    try {
      setExcluindo(true)
      const sucesso = await projetosApi.excluirProjeto(projetoParaExcluir)
      
      if (sucesso) {
        // Atualizar a lista de projetos removendo o projeto excluído
        setProjetos(projetos.filter(p => p.id !== projetoParaExcluir))
        
        toast({
          title: 'Projeto excluído',
          description: 'O projeto foi excluído com sucesso.',
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o projeto.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o projeto.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
      setProjetoParaExcluir(null)
      setDialogoExclusaoAberto(false)
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
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
        <CardHeader className="py-3">
          <CardTitle>Lista de Projetos</CardTitle>
          <CardDescription>
            Total de {projetosFiltrados.length} projetos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar projetos..."
                className="pl-8 w-full"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  Status: {filtro}
                  <ChevronDown className="ml-2 h-4 w-4" />
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

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Título</TableHead>
                  <TableHead className="w-[15%]">Cliente</TableHead>
                  <TableHead className="w-[15%]">Linha de Crédito</TableHead>
                  <TableHead className="w-[10%]">Valor</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[15%]">Data de Criação</TableHead>
                  <TableHead className="text-right w-[10%]">Ações</TableHead>
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
                            <DropdownMenuItem className="text-destructive" onClick={() => handleExcluirProjeto(projeto.id)}>
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

      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Você tem certeza que deseja excluir o projeto?
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
