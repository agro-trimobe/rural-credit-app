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
import { ArrowLeft, Pencil, Calendar, User, MessageSquare } from 'lucide-react'
import { Interacao, Cliente } from '@/lib/crm-utils'
import { formatarData, formatarDataHora } from '@/lib/formatters'
import { interacoesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

function InteracaoDetalhesConteudo({ interacaoId }: { interacaoId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [interacao, setInteracao] = useState<Interacao | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar interação
        const interacao = await interacoesApi.buscarInteracaoPorId(interacaoId)
        if (!interacao) {
          toast({
            title: 'Erro',
            description: 'Interação não encontrada',
            variant: 'destructive',
          })
          router.push('/interacoes')
          return
        }
        
        setInteracao(interacao)
        
        // Carregar cliente relacionado
        if (interacao.clienteId) {
          const cliente = await clientesApi.buscarClientePorId(interacao.clienteId)
          setCliente(cliente)
        }
        
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da interação',
          variant: 'destructive',
        })
      }
    }

    carregarDados()
  }, [interacaoId, router])
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!interacao) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-medium">Interação não encontrada</h2>
        <Button asChild>
          <Link href="/interacoes">Voltar para interações</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={cliente ? `/clientes/${cliente.id}/interacoes` : "/interacoes"}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{interacao.assunto}</h1>
        </div>
        <Button asChild>
          <Link href={`/interacoes/${interacaoId}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Detalhes da Interação</CardTitle>
              <CardDescription>
                Informações sobre a interação registrada
              </CardDescription>
            </div>
            <Badge 
              variant={
                interacao.status === 'Concluída' ? 'default' : 
                interacao.status === 'Em andamento' ? 'secondary' : 
                'outline'
              }
              className="ml-2"
            >
              {interacao.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Tipo</p>
              <div className="text-sm text-muted-foreground">
                <Badge variant="outline">{interacao.tipo}</Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Data</p>
              <div className="text-sm text-muted-foreground">
                <Calendar className="inline-block mr-1 h-3 w-3" />
                {formatarData(interacao.data)}
              </div>
            </div>
            
            <div className="space-y-1 col-span-2">
              <p className="text-sm font-medium">Cliente</p>
              {cliente ? (
                <Link 
                  href={`/clientes/${cliente.id}`}
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  <User className="inline-block mr-1 h-3 w-3" />
                  {cliente.nome}
                </Link>
              ) : (
                <div className="text-sm text-muted-foreground">Cliente não encontrado</div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Descrição</h3>
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="text-sm whitespace-pre-line">{interacao.descricao}</div>
              </div>
            </div>
            
            {interacao.observacoes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Observações Adicionais</h3>
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="text-sm whitespace-pre-line">{interacao.observacoes}</div>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Data de Criação</p>
              <div className="text-muted-foreground">{formatarData(interacao.dataCriacao)}</div>
            </div>
            
            <div>
              <p className="font-medium">Última Atualização</p>
              <div className="text-muted-foreground">{formatarData(interacao.dataAtualizacao)}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50">
          <div className="w-full flex justify-between">
            <Button variant="outline" asChild>
              <Link href={cliente ? `/clientes/${cliente.id}/interacoes` : "/interacoes"}>
                Voltar
              </Link>
            </Button>
            
            {cliente && (
              <Button variant="outline" asChild>
                <Link href={`/clientes/${cliente.id}/interacoes/nova`}>
                  Nova Interação
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default InteracaoDetalhesConteudo
