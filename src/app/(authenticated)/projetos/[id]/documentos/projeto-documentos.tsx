'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Badge } from '@/components/ui/badge'
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Search, 
  ArrowLeft, 
  Download, 
  Eye, 
  Tag, 
  Edit, 
  Trash2, 
  Plus,
  File,
  Calendar,
  User,
  BarChart,
  MoreVertical,
  Upload,
  Grid,
  List,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileImage
} from 'lucide-react'
import { Projeto, Documento } from '@/lib/crm-utils'
import { formatarData, formatarTamanhoArquivo, coresStatus } from '@/lib/formatters'
import { documentosApi, projetosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function ProjetoDocumentosConteudo({ projetoId }: { projetoId: string }) {
  const router = useRouter()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<string | null>(null)
  const [dialogoAberto, setDialogoAberto] = useState(false)
  const [modoVisualizacao, setModoVisualizacao] = useState<'lista' | 'grade'>('lista')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar projeto
        const dadosProjeto = await projetosApi.buscarProjetoPorId(projetoId)
        if (!dadosProjeto) {
          toast({
            title: 'Erro',
            description: 'Projeto não encontrado',
            variant: 'destructive',
          })
          router.push('/projetos')
          return
        }
        
        setProjeto(dadosProjeto)
        
        // Carregar documentos do projeto
        const docs = await documentosApi.listarDocumentosPorProjeto(projetoId)
        setDocumentos(docs)
      } catch (error) {
        console.error('Erro ao carregar documentos:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os documentos do projeto.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [projetoId, router])

  const documentosFiltrados = documentos.filter(doc => {
    // Filtro de busca
    const matchBusca = 
      doc.nome.toLowerCase().includes(busca.toLowerCase()) ||
      doc.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      doc.tipo.toLowerCase().includes(busca.toLowerCase()) ||
      doc.status.toLowerCase().includes(busca.toLowerCase());
    
    // Filtro de tipo
    const matchTipo = filtroTipo === 'todos' || doc.tipo === filtroTipo;
    
    // Filtro de status
    const matchStatus = filtroStatus === 'todos' || doc.status === filtroStatus;
    
    return matchBusca && matchTipo && matchStatus;
  })

  const handleExcluirDocumento = async (documentoId: string) => {
    setDocumentoParaExcluir(documentoId)
    setDialogoAberto(true)
  }

  const confirmarExclusao = async () => {
    if (!documentoParaExcluir) return
    
    try {
      await documentosApi.excluirDocumento(documentoParaExcluir)
      setDocumentos(documentos.filter(doc => doc.id !== documentoParaExcluir))
      toast({
        title: 'Documento excluído',
        description: 'O documento foi excluído com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o documento.',
        variant: 'destructive',
      })
    } finally {
      setDialogoAberto(false)
    }
  }
  
  // Função para obter contagem de documentos por status
  const getDocumentosPorStatus = (status: string) => {
    return documentos.filter(doc => doc.status === status).length
  }
  
  // Função para obter todos os tipos de documentos únicos
  const getTiposDocumentos = () => {
    const tipos = new Set(documentos.map(doc => doc.tipo))
    return ['todos', ...Array.from(tipos)]
  }
  
  // Função para obter a cor do badge de acordo com o status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'success'
      case 'Pendente':
        return 'warning'
      case 'Em Análise':
        return 'info'
      case 'Rejeitado':
        return 'destructive'
      case 'Expirado':
        return 'outline'
      default:
        return 'secondary'
    }
  }
  
  // Função para obter o ícone de acordo com o status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <CheckCircle2 className="h-4 w-4" />
      case 'Pendente':
        return <Clock className="h-4 w-4" />
      case 'Em Análise':
        return <Search className="h-4 w-4" />
      case 'Rejeitado':
        return <XCircle className="h-4 w-4" />
      case 'Expirado':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!projeto) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Projeto não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/projetos">Voltar para lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botão de voltar e título */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/projetos/${projetoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documentos do Projeto</h1>
            <p className="text-muted-foreground">{projeto.titulo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setModoVisualizacao('lista')} 
            className={modoVisualizacao === 'lista' ? 'bg-muted' : ''}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setModoVisualizacao('grade')}
            className={modoVisualizacao === 'grade' ? 'bg-muted' : ''}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href={`/projetos/${projetoId}/documentos/novo`}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Documentos</p>
              <p className="text-2xl font-bold">{documentos.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documentos Aprovados</p>
              <p className="text-2xl font-bold">
                {getDocumentosPorStatus('Aprovado')}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 flex items-center">
            <div className="bg-amber-100 p-2 rounded-full mr-4">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documentos Pendentes</p>
              <p className="text-2xl font-bold">
                {getDocumentosPorStatus('Pendente')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área de busca e filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar documentos..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos os tipos</option>
            {getTiposDocumentos().filter(tipo => tipo !== 'todos').map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="todos">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Análise">Em Análise</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
            <option value="Expirado">Expirado</option>
          </select>
        </div>
      </div>

      {/* Área de upload interativa */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center w-full">
            <Link href={`/projetos/${projetoId}/documentos/novo`} className="w-full">
              <div className="flex flex-col items-center justify-center w-full h-32 rounded-lg cursor-pointer bg-muted/25 hover:bg-muted/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-primary" />
                  <p className="mb-1 text-sm text-center">
                    <span className="font-semibold">Clique para enviar</span> um novo documento
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (MAX. 10MB)
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para filtrar por status */}
      <Tabs defaultValue="todos" className="w-full" onValueChange={(value) => setFiltroStatus(value === 'todos' ? 'todos' : value)}>
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="Pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="Em Análise">Em Análise</TabsTrigger>
          <TabsTrigger value="Aprovado">Aprovados</TabsTrigger>
          <TabsTrigger value="Rejeitado">Rejeitados</TabsTrigger>
          <TabsTrigger value="Expirado">Expirados</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          {documentosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {busca || filtroTipo !== 'todos' || filtroStatus !== 'todos'
                      ? 'Nenhum documento encontrado com os filtros selecionados.' 
                      : 'Este projeto ainda não possui documentos cadastrados.'}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href={`/projetos/${projetoId}/documentos/novo`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Documento
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : modoVisualizacao === 'lista' ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Documentos</CardTitle>
                <CardDescription>
                  {documentosFiltrados.length} documento{documentosFiltrados.length !== 1 ? 's' : ''} encontrado{documentosFiltrados.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentosFiltrados.map((documento) => (
                      <TableRow key={documento.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{documento.nome}</p>
                              <p className="text-xs text-muted-foreground">{documento.descricao || 'Sem descrição'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{documento.tipo}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(documento.status)}
                            <Badge variant={getStatusBadgeVariant(documento.status) as any}>
                              {documento.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatarData(documento.dataCriacao)}</TableCell>
                        <TableCell>{formatarTamanhoArquivo(documento.tamanho)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/documentos/${documento.id}`} className="cursor-pointer">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/documentos/${documento.id}/editar`} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleExcluirDocumento(documento.id)}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentosFiltrados.map((documento) => (
                <Card key={documento.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-10 w-10 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium">{documento.nome}</h3>
                            <p className="text-xs text-muted-foreground">{documento.tipo}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(documento.status) as any}>
                          {documento.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {documento.descricao || 'Sem descrição'}
                      </p>
                    </div>
                    <div className="bg-muted p-3 flex items-center justify-between text-xs">
                      <span>{formatarData(documento.dataCriacao)}</span>
                      <span>{formatarTamanhoArquivo(documento.tamanho)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 bg-background border-t flex justify-end space-x-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/documentos/${documento.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/documentos/${documento.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleExcluirDocumento(documento.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Os outros TabsContent serão gerenciados pelo filtro de status */}
        <TabsContent value="Pendente"></TabsContent>
        <TabsContent value="Em Análise"></TabsContent>
        <TabsContent value="Aprovado"></TabsContent>
        <TabsContent value="Rejeitado"></TabsContent>
        <TabsContent value="Expirado"></TabsContent>
      </Tabs>
      <AlertDialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este documento?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmarExclusao}>Excluir</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
