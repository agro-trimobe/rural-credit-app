'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { Oportunidade } from '@/lib/crm-utils'
import { oportunidadesApi } from '@/lib/mock-api/oportunidades'
import { clientesApi } from '@/lib/mock-api/clientes'

// Schema de validação
const oportunidadeSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  clienteId: z.string().min(1, 'Selecione um cliente'),
  valor: z.coerce.number().min(1, 'O valor deve ser maior que zero'),
  status: z.enum(['Contato Inicial', 'Proposta Enviada', 'Negociação', 'Ganho', 'Perdido']),
  proximoContato: z.string().optional(),
})

type FormValues = z.infer<typeof oportunidadeSchema>

export default function EditarOportunidadePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Inicializar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(oportunidadeSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      clienteId: '',
      valor: 0,
      status: 'Contato Inicial',
      proximoContato: '',
    },
  })

  // Carregar dados da oportunidade e clientes
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar em paralelo oportunidade e clientes
        const [dadosOportunidade, dadosClientes] = await Promise.all([
          oportunidadesApi.buscarOportunidadePorId(id),
          clientesApi.listarClientes()
        ])
        
        if (!dadosOportunidade) {
          setErro('Oportunidade não encontrada')
          return
        }
        
        setOportunidade(dadosOportunidade)
        setClientes(dadosClientes)
        
        // Formatar data do próximo contato para o formato esperado pelo input
        let proximoContatoFormatado = ''
        if (dadosOportunidade.proximoContato) {
          const data = new Date(dadosOportunidade.proximoContato)
          proximoContatoFormatado = new Date(data.getTime() - data.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        }
        
        // Preencher formulário com dados da oportunidade
        form.reset({
          titulo: dadosOportunidade.titulo,
          descricao: dadosOportunidade.descricao,
          clienteId: dadosOportunidade.clienteId,
          valor: dadosOportunidade.valor,
          status: dadosOportunidade.status,
          proximoContato: proximoContatoFormatado,
        })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setErro('Erro ao carregar dados da oportunidade')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [id, form])

  // Função para salvar alterações
  const onSubmit = async (data: FormValues) => {
    try {
      setSalvando(true)
      
      // Converter proximoContato para ISO string se existir
      const proximoContato = data.proximoContato ? new Date(data.proximoContato).toISOString() : undefined
      
      const oportunidadeAtualizada = await oportunidadesApi.atualizarOportunidade(id, {
        ...data,
        proximoContato,
      })
      
      if (oportunidadeAtualizada) {
        router.push(`/oportunidades/${id}`)
      } else {
        setErro('Erro ao atualizar oportunidade')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setErro('Erro ao salvar alterações')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (erro && !oportunidade) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/oportunidades">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Oportunidades
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{erro}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/oportunidades">
                Voltar para lista de oportunidades
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href={`/oportunidades/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Oportunidade</CardTitle>
          <CardDescription>
            Atualize as informações da oportunidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título da oportunidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0,00" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor estimado da oportunidade
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Contato Inicial">Contato Inicial</SelectItem>
                          <SelectItem value="Proposta Enviada">Proposta Enviada</SelectItem>
                          <SelectItem value="Negociação">Negociação</SelectItem>
                          <SelectItem value="Ganho">Ganho</SelectItem>
                          <SelectItem value="Perdido">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proximoContato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próximo Contato</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Data e hora do próximo contato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva os detalhes da oportunidade" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" asChild>
                  <Link href={`/oportunidades/${id}`}>
                    Cancelar
                  </Link>
                </Button>
                <Button type="submit" disabled={salvando}>
                  {salvando ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
