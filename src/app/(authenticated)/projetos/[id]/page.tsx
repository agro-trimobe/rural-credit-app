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
  Calendar,
  User,
  Home,
  DollarSign,
  FileText,
  Clock,
  Tag,
  Edit
} from 'lucide-react'
import { Projeto, Cliente, Propriedade, Documento, formatarMoeda, formatarData, coresStatus, formatarValor } from '@/lib/crm-utils'
import { projetosApi, clientesApi, propriedadesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default async function ProjetoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [carregando, setCarregando] = useState(true)
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar projeto
        const dadosProjeto = await projetosApi.buscarProjetoPorId(id)
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
        
        // Carregar cliente
        if (dadosProjeto.clienteId) {
          const dadosCliente = await clientesApi.buscarClientePorId(dadosProjeto.clienteId)
          setCliente(dadosCliente)
        }
        
        // Carregar propriedade
        if (dadosProjeto.propriedadeId) {
          const dadosPropriedade = await propriedadesApi.buscarPropriedadePorId(dadosProjeto.propriedadeId)
          setPropriedade(dadosPropriedade)
        }
        
        // Carregar documentos
        const listaDocumentos = await projetosApi.listarDocumentos(id)
        setDocumentos(listaDocumentos)
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do projeto',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [id, router])

  const handleExcluir = async () => {
    if (!projeto) return

    if (window.confirm(`Tem certeza que deseja excluir o projeto ${projeto.titulo}?`)) {
      try {
        await projetosApi.excluirProjeto(projeto.id)
        toast({
          title: 'Projeto excluído',
          description: 'O projeto foi excluído com sucesso',
        })
        router.push('/projetos')
      } catch (error) {
        console.error('Erro ao excluir projeto:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o projeto',
          variant: 'destructive',
        })
      }
    }
  }

  const handleChangeStatus = async (status: 'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado') => {
    if (!projeto) return

    try {
      const projetoAtualizado = await projetosApi.atualizarProjeto(projeto.id, { status })
      if (projetoAtualizado) {
        setProjeto(projetoAtualizado)
        toast({
          title: 'Status atualizado',
          description: `O status do projeto foi alterado para ${status}`,
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do projeto',
        variant: 'destructive',
      })
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/projetos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{projeto.titulo}</h1>
        </div>
        <Button asChild>
          <Link href={`/projetos/${id}/editar`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Projeto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{projeto.titulo}</CardTitle>
              <CardDescription>
                {projeto.linhaCredito}
              </CardDescription>
            </div>
            <Badge className={coresStatus.projeto[projeto.status]}>
              {projeto.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações Gerais</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Cliente: {' '}
                      <Link href={`/clientes/${projeto.clienteId}`} className="text-primary hover:underline">
                        {cliente?.nome}
                      </Link>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Propriedade: {' '}
                      <Link href={`/propriedades/${projeto.propriedadeId}`} className="text-primary hover:underline">
                        {propriedade?.nome}
                      </Link>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Valor Total: {formatarValor(projeto.valorTotal)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Criado em: {formatarData(projeto.dataCriacao)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Atualizado em: {formatarData(projeto.dataAtualizacao)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Previsão de Término: {projeto.dataPrevisaoTermino ? formatarData(projeto.dataPrevisaoTermino) : 'Não definida'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                <div className="space-y-3">
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm">Status atual: {projeto.status}</span>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant={projeto.status === 'Em Elaboração' ? 'default' : 'outline'} 
                        onClick={() => handleChangeStatus('Em Elaboração')}
                      >
                        Em Elaboração
                      </Button>
                      <Button 
                        size="sm" 
                        variant={projeto.status === 'Em Análise' ? 'default' : 'outline'} 
                        onClick={() => handleChangeStatus('Em Análise')}
                      >
                        Em Análise
                      </Button>
                      <Button 
                        size="sm" 
                        variant={projeto.status === 'Aprovado' ? 'default' : 'outline'} 
                        onClick={() => handleChangeStatus('Aprovado')}
                      >
                        Aprovado
                      </Button>
                      <Button 
                        size="sm" 
                        variant={projeto.status === 'Contratado' ? 'default' : 'outline'} 
                        onClick={() => handleChangeStatus('Contratado')}
                      >
                        Contratado
                      </Button>
                      <Button 
                        size="sm" 
                        variant={projeto.status === 'Cancelado' ? 'default' : 'outline'} 
                        onClick={() => handleChangeStatus('Cancelado')}
                      >
                        Cancelado
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Valor Total</h3>
              <p className="text-xl font-semibold">{formatarValor(projeto.valorTotal)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Linha de Crédito</h3>
              <p>{projeto.linhaCredito}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
            <p className="text-sm">{projeto.descricao}</p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Documentos</h3>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projetos/${id}/documentos`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Todos
                </Link>
              </Button>
            </div>
            
            {documentos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentos.slice(0, 4).map((doc) => (
                  <Card key={doc.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium truncate">{doc.nome}</p>
                            <p className="text-xs text-muted-foreground">{doc.tipo}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/documentos/${doc.id}`}>
                            Ver
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum documento associado a este projeto</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/projetos">
              Voltar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/projetos/${id}/documentos/novo`}>
              <FileText className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
