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
import { 
  ArrowLeft, 
  Calendar, 
  Save, 
  Plus, 
  X, 
  FileText 
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Visita } from '@/lib/crm-utils'
import { visitasApi } from '@/lib/mock-api/visitas'
import { clientesApi } from '@/lib/mock-api/clientes'
import { propriedadesApi } from '@/lib/mock-api/propriedades'
import { projetosApi } from '@/lib/mock-api/projetos'
import { documentosApi } from '@/lib/mock-api/documentos'
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
  status: z.enum(['Agendada', 'Realizada', 'Cancelada'], {
    required_error: 'Selecione um status',
  }),
  observacoes: z.string().optional(),
})

type VisitaFormValues = z.infer<typeof visitaFormSchema>

// Componente para criar nova visita
export default function VisitaNovaConteudo() {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [clientes, setClientes] = useState<Array<{ id: string, nome: string }>>([])
  const [propriedades, setPropriedades] = useState<Array<{ id: string, nome: string, clienteId: string }>>([])
  const [projetos, setProjetos] = useState<Array<{ id: string, titulo: string, clienteId: string, propriedadeId: string }>>([])
  const [propriedadesFiltradas, setPropriedadesFiltradas] = useState<Array<{ id: string, nome: string }>>([])
  const [projetosFiltrados, setProjetosFiltrados] = useState<Array<{ id: string, titulo: string }>>([])
  const [documentos, setDocumentos] = useState<Array<{ nome: string; tipo: string; arquivo: File | null }>>([])

  // Tipos de documentos disponíveis
  const tiposDocumentos = [
    'Laudo Técnico',
    'Relatório de Visita',
    'Termo de Vistoria',
    'Análise Técnica',
    'Registro Fotográfico',
    'Outro'
  ]

  // Configuração do formulário com validação
  const form = useForm<VisitaFormValues>({
    resolver: zodResolver(visitaFormSchema),
    defaultValues: {
      status: 'Agendada',
      data: new Date().toISOString().split('T')[0], // Data atual como padrão
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
        projetoId: values.projetoId || undefined,
        data: dataFormatada,
        status: values.status,
        observacoes: values.observacoes || '',
        fotos: [],
      }
      
      // Enviar para API
      const visitaCriada = await visitasApi.criarVisita(novaVisita)
      
      // Criar documentos associados à visita (se houver)
      if (documentos.length > 0) {
        const documentosValidos = documentos.filter(doc => doc.nome && doc.tipo)
        
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
        description: 'A visita foi criada com sucesso.',
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
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/visitas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nova Visita Técnica</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Visita</CardTitle>
          <CardDescription>
            Preencha as informações para agendar uma nova visita técnica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
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
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {!form.watch('clienteId') 
                          ? 'Selecione um cliente primeiro' 
                          : propriedadesFiltradas.length === 0 
                            ? 'Este cliente não possui propriedades cadastradas' 
                            : 'Selecione a propriedade para esta visita'}
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
                            <SelectValue placeholder="Selecione um projeto (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhum projeto</SelectItem>
                          {projetosFiltrados.map((projeto) => (
                            <SelectItem key={projeto.id} value={projeto.id}>
                              {projeto.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {!form.watch('propriedadeId') 
                          ? 'Selecione uma propriedade primeiro' 
                          : projetosFiltrados.length === 0 
                            ? 'Não há projetos para esta propriedade' 
                            : 'Associe a visita a um projeto (opcional)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Visita</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <MaskedInput
                            mask="data"
                            className="pl-9"
                            {...field}
                            disabled={enviando}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Data prevista para a realização da visita
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
                        disabled={enviando}
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
                      <FormDescription>
                        Status atual da visita
                      </FormDescription>
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
                          placeholder="Descreva o objetivo da visita e outras informações relevantes"
                          className="min-h-[120px]"
                          {...field}
                          disabled={enviando}
                        />
                      </FormControl>
                      <FormDescription>
                        Informações adicionais sobre a visita
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Documentos da Visita</h3>
                      <p className="text-sm text-muted-foreground">
                        Adicione documentos relacionados a esta visita
                      </p>
                    </div>
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
                        <div key={index} className="p-4 border rounded-md bg-muted/30">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Documento {index + 1}</h4>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removerDocumento(index)}
                              disabled={enviando}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
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
                              <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={documento.tipo} 
                                onChange={(e) => atualizarDocumento(index, 'tipo', e.target.value)}
                                disabled={enviando}
                              >
                                <option value="">Selecione um tipo</option>
                                {tiposDocumentos.map((tipo) => (
                                  <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                              </select>
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
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/visitas">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={enviando}>
                  {enviando ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar Visita
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
