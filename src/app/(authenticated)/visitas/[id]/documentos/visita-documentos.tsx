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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  FileEdit, 
  Trash2, 
  Eye,
  FileText,
  Search,
  Download,
  MoreHorizontal,
  Plus,
  Tag
} from 'lucide-react'
import { Visita, Documento, Cliente } from '@/lib/crm-utils'
import { formatarDataHora, formatarTamanhoArquivo } from '@/lib/formatters'
import { visitasApi, documentosApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function VisitaDocumentosConteudo({ visitaId }: { visitaId: string }) {
  const router = useRouter()
  const [visita, setVisita] = useState<Visita | null>(null)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [nomeCliente, setNomeCliente] = useState<string>('')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [excluindo, setExcluindo] = useState(false)
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<string | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar visita
        const dadosVisita = await visitasApi.buscarVisitaPorId(visitaId)
        
        if (!dadosVisita) {
          toast({
            title: 'Erro',
            description: 'Visita não encontrada',
            variant: 'destructive',
          })
          router.push('/visitas')
          return
        }
        
        setVisita(dadosVisita)
        
        // Carregar documentos da visita
        const dadosDocumentos = await documentosApi.listarDocumentosPorVisita(visitaId)
        setDocumentos(dadosDocumentos)
        
        // Carregar dados do cliente
        const cliente = await clientesApi.buscarClientePorId(dadosVisita.clienteId)
        if (cliente) {
          setNomeCliente(cliente.nome)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados necessários.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [visitaId, router])

  // Filtrar documentos com base na busca
  const documentosFiltrados = documentos.filter(documento => {
    const termoBusca = busca.toLowerCase()
    return (
      documento.nome.toLowerCase().includes(termoBusca) ||
      documento.tipo.toLowerCase().includes(termoBusca) ||
      (documento.tags && documento.tags.some(tag => tag.toLowerCase().includes(termoBusca)))
    )
  })

  const handleExcluirDocumento = async (documentoId: string) => {
    setDocumentoParaExcluir(documentoId)
    setDialogoExclusaoAberto(true)
  }

  const confirmarExclusao = async () => {
    if (!documentoParaExcluir) return
    
    try {
      setExcluindo(true)
      const sucesso = await documentosApi.excluirDocumento(documentoParaExcluir)
      
      if (sucesso) {
        // Atualizar a lista de documentos removendo o documento excluído
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
        description: 'Ocorreu um erro ao excluir o documento.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
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

  if (!visita) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Visita não encontrada.</p>
            <Button asChild className="mt-4">
              <Link href="/visitas">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Visitas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/visitas/${visitaId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Documentos da Visita</h1>
        </div>
        <Button asChild>
          <Link href={`/documentos/novo?visitaId=${visitaId}&clienteId=${visita.clienteId}`}>
            <Plus className="mr-2 h-4 w-4" /> Novo Documento
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            Gerenciar documentos relacionados à visita em {nomeCliente}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, tipo ou tag..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Formato</TableHead>
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
                      {busca ? (
                        <>Nenhum documento encontrado para a busca: <strong>{busca}</strong></>
                      ) : (
                        <>Nenhum documento associado a esta visita.</>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  documentosFiltrados.map((documento) => (
                    <TableRow key={documento.id}>
                      <TableCell>
                        <div className="font-medium">{documento.nome}</div>
                      </TableCell>
                      <TableCell>{documento.tipo}</TableCell>
                      <TableCell className="uppercase">{documento.formato}</TableCell>
                      <TableCell>{formatarTamanhoArquivo(documento.tamanho)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          documento.status === 'Aprovado' ? 'bg-green-50 text-green-700 border-green-200' :
                          documento.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          documento.status === 'Rejeitado' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }>
                          {documento.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {documento.tags && documento.tags.length > 0 ? (
                            documento.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">Sem tags</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {formatarDataHora(documento.dataCriacao)}
                        </div>
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
                              <Link href={`/documentos/${documento.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </Link>
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
                            <DropdownMenuItem asChild>
                              <a href={documento.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleExcluirDocumento(documento.id)}
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
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Total: {documentosFiltrados.length} documento(s)
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este documento?
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
