'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  BarChart
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

  const documentosFiltrados = documentos.filter(doc => 
    doc.nome.toLowerCase().includes(busca.toLowerCase()) ||
    doc.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
    doc.tipo.toLowerCase().includes(busca.toLowerCase()) ||
    doc.status.toLowerCase().includes(busca.toLowerCase())
  )

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
    <div className="space-y-4">
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
        <Button asChild>
          <Link href={`/projetos/${projetoId}/documentos/novo`}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Documento
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
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
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            {documentos.length} documento{documentos.length !== 1 ? 's' : ''} encontrado{documentos.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documentosFiltrados.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {busca 
                  ? 'Nenhum documento encontrado para esta busca.' 
                  : 'Este projeto ainda não possui documentos cadastrados.'}
              </p>
              <Button asChild className="mt-4">
                <Link href={`/projetos/${projetoId}/documentos/novo`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Documento
                </Link>
              </Button>
            </div>
          ) : (
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
                      <Badge variant="outline">{documento.status}</Badge>
                    </TableCell>
                    <TableCell>{formatarData(documento.dataCriacao)}</TableCell>
                    <TableCell>{formatarTamanhoArquivo(documento.tamanho)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
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
