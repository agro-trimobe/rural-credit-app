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
import { MaskedInput } from '@/components/ui/masked-input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  ArrowLeft, 
  Calendar, 
  Save, 
  Plus, 
  X, 
  FileText,
  MapPin,
  User,
  Home,
  FileSpreadsheet,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Upload,
  Info
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Visita, Cliente, Propriedade, Projeto } from '@/lib/crm-utils'
import { formatarData, formatarEndereco, formatarTelefone, formatarCpfCnpj } from '@/lib/formatters'
import { visitasApi, clientesApi, propriedadesApi, projetosApi, documentosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Esquema de validação para o formulário
const visitaFormSchema = z.object({
  clienteId: z.string({
    required_error: 'Selecione um cliente',
  }),
  propriedadeId: z.string({
    required_error: 'Selecione uma propriedade',
  }),
  projetoId: z.string().optional(),
  data: z.string({
    required_error: 'Informe a data da visita',
  }),
  horario: z.string().optional(),
  duracao: z.string().optional(),
  status: z.enum(['Agendada', 'Realizada', 'Cancelada'], {
    required_error: 'Selecione um status',
  }),
  observacoes: z.string().optional(),
})

type VisitaFormValues = z.infer<typeof visitaFormSchema>

// Interface para documentos da visita
interface DocumentoVisita {
  nome: string;
  tipo: string;
  arquivo: File | null;
}

// Componente para criar nova visita
export default function VisitaNovaConteudo() {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [clientes, setClientes] = useState<Array<{ id: string, nome: string, telefone?: string }>>([]) 
  const [propriedades, setPropriedades] = useState<Array<{ id: string, nome: string, clienteId: string, municipio?: string, estado?: string }>>([]) 
  const [projetos, setProjetos] = useState<Array<{ id: string, titulo: string, clienteId: string, propriedadeId: string, status?: string }>>([]) 
  const [propriedadesFiltradas, setPropriedadesFiltradas] = useState<Array<{ id: string, nome: string, municipio?: string, estado?: string }>>([]) 
  const [projetosFiltrados, setProjetosFiltrados] = useState<Array<{ id: string, titulo: string, status?: string }>>([]) 
  const [documentos, setDocumentos] = useState<DocumentoVisita[]>([])
  const [activeTab, setActiveTab] = useState('dados')
  const [clienteSelecionado, setClienteSelecionado] = useState<{id: string, nome: string, telefone?: string} | null>(null)
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState<{id: string, nome: string, municipio?: string, estado?: string} | null>(null)

  // Tipos de documentos disponíveis
  const tiposDocumentos = [
    'Laudo Técnico',
    'Relatório de Visita',
    'Termo de Vistoria',
    'Análise Técnica',
    'Registro Fotográfico',
    'Outro'
  ]

  // Opções de duração da visita
  const opcoesDuracao = [
    '30 minutos',
    '1 hora',
    '2 horas',
    '3 horas',
    '4 horas',
    'Dia inteiro'
  ]

  // Configuração do formulário com validação
  const form = useForm<VisitaFormValues>({
    resolver: zodResolver(visitaFormSchema),
    defaultValues: {
      status: 'Agendada',
      data: new Date().toISOString().split('T')[0], // Data atual como padrão
      horario: '',
      duracao: '1 hora',
      observacoes: '',
    },
  })

  // Carregar dados de clientes, propriedades e projetos
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar dados em paralelo
        const [dadosClientes, dadosPropriedades, dadosProjetos] = await Promise.all([
          clientesApi.listarClientes(),
          propriedadesApi.listarPropriedades(),
          projetosApi.listarProjetos(),
        ])
        
        setClientes(dadosClientes.map(c => ({ id: c.id, nome: c.nome })))
        setPropriedades(dadosPropriedades.map(p => ({ 
          id: p.id, 
          nome: p.nome, 
          clienteId: p.clienteId 
        })))
        setProjetos(dadosProjetos.map(p => ({ 
          id: p.id, 
          titulo: p.titulo, 
          clienteId: p.clienteId,
          propriedadeId: p.propriedadeId
        })))
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados necessários.',
          variant: 'destructive',
        })
      }
    }
    
    carregarDados()
  }, [])

  // Atualizar propriedades filtradas quando o cliente mudar
  useEffect(() => {
    const clienteId = form.watch('clienteId')
    if (clienteId) {
      const propriedadesDoCliente = propriedades.filter(p => p.clienteId === clienteId)
      setPropriedadesFiltradas(propriedadesDoCliente)
      
      // Limpar propriedade selecionada se não estiver na lista filtrada
      const propriedadeAtual = form.watch('propriedadeId')
      if (propriedadeAtual && !propriedadesDoCliente.some(p => p.id === propriedadeAtual)) {
        form.setValue('propriedadeId', '')
        form.setValue('projetoId', '')
      }
    } else {
      setPropriedadesFiltradas([])
      form.setValue('propriedadeId', '')
      form.setValue('projetoId', '')
    }
  }, [form.watch('clienteId'), propriedades, form])

  // Atualizar projetos filtrados quando a propriedade mudar
  useEffect(() => {
    const clienteId = form.watch('clienteId')
    const propriedadeId = form.watch('propriedadeId')
    
    if (clienteId && propriedadeId) {
      const projetosFiltrados = projetos.filter(
        p => p.clienteId === clienteId && p.propriedadeId === propriedadeId
      )
      setProjetosFiltrados(projetosFiltrados)
      
      // Limpar projeto selecionado se não estiver na lista filtrada
      const projetoAtual = form.watch('projetoId')
      if (projetoAtual && !projetosFiltrados.some(p => p.id === projetoAtual)) {
        form.setValue('projetoId', '')
      }
    } else {
      setProjetosFiltrados([])
      form.setValue('projetoId', '')
    }
  }, [form.watch('clienteId'), form.watch('propriedadeId'), projetos, form])

  // Função para adicionar um novo documento
  const adicionarDocumento = () => {
    setDocumentos(prev => [...prev, { nome: '', tipo: '', arquivo: null }])
  }

  // Função para remover um documento
  const removerDocumento = (index: number) => {
    setDocumentos(prev => {
      const novosDocumentos = [...prev]
      novosDocumentos.splice(index, 1)
      return novosDocumentos
    })
  }

  // Função para atualizar os dados de um documento
  const atualizarDocumento = (index: number, campo: string, valor: string) => {
    setDocumentos(prev => {
      const novosDocumentos = [...prev]
      novosDocumentos[index] = { ...novosDocumentos[index], [campo]: valor }
      return novosDocumentos
    })
  }

  // Função para associar um arquivo a um documento
  const associarArquivoDocumento = (index: number, arquivo: File | null) => {
    setDocumentos(prev => {
      const novosDocumentos = [...prev]
      novosDocumentos[index] = { ...novosDocumentos[index], arquivo }
      return novosDocumentos
    })
  }

  // Função para criar nova visita
  const onSubmit = async (values: VisitaFormValues) => {
    try {
      setEnviando(true)
      
      // Converter data do formato DD/MM/YYYY para ISO
      const dataPartes = values.data.split('/');
      const dataFormatada = `${dataPartes[2]}-${dataPartes[1]}-${dataPartes[0]}T00:00:00`;
      
      // Preparar dados da visita
      const novaVisita: Omit<Visita, 'id' | 'dataCriacao' | 'dataAtualizacao'> = {
        clienteId: values.clienteId,
        propriedadeId: values.propriedadeId,
        projetoId: values.projetoId === 'nenhum' ? undefined : values.projetoId || undefined,
        data: dataFormatada,
        status: values.status,
        observacoes: values.observacoes || '',
        fotos: [],
        // Adicionar novos campos
        // Removendo campos não existentes na interface Visita
      }
      
      // Enviar para API
      const visitaCriada = await visitasApi.criarVisita(novaVisita)
      
      // Criar documentos associados à visita (se houver)
      if (documentos.length > 0) {
        const documentosValidos = documentos.filter(doc => 
          doc.nome && doc.tipo && doc.tipo !== 'selecione'
        )
        
        for (const doc of documentosValidos) {
          const tamanhoArquivo = doc.arquivo ? doc.arquivo.size : 0
          const formatoArquivo = doc.arquivo ? doc.arquivo.name.split('.').pop()?.toLowerCase() || 'pdf' : 'pdf'
          const urlArquivo = doc.arquivo ? URL.createObjectURL(doc.arquivo) : '/documentos/documento-padrao.pdf'
          
          await documentosApi.criarDocumento({
            nome: doc.nome,
            tipo: doc.tipo,
            formato: formatoArquivo,
            tamanho: tamanhoArquivo,
            url: urlArquivo,
            clienteId: values.clienteId,
            projetoId: values.projetoId || undefined,
            visitaId: visitaCriada.id,
            status: 'Aprovado',
            tags: ['Visita Técnica']
          })
        }
      }
      
      toast({
        title: 'Visita criada',
        description: `A visita foi agendada para ${formatarData(values.data)}${values.horario ? ` às ${values.horario}` : ''}.`,
      })
      
      // Redirecionar para a página de detalhes da visita
      router.push(`/visitas/${visitaCriada.id}`)
    } catch (error) {
      console.error('Erro ao criar visita:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a visita.',
        variant: 'destructive',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Nova Visita Técnica</h1>
          <p className="text-muted-foreground">
            Preencha as informações para agendar uma nova visita técnica
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/visitas">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Visitas
          </Link>
        </Button>
      </div>
      
      {/* Barra de progresso */}
      <div className="w-full bg-muted rounded-full h-2.5">
        <div className="bg-primary h-2.5 rounded-full" style={{ width: activeTab === 'dados' ? '33%' : activeTab === 'agendamento' ? '66%' : '100%' }}></div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dados" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Dados Básicos
                  </TabsTrigger>
                  <TabsTrigger value="agendamento" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> Agendamento
                  </TabsTrigger>
                  <TabsTrigger value="documentos" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Documentos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="pt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" /> Informações do Cliente
                      </CardTitle>
                      <CardDescription>
                        Selecione o cliente e a propriedade para a visita técnica
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="clienteId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cliente</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={enviando}
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
                            <FormDescription>
                              Selecione o cliente para esta visita
                            </FormDescription>
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
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={enviando || !form.watch('clienteId') || propriedadesFiltradas.length === 0}
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
                                    {propriedade.municipio && ` - ${propriedade.municipio}`}
                                    {propriedade.estado && `, ${propriedade.estado}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Selecione a propriedade para esta visita
                            </FormDescription>
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
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={enviando || !form.watch('propriedadeId') || projetosFiltrados.length === 0}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um projeto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nenhum">Nenhum projeto</SelectItem>
                                {projetosFiltrados.map((projeto) => (
                                  <SelectItem key={projeto.id} value={projeto.id}>
                                    {projeto.titulo}
                                    {projeto.status && ` (${projeto.status})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Associe esta visita a um projeto existente (opcional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="agendamento" className="pt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" /> Agendamento da Visita
                      </CardTitle>
                      <CardDescription>
                        Defina a data, horário e duração da visita técnica
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="data"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data da Visita</FormLabel>
                            <FormControl>
                              <MaskedInput
                                mask="data"
                                placeholder="DD/MM/AAAA"
                                {...field}
                                disabled={enviando}
                              />
                            </FormControl>
                            <FormDescription>
                              Informe a data da visita no formato DD/MM/AAAA
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="horario"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horário</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  placeholder="Horário"
                                  {...field}
                                  disabled={enviando}
                                />
                              </FormControl>
                              <FormDescription>
                                Informe o horário da visita
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="duracao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duração</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={enviando}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a duração" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {opcoesDuracao.map((duracao) => (
                                    <SelectItem key={duracao} value={duracao}>
                                      {duracao}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Selecione a duração estimada da visita
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5" /> Informações Adicionais
                      </CardTitle>
                      <CardDescription>
                        Defina o status e adicione observações sobre a visita
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status da Visita</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                                disabled={enviando}
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Agendada" />
                                  </FormControl>
                                  <FormLabel className="font-normal flex items-center">
                                    <CalendarDays className="h-4 w-4 mr-1 text-blue-500" /> Agendada
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Realizada" />
                                  </FormControl>
                                  <FormLabel className="font-normal flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Realizada
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Cancelada" />
                                  </FormControl>
                                  <FormLabel className="font-normal flex items-center">
                                    <XCircle className="h-4 w-4 mr-1 text-red-500" /> Cancelada
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="observacoes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Observações sobre a visita"
                                className="resize-none"
                                {...field}
                                disabled={enviando}
                              />
                            </FormControl>
                            <FormDescription>
                              Adicione informações relevantes sobre a visita
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documentos" className="pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Documentos da Visita
                      </CardTitle>
                      <CardDescription>
                        Adicione documentos relacionados à visita técnica
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={adicionarDocumento}
                            disabled={enviando || !form.watch('clienteId')}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Adicionar Documento
                          </Button>
                        </div>
                        
                        {documentos.length > 0 ? (
                          <div className="space-y-4">
                            {documentos.map((documento, index) => (
                              <div key={index} className="border rounded-md p-4 relative">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 h-8 w-8 p-0"
                                  onClick={() => removerDocumento(index)}
                                  disabled={enviando}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Nome do Documento</label>
                                    <Input 
                                      value={documento.nome} 
                                      onChange={(e) => atualizarDocumento(index, 'nome', e.target.value)}
                                      placeholder="Ex: Laudo de Vistoria"
                                      disabled={enviando}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo de Documento</label>
                                    <Select
                                      value={documento.tipo}
                                      onValueChange={(value) => atualizarDocumento(index, 'tipo', value)}
                                      disabled={enviando}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione um tipo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {tiposDocumentos.map((tipo) => (
                                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Arquivo (opcional)</label>
                                  <Input 
                                    type="file" 
                                    onChange={(e) => {
                                      const arquivo = e.target.files && e.target.files[0] ? e.target.files[0] : null
                                      associarArquivoDocumento(index, arquivo)
                                    }}
                                    disabled={enviando}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 border rounded-md bg-muted/30">
                            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Nenhum documento adicionado</p>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={adicionarDocumento}
                              disabled={enviando || !form.watch('clienteId')}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Adicionar Documento
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/visitas">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={enviando}>
                  {enviando ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Salvar Visita
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