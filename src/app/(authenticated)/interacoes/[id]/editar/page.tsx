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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { Cliente, Interacao } from '@/lib/crm-utils'
import { clientesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default async function InteracaoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [interacao, setInteracao] = useState<Interacao | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  
  // Formulário
  const [tipo, setTipo] = useState<'Ligação' | 'Email' | 'Reunião' | 'Visita' | 'Outro'>('Ligação')
  const [data, setData] = useState('')
  const [assunto, setAssunto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [responsavel, setResponsavel] = useState('')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Buscar todas as interações
        const todasInteracoes = await clientesApi.listarTodasInteracoes()
        const interacaoEncontrada = todasInteracoes.find(i => i.id === id)
        
        if (!interacaoEncontrada) {
          toast({
            title: 'Erro',
            description: 'Interação não encontrada',
            variant: 'destructive',
          })
          router.push('/clientes')
          return
        }
        
        setInteracao(interacaoEncontrada)
        
        // Preencher formulário
        setTipo(interacaoEncontrada.tipo as 'Ligação' | 'Email' | 'Reunião' | 'Visita' | 'Outro')
        setData(new Date(interacaoEncontrada.data).toISOString().split('T')[0])
        setAssunto(interacaoEncontrada.assunto)
        setDescricao(interacaoEncontrada.descricao)
        setResponsavel(interacaoEncontrada.responsavel)
        
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
      }
    }
    
    carregarDados()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    try {
      if (!interacao || !cliente) {
        throw new Error('Interação ou cliente não encontrado')
      }
      
      const interacaoAtualizada: Interacao = {
        ...interacao,
        tipo,
        data: new Date(data).toISOString(),
        assunto,
        descricao,
        responsavel,
        dataAtualizacao: new Date().toISOString()
      }
      
      // Em um sistema real, teríamos um endpoint específico
      await clientesApi.atualizarInteracao(interacao.id, interacaoAtualizada)
      
      toast({
        title: 'Sucesso',
        description: 'Interação atualizada com sucesso',
      })
      
      router.push(`/interacoes/${interacao.id}`)
    } catch (error) {
      console.error('Erro ao atualizar interação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a interação',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  if (!interacao || !cliente) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/interacoes/${interacao.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Interação</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Editar Interação</CardTitle>
            <CardDescription>
              Edite os dados da interação com o cliente {cliente.nome}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Interação</Label>
                <Select
                  value={tipo}
                  onValueChange={(value) => setTipo(value as 'Ligação' | 'Email' | 'Reunião' | 'Visita' | 'Outro')}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ligação">Ligação</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Reunião">Reunião</SelectItem>
                    <SelectItem value="Visita">Visita</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assunto">Assunto</Label>
                <Input
                  id="assunto"
                  name="assunto"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  name="responsavel"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/interacoes/${interacao.id}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
