'use client'

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator, 
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuSubContent 
} from '@/components/ui/dropdown-menu'
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
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  FileEdit, 
  Plus, 
  Trash2, 
  Download,
  Tag,
  File,
  CheckCircle2,
  Eye
} from 'lucide-react'
import { Documento } from '@/lib/crm-utils'
import { formatarData, coresStatus, formatarTamanhoArquivo } from '@/lib/formatters'
import { documentosApi, clientesApi } from '@/lib/mock-api'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function DocumentosPage() {
  const { toast } = useToast()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [clientesMap, setClientesMap] = useState<{[key: string]: string}>({})
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<string>('Todos')
  const [filtroTag, setFiltroTag] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<string | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar documentos e clientes em paralelo
        const [dadosDocumentos, dadosClientes] = await Promise.all([
          documentosApi.listarDocumentos(),
          clientesApi.listarClientes()
        ])
        
        setDocumentos(dadosDocumentos)
        
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

  // Obter lista de tipos de documentos únicos
  const tiposDocumentos = ['Todos', ...Array.from(new Set(documentos.map(doc => doc.tipo)))]
  
  // Obter lista de tags únicas
  const todasTags = Array.from(new Set(documentos.flatMap(doc => doc.tags || [])))
  
  // Obter lista de status únicos
  const todosStatus = ['Todos', 'Pendente', 'Enviado', 'Aprovado', 'Rejeitado']

  // Filtrar documentos com base na busca, tipo, tag e status
  const documentosFiltrados = documentos.filter(documento => {
    const correspondeAoBusca = 
      documento.nome.toLowerCase().includes(busca.toLowerCase()) || 
      (clientesMap[documento.clienteId] && clientesMap[documento.clienteId].toLowerCase().includes(busca.toLowerCase()))
    
    const correspondeAoFiltro = filtro === 'Todos' || documento.tipo === filtro
    
    const correspondeATag = !filtroTag || (documento.tags && documento.tags.includes(filtroTag))
    
    const correspondeAoStatus = filtroStatus === 'Todos' || filtroStatus === '' || documento.status === filtroStatus
    
    return correspondeAoBusca && correspondeAoFiltro && correspondeATag && correspondeAoStatus
  })

  // Obter ícone para o tipo de arquivo
  const getIconePorFormato = (formato: string) => {
    switch (formato.toLowerCase()) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />
      case 'doc':
      case 'docx':
        return <File className="h-4 w-4 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <File className="h-4 w-4 text-green-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-4 w-4 text-purple-500" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      await documentosApi.atualizarStatusDocumento(id, status)
      const documentoIndex = documentos.findIndex(doc => doc.id === id)
      if (documentoIndex !== -1) {
        const documento = documentos[documentoIndex]
        documento.status = status
        setDocumentos([...documentos.slice(0, documentoIndex), documento, ...documentos.slice(documentoIndex + 1)])
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  // Função para abrir o diálogo de confirmação de exclusão
  const abrirDialogoExclusao = (id: string) => {
    setDocumentoParaExcluir(id)
    setDialogoExclusaoAberto(true)
  }

  // Função para excluir documento após confirmação
  const handleExcluirDocumento = async () => {
    if (!documentoParaExcluir) return

    try {
      setExcluindo(documentoParaExcluir)
      const sucesso = await documentosApi.excluirDocumento(documentoParaExcluir)
      
      if (sucesso) {
        // Atualiza a lista removendo o documento excluído
        setDocumentos(documentos.filter(doc => doc.id !== documentoParaExcluir))
        
        toast({
          title: 'Documento excluído',
          description: 'O documento foi excluído com sucesso.',
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o documento.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o documento.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(null)
      setDocumentoParaExcluir(null)
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
        <Button asChild>
          <Link href="/documentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Documento
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Documentos</CardTitle>
          <CardDescription>
            Total de {documentosFiltrados.length} documentos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou cliente..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Tipo: {filtro} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                {tiposDocumentos.map((tipo) => (
                  <DropdownMenuItem key={tipo} onClick={() => setFiltro(tipo)}>
                    {tipo}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {todasTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Tag className="mr-2 h-4 w-4" />
                    {filtroTag || 'Filtrar por Tag'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem onClick={() => setFiltroTag('')}>
                    Todas as Tags
                  </DropdownMenuItem>
                  {todasTags.map((tag) => (
                    <DropdownMenuItem key={tag} onClick={() => setFiltroTag(tag)}>
                      {tag}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {filtroStatus || 'Status'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFiltroStatus('')}>
                  Todos os Status
                </DropdownMenuItem>
                {['Pendente', 'Enviado', 'Aprovado', 'Rejeitado'].map((status) => (
                  <DropdownMenuItem key={status} onClick={() => setFiltroStatus(status)}>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Nenhum documento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    documentosFiltrados.map((documento) => (
                      <TableRow key={documento.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getIconePorFormato(documento.formato)}
                            <span className="ml-2 font-medium">{documento.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>{documento.tipo}</TableCell>
                        <TableCell>
                          <Link href={`/clientes/${documento.clienteId}`} className="text-primary hover:underline">
                            {clientesMap[documento.clienteId] || 'Cliente não encontrado'}
                          </Link>
                        </TableCell>
                        <TableCell>{formatarTamanhoArquivo(documento.tamanho)}</TableCell>
                        <TableCell>
                          {documento.status && (
                            <Badge className={
                              documento.status === 'Pendente' ? coresStatus.documento['Pendente'] :
                              documento.status === 'Aprovado' ? coresStatus.documento['Aprovado'] :
                              documento.status === 'Rejeitado' ? coresStatus.documento['Rejeitado'] :
                              documento.status === 'Em análise' ? coresStatus.documento['Em análise'] :
                              'bg-gray-100 text-gray-800'
                            }>
                              {documento.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {documento.tags && documento.tags.length > 0 ? documento.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-100">
                                {tag}
                              </Badge>
                            )) : (
                              <span className="text-muted-foreground text-xs">Sem tags</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatarData(documento.dataCriacao)}</TableCell>
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
                                <Link href={`/documentos/${documento.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={documento.url} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/documentos/${documento.id}/editar`}>
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/documentos/${documento.id}/tags`}>
                                  <Tag className="mr-2 h-4 w-4" />
                                  Gerenciar Tags
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Alterar Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(documento.id, 'Pendente')}>
                                    <Badge className={coresStatus.documento['Pendente']} variant="outline">
                                      Pendente
                                    </Badge>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(documento.id, 'Enviado')}>
                                    <Badge className={coresStatus.documento['Enviado']} variant="outline">
                                      Enviado
                                    </Badge>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(documento.id, 'Aprovado')}>
                                    <Badge className={coresStatus.documento['Aprovado']} variant="outline">
                                      Aprovado
                                    </Badge>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(documento.id, 'Rejeitado')}>
                                    <Badge className={coresStatus.documento['Rejeitado']} variant="outline">
                                      Rejeitado
                                    </Badge>
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => abrirDialogoExclusao(documento.id)}
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
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog
        open={dialogoExclusaoAberto}
        onOpenChange={setDialogoExclusaoAberto}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExcluirDocumento}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!excluindo}
            >
              {excluindo ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 rounded-full border-destructive-foreground"></div>
                  Excluindo...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
