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
import { ArrowLeft, Plus, MessageCircle } from 'lucide-react'
import { Cliente, Interacao, formatarData } from '@/lib/crm-utils'
import { clientesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default async function InteracoesClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [interacoes, setInteracoes] = useState<Interacao[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar cliente
        const dadosCliente = await clientesApi.buscarClientePorId(id)
        if (!dadosCliente) {
          toast({
            title: 'Erro',
            description: 'Cliente não encontrado',
            variant: 'destructive',
          })
          router.push('/clientes')
          return
        }
        
        setCliente(dadosCliente)
        
        // Carregar interações do cliente
        const interacoesDoCliente = await clientesApi.listarInteracoes(id)
        setInteracoes(interacoesDoCliente)
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do cliente',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [id, router])

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Cliente não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/clientes">Voltar para lista</Link>
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
            <Link href={`/clientes/${cliente.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Interações - {cliente.nome}</h1>
        </div>
        <Button asChild>
          <Link href={`/clientes/${cliente.id}/interacoes/nova`}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Interação
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Interações</CardTitle>
          <CardDescription>
            Todas as interações registradas com o cliente {cliente.nome}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interacoes.length === 0 ? (
            <div className="text-center py-6">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma interação registrada</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Registre a primeira interação com este cliente.
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/clientes/${cliente.id}/interacoes/nova`}>
                  Nova Interação
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {interacoes.map((interacao, index) => (
                <div key={interacao.id}>
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{interacao.assunto}</CardTitle>
                          <CardDescription>
                            {formatarData(interacao.data)} - {interacao.tipo}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {interacao.responsavel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{interacao.descricao}</p>
                    </CardContent>
                  </Card>
                  {index < interacoes.length - 1 && <Separator className="my-6" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/clientes/${cliente.id}`}>
              Voltar para Detalhes
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/clientes/${cliente.id}/interacoes/nova`}>
              Nova Interação
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
