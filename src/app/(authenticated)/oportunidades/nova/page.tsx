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
import { MaskedInput } from '@/components/ui/masked-input'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
import { 
  ArrowLeft, 
  Plus, 
  User, 
  DollarSign, 
  CalendarDays, 
  FileText, 
  MessageSquare, 
  Phone, 
  Info,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Oportunidade, Cliente } from '@/lib/crm-utils'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import { oportunidadesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  const [dataProximoContato, setDataProximoContato] = useState<Date | undefined>(undefined)

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

  // Função para lidar com a mudança de data no DatePicker
  const handleDataProximoContatoChange = (date: Date | undefined) => {
    setDataProximoContato(date);
    if (date) {
      // Formatar a data para o formato brasileiro DD/MM/AAAA HH:MM
      const dataFormatada = format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
      form.setValue('proximoContato', dataFormatada);
    } else {
      form.setValue('proximoContato', '');
    }
  };
  
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
      
      // Converter data do formato DD/MM/YYYY HH:MM para ISO
      let proximoContato;
      if (data.proximoContato) {
        const dataPartes = data.proximoContato.split(' ');
        const dataFormatada = dataPartes[0].split('/').reverse().join('-');
        proximoContato = dataPartes.length > 1 
          ? `${dataFormatada}T${dataPartes[1]}:00` 
          : `${dataFormatada}T00:00:00`;
      }
      
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
    <div className="p-4 max-w-6xl mx-auto">
      {/* Cabeçalho com breadcrumb */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/oportunidades">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            <span className="text-sm">Voltar</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Nova Oportunidade</h1>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
          {erro}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Card de Informações Básicas */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <FileText className="mr-2 h-4 w-4 text-primary" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Informações essenciais da oportunidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <MessageSquare className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        Título
                      </FormLabel>
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
                      <FormLabel className="flex items-center">
                        <User className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        Cliente
                      </FormLabel>
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
              </div>
            </CardContent>
          </Card>

          {/* Card de Detalhes Financeiros */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-primary" />
                Detalhes Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <DollarSign className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                      Valor (R$)
                    </FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="pl-8"
                          placeholder="0,00" 
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Valor estimado da oportunidade</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card de Status e Contato */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                Status e Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Info className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        Status
                      </FormLabel>
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
                          <SelectItem value="Contato Inicial">
                            <div className="flex items-center">
                              <Phone className="mr-2 h-3.5 w-3.5 text-indigo-500" />
                              <span>Contato Inicial</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Proposta Enviada">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-3.5 w-3.5 text-purple-500" />
                              <span>Proposta Enviada</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Negociação">
                            <div className="flex items-center">
                              <MessageSquare className="mr-2 h-3.5 w-3.5 text-amber-500" />
                              <span>Negociação</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Ganho">
                            <div className="flex items-center">
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-500" />
                              <span>Ganho</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Perdido">
                            <div className="flex items-center">
                              <XCircle className="mr-2 h-3.5 w-3.5 text-red-500" />
                              <span>Perdido</span>
                            </div>
                          </SelectItem>
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
                      <FormLabel className="flex items-center">
                        <Clock className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        Próximo Contato
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <DatePicker 
                            date={dataProximoContato}
                            setDate={handleDataProximoContatoChange}
                            placeholder="Selecione data e hora"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card de Descrição */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <FileText className="mr-2 h-4 w-4 text-primary" />
                Descrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva os detalhes da oportunidade" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs flex justify-end">
                      {field.value.length} caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-2 pt-2">
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
    </div>
  )
}
