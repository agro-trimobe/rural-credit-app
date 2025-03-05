'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft, Plus } from 'lucide-react'
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

export default function NovaOportunidadePage() {
  const router = useRouter()
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

  // Carregar lista de clientes
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setCarregando(true)
        const dadosClientes = await clientesApi.listarClientes()
        setClientes(dadosClientes)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        setErro('Erro ao carregar lista de clientes')
      } finally {
        setCarregando(false)
      }
    }

    carregarClientes()
  }, [])

  // Função para criar nova oportunidade
  const onSubmit = async (data: FormValues) => {
    try {
      setSalvando(true)
      
      // Converter proximoContato para ISO string se existir
      const proximoContato = data.proximoContato ? new Date(data.proximoContato).toISOString() : undefined
      
      const novaOportunidade = await oportunidadesApi.criarOportunidade({
        ...data,
        proximoContato,
      })
      
      if (novaOportunidade) {
        router.push(`/oportunidades/${novaOportunidade.id}`)
      } else {
        setErro('Erro ao criar oportunidade')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setErro('Erro ao criar oportunidade')
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/oportunidades">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Oportunidades
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Oportunidade</CardTitle>
          <CardDescription>
            Crie uma nova oportunidade de negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {erro && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-6">
              {erro}
            </div>
          )}

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
                  <Link href="/oportunidades">
                    Cancelar
                  </Link>
                </Button>
                <Button type="submit" disabled={salvando}>
                  {salvando ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Criar Oportunidade
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
