'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Visita } from '@/lib/crm-utils'
import { visitasApi } from '@/lib/mock-api/visitas'
import { clientesApi } from '@/lib/mock-api/clientes'
import { propriedadesApi } from '@/lib/mock-api/propriedades'
import { projetosApi } from '@/lib/mock-api/projetos'
import { toast } from '@/hooks/use-toast'

const formSchema = z.object({
  data: z.string().min(1, {
    message: 'A data da visita é obrigatória.',
  }),
  status: z.enum(['Agendada', 'Realizada', 'Cancelada']),
  observacoes: z.string().optional(),
  clienteId: z.string().min(1, {
    message: 'O cliente é obrigatório.',
  }),
  propriedadeId: z.string().min(1, {
    message: 'A propriedade é obrigatória.',
  }),
  projetoId: z.string().optional(),
})

export default function VisitaEditarConteudo({ visitaId }: { visitaId: string }) {
  const router = useRouter()
  const [visita, setVisita] = useState<Visita | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [propriedades, setPropriedades] = useState<{ id: string; nome: string }[]>([])
  const [projetos, setProjetos] = useState<{ id: string; titulo: string }[]>([])
  const [propriedadesFiltradas, setPropriedadesFiltradas] = useState<{ id: string; nome: string }[]>([])
  const [projetosFiltrados, setProjetosFiltrados] = useState<{ id: string; titulo: string }[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: '',
      status: 'Agendada' as const,
      observacoes: '',
      clienteId: '',
      propriedadeId: '',
      projetoId: '',
    },
  })

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
        
        // Carregar clientes
        const dadosClientes = await clientesApi.listarClientes()
        setClientes(dadosClientes.map(c => ({ id: c.id, nome: c.nome })))
        
        // Carregar todas as propriedades
        const todasPropriedades = await propriedadesApi.listarPropriedades()
        setPropriedades(todasPropriedades.map(p => ({ id: p.id, nome: p.nome })))
        
        // Carregar todos os projetos
        const todosProjetos = await projetosApi.listarProjetos()
        setProjetos(todosProjetos.map(p => ({ id: p.id, titulo: p.titulo })))
        
        // Filtrar propriedades do cliente
        const propsFiltradas = todasPropriedades
          .filter(p => p.clienteId === dadosVisita.clienteId)
          .map(p => ({ id: p.id, nome: p.nome }))
        setPropriedadesFiltradas(propsFiltradas)
        
        // Filtrar projetos do cliente
        const projsFiltrados = todosProjetos
          .filter(p => p.clienteId === dadosVisita.clienteId)
          .map(p => ({ id: p.id, titulo: p.titulo }))
        setProjetosFiltrados(projsFiltrados)
        
        // Formatar a data para o formato esperado pelo input (YYYY-MM-DDThh:mm)
        const dataVisita = new Date(dadosVisita.data)
        const dataFormatada = dataVisita.toISOString().slice(0, 16)
        
        // Preencher o formulário com os dados da visita
        form.reset({
          data: dataFormatada,
          status: dadosVisita.status,
          observacoes: dadosVisita.observacoes,
          clienteId: dadosVisita.clienteId,
          propriedadeId: dadosVisita.propriedadeId,
          projetoId: dadosVisita.projetoId || '',
        })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da visita.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [visitaId, router, form])

  // Atualizar propriedades e projetos quando o cliente mudar
  const handleClienteChange = async (clienteId: string) => {
    try {
      // Buscar propriedades do cliente selecionado
      const propriedadesCliente = await propriedadesApi.listarPropriedadesPorCliente(clienteId)
      const propsFiltradas = propriedadesCliente.map(p => ({ id: p.id, nome: p.nome }))
      setPropriedadesFiltradas(propsFiltradas)
      
      // Limpar seleção de propriedade
      form.setValue('propriedadeId', '')
      
      // Buscar projetos do cliente selecionado
      const projetosCliente = await projetosApi.listarProjetosPorCliente(clienteId)
      const projsFiltrados = projetosCliente.map(p => ({ id: p.id, titulo: p.titulo }))
      setProjetosFiltrados(projsFiltrados)
      
      // Limpar seleção de projeto
      form.setValue('projetoId', '')
    } catch (error) {
      console.error('Erro ao atualizar propriedades e projetos:', error)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!visita) return
    
    try {
      setSalvando(true)
      
      // Atualizar visita
      const visitaAtualizada = await visitasApi.atualizarVisita(visitaId, {
        data: values.data,
        status: values.status,
        observacoes: values.observacoes || '',
        clienteId: values.clienteId,
        propriedadeId: values.propriedadeId,
        projetoId: values.projetoId || undefined,
      })
      
      if (!visitaAtualizada) {
        throw new Error('Não foi possível atualizar a visita.')
      }
      
      toast({
        title: 'Visita atualizada',
        description: 'A visita foi atualizada com sucesso.',
      })
      
      router.push(`/visitas/${visitaId}`)
    } catch (error) {
      console.error('Erro ao atualizar visita:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a visita.',
        variant: 'destructive',
      })
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
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/visitas/${visitaId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Editar Visita</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Visita</CardTitle>
          <CardDescription>
            Atualize os dados da visita técnica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select
                        disabled={salvando}
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleClienteChange(value)
                        }}
                        value={field.value}
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
                  name="propriedadeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Propriedade</FormLabel>
                      <Select
                        disabled={salvando || !form.getValues('clienteId')}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma propriedade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propriedadesFiltradas.map((propriedade) => (
                            <SelectItem key={propriedade.id} value={propriedade.id}>
                              {propriedade.nome}
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
                  name="projetoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projeto (opcional)</FormLabel>
                      <Select
                        disabled={salvando || !form.getValues('clienteId')}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um projeto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {projetosFiltrados.map((projeto) => (
                            <SelectItem key={projeto.id} value={projeto.id}>
                              {projeto.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Associe a visita a um projeto específico (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora da Visita</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          placeholder="Data e hora da visita"
                          {...field}
                          disabled={salvando}
                        />
                      </FormControl>
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
                        disabled={salvando}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Agendada">Agendada</SelectItem>
                          <SelectItem value="Realizada">Realizada</SelectItem>
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações sobre a visita"
                        className="min-h-32"
                        {...field}
                        disabled={salvando}
                      />
                    </FormControl>
                    <FormDescription>
                      Descreva detalhes da visita, como condições encontradas, recomendações, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={salvando}
                  asChild
                >
                  <Link href={`/visitas/${visitaId}`}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
