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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  FileEdit, 
  Trash2, 
  Download,
  Tag,
  File,
  Calendar,
  User,
  CheckCircle2
} from 'lucide-react'
import { Documento, Cliente, Projeto, formatarData, coresStatus, formatarTamanhoArquivo } from '@/lib/crm-utils'
import { documentosApi, clientesApi, projetosApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default async function DocumentoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [documento, setDocumento] = useState<Documento | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar documento
        const dadosDocumento = await documentosApi.buscarDocumentoPorId(id)
        if (!dadosDocumento) {
          toast({
            title: 'Erro',
            description: 'Documento não encontrado',
            variant: 'destructive',
          })
          router.push('/documentos')
          return
        }
        
        setDocumento(dadosDocumento)
        
        // Carregar cliente
        if (dadosDocumento.clienteId) {
          const dadosCliente = await clientesApi.buscarClientePorId(dadosDocumento.clienteId)
          setCliente(dadosCliente)
        }
        
        // Carregar projeto
        if (dadosDocumento.projetoId) {
          const dadosProjeto = await projetosApi.buscarProjetoPorId(dadosDocumento.projetoId)
          setProjeto(dadosProjeto)
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do documento',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [id, router])

  const handleExcluir = async () => {
    if (!documento) return

    if (window.confirm(`Tem certeza que deseja excluir o documento ${documento.nome}?`)) {
      try {
        await documentosApi.excluirDocumento(documento.id)
        toast({
          title: 'Documento excluído',
          description: 'O documento foi excluído com sucesso.',
        })
        router.push('/documentos')
      } catch (error) {
        console.error('Erro ao excluir documento:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o documento.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleChangeStatus = async (status: string) => {
    if (!documento) return

    try {
      await documentosApi.atualizarStatusDocumento(documento.id, status)
      setDocumento({
        ...documento,
        status
      })
      toast({
        title: 'Status atualizado',
        description: `O status do documento foi alterado para ${status}.`,
      })
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do documento.',
        variant: 'destructive',
      })
    }
  }

  // Obter ícone para o tipo de arquivo
  const getIconePorFormato = (formato: string) => {
    switch (formato.toLowerCase()) {
      case 'pdf':
        return <File className="h-5 w-5 text-red-500" />
      case 'doc':
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <File className="h-5 w-5 text-green-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!documento) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Documento não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/documentos">Voltar para lista</Link>
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
            <Link href="/documentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detalhes do Documento</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <a href={documento.url} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/documentos/${documento.id}/editar`}>
              <FileEdit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleExcluir}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIconePorFormato(documento.formato)}
              <div>
                <CardTitle className="text-xl">{documento.nome}</CardTitle>
                <CardDescription>
                  {documento.tipo} • {formatarTamanhoArquivo(documento.tamanho)}
                </CardDescription>
              </div>
            </div>
            {documento.status && (
              <Badge className={coresStatus.documento[documento.status as 'Pendente' | 'Enviado' | 'Aprovado' | 'Rejeitado']}>
                {documento.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Informações do Documento</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Criado em {formatarData(documento.dataCriacao)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Atualizado em {documento.dataAtualizacao ? formatarData(documento.dataAtualizacao) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Cliente: {' '}
                      <Link href={`/clientes/${documento.clienteId}`} className="text-primary hover:underline">
                        {cliente?.nome || 'Cliente não encontrado'}
                      </Link>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Projeto: {' '}
                      {documento.projetoId ? (
                        <Link href={`/projetos/${documento.projetoId}`} className="text-primary hover:underline">
                          {projeto?.titulo || 'Projeto não encontrado'}
                        </Link>
                      ) : (
                        'Não associado'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1.5">
                    <span className="text-sm">Status atual: {documento.status}</span>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant={documento.status === 'Pendente' ? 'default' : 'outline'} 
                        onClick={() => handleChangeStatus('Pendente')}
                      >
                        Pendente
                      </Button>
                      <Button 
                        size="sm" 
                        variant={documento.status === 'Enviado' ? 'default' : 'outline'} 
                        onClick={() => handleChangeStatus('Enviado')}
                      >
                        Enviado
                      </Button>
                      <Button 
                        size="sm" 
                        variant={documento.status === 'Aprovado' ? 'default' : 'outline'} 
                        onClick={() => handleChangeStatus('Aprovado')}
                      >
                        Aprovado
                      </Button>
                      <Button 
                        size="sm" 
                        variant={documento.status === 'Rejeitado' ? 'default' : 'outline'} 
                        onClick={() => handleChangeStatus('Rejeitado')}
                      >
                        Rejeitado
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Tags</h3>
            {documento.tags && documento.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {documento.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma tag associada a este documento</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/documentos">
              Voltar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/documentos/${documento.id}/tags`}>
              <Tag className="mr-2 h-4 w-4" />
              Gerenciar Tags
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
