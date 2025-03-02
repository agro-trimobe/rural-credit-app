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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, User, MessageCircle, Edit, Trash2 } from 'lucide-react'
import { Cliente, Interacao, formatarData, formatarDataHora } from '@/lib/crm-utils'
import { clientesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default async function InteracaoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [interacao, setInteracao] = useState<Interacao | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Buscar todas as interações (em um sistema real, teríamos um endpoint específico)
        const todasInteracoes = await clientesApi.listarTodasInteracoes()
        const interacaoEncontrada = todasInteracoes.find(i => i.id === id)
        
        if (!interacaoEncontrada) {
          toast({
            title: 'Erro',
            description: 'Interação não encontrada',
            variant: 'destructive',
          })
          router.push('/crm/clientes')
          return
        }
        
        setInteracao(interacaoEncontrada)
        
        // Carregar dados do cliente
        const dadosCliente = await clientesApi.buscarClientePorId(interacaoEncontrada.clienteId)
        if (dadosCliente) {
          setCliente(dadosCliente)
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da interação',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [id, router])

  const handleExcluir = async () => {
    if (!interacao || !cliente) return

    if (window.confirm(`Tem certeza que deseja excluir esta interação?`)) {
      try {
        // Em um sistema real, teríamos um endpoint específico
        await clientesApi.excluirInteracao(interacao.id)
        
        toast({
          title: 'Interação excluída',
          description: 'A interação foi excluída com sucesso.',
        })
        
        router.push(`/crm/clientes/${cliente.id}/interacoes`)
      } catch (error) {
        console.error('Erro ao excluir interação:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a interação.',
          variant: 'destructive',
        })
      }
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!interacao || !cliente) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Interação não encontrada</p>
            <Button asChild className="mt-4">
              <Link href="/crm/clientes">Voltar para lista de clientes</Link>
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
            <Link href={`/crm/clientes/${cliente.id}/interacoes`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detalhes da Interação</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/crm/interacoes/${interacao.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{interacao.assunto}</CardTitle>
              <CardDescription>
                {formatarData(interacao.data)} - {interacao.tipo}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {interacao.responsavel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações da Interação</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Data: {formatarData(interacao.data)}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Tipo: {interacao.tipo}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Responsável: {interacao.responsavel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Cliente</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Link href={`/crm/clientes/${cliente.id}`} className="text-sm text-primary hover:underline">
                      {cliente.nome}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Descrição</h3>
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{interacao.descricao}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p>Criado em: {formatarDataHora(interacao.dataCriacao)}</p>
            </div>
            {interacao.dataAtualizacao && (
              <div>
                <p>Atualizado em: {formatarDataHora(interacao.dataAtualizacao)}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/crm/clientes/${cliente.id}/interacoes`}>
              Voltar para Lista
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/crm/clientes/${cliente.id}/interacoes/nova`}>
              Nova Interação
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
