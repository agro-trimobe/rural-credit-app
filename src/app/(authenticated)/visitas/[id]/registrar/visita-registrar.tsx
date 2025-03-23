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
import { Textarea } from '@/components/ui/textarea'
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
import { 
  ArrowLeft, 
  Calendar, 
  Save, 
  Camera, 
  Upload,
  X,
  Plus,
  FileText
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Visita, Cliente, Propriedade, Projeto, Documento } from '@/lib/crm-utils'
import { formatarData, formatarEndereco, formatarTelefone, formatarCpfCnpj, coresStatus } from '@/lib/formatters'
import { visitasApi, clientesApi, propriedadesApi, projetosApi, documentosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Esquema de validação para o formulário
const registroVisitaSchema = z.object({
  observacoes: z.string().min(1, {
    message: 'Informe as observações da visita',
  }),
})

// Esquema para documentos
const documentoSchema = z.object({
  nome: z.string().min(1, { message: 'Informe o nome do documento' }),
  tipo: z.string().min(1, { message: 'Selecione o tipo do documento' }),
})

type RegistroVisitaFormValues = z.infer<typeof registroVisitaSchema>
type DocumentoFormValues = z.infer<typeof documentoSchema>

// Componente para registrar uma visita
export default function VisitaRegistrarConteudo({ visitaId }: { visitaId: string }) {
  const router = useRouter()
  const [visita, setVisita] = useState<Visita | null>(null)
  const [nomeCliente, setNomeCliente] = useState<string>('')
  const [nomePropriedade, setNomePropriedade] = useState<string>('')
  const [nomeProjeto, setNomeProjeto] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
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
  const form = useForm<RegistroVisitaFormValues>({
    resolver: zodResolver(registroVisitaSchema),
    defaultValues: {
      observacoes: '',
    },
  })

  useEffect(() => {
    const carregarVisita = async () => {
      try {
        setCarregando(true)
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
        
        // Verificar se a visita já foi realizada ou cancelada
        if (dadosVisita.status !== 'Agendada') {
          toast({
            title: 'Aviso',
            description: `Esta visita já está com status "${dadosVisita.status}" e não pode ser registrada novamente.`,
            variant: 'destructive',
          })
          router.push(`/visitas/${visitaId}`)
          return
        }
        
        setVisita(dadosVisita)
        form.setValue('observacoes', dadosVisita.observacoes || '')
        
        // Carregar dados do cliente
        const cliente = await clientesApi.buscarClientePorId(dadosVisita.clienteId)
        if (cliente) {
          setNomeCliente(cliente.nome)
        }
        
        // Carregar dados da propriedade
        const propriedade = await propriedadesApi.buscarPropriedadePorId(dadosVisita.propriedadeId)
        if (propriedade) {
          setNomePropriedade(propriedade.nome)
        }
        
        // Carregar dados do projeto (se existir)
        if (dadosVisita.projetoId) {
          const projeto = await projetosApi.buscarProjetoPorId(dadosVisita.projetoId)
          if (projeto) {
            setNomeProjeto(projeto.titulo)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar visita:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da visita.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarVisita()
  }, [visitaId, router, form])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const newFiles = Array.from(files)
    setArquivosSelecionados(prev => [...prev, ...newFiles])
    
    // Gerar URLs de preview para os novos arquivos
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removerArquivoSelecionado = (index: number) => {
    setArquivosSelecionados(prev => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)
      return newFiles
    })
    
    setPreviewUrls(prev => {
      const newUrls = [...prev]
      URL.revokeObjectURL(newUrls[index]) // Liberar a URL do objeto
      newUrls.splice(index, 1)
      return newUrls
    })
  }

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

  // Função para registrar a visita
  const onSubmit = async (values: RegistroVisitaFormValues) => {
    if (!visita) return
    
    try {
      setEnviando(true)
      
      // 1. Atualizar o status da visita para "Realizada"
      const visitaAtualizada = await visitasApi.atualizarStatusVisita(visitaId, 'Realizada')
      
      if (!visitaAtualizada) {
        throw new Error('Não foi possível atualizar o status da visita.')
      }
      
      // 2. Atualizar as observações da visita
      const visitaComObservacoes = await visitasApi.atualizarVisita(visitaId, {
        observacoes: values.observacoes,
      })
      
      if (!visitaComObservacoes) {
        throw new Error('Não foi possível atualizar as observações da visita.')
      }
      
      // 3. Adicionar fotos à visita (se houver)
      if (arquivosSelecionados.length > 0) {
        // Simular o upload de fotos (em um ambiente real, enviaríamos para um servidor)
        // Aqui estamos apenas criando URLs locais para simular o processo
        const novasUrls = arquivosSelecionados.map(file => URL.createObjectURL(file))
        
        const visitaComFotos = await visitasApi.adicionarFotos(visitaId, novasUrls)
        
        if (!visitaComFotos) {
          throw new Error('Não foi possível adicionar as fotos à visita.')
        }
      }
      
      // 4. Criar documentos associados à visita (se houver)
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
            clienteId: visita.clienteId,
            projetoId: visita.projetoId,
            visitaId: visitaId,
            status: 'Aprovado',
            tags: ['Visita Técnica']
          })
        }
      }
      
      toast({
        title: 'Visita registrada',
        description: 'A visita foi registrada com sucesso.',
      })
      
      // Redirecionar para a página de detalhes da visita
      router.push(`/visitas/${visitaId}`)
    } catch (error) {
      console.error('Erro ao registrar visita:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a visita.',
        variant: 'destructive',
      })
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!visita) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Visita não encontrada.</p>
            <Button asChild className="mt-4">
              <Link href="/visitas">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Visitas
              </Link>
            </Button>
          </CardContent>
        </Card>
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
        <h1 className="text-2xl font-bold tracking-tight">Registrar Visita</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Visita</CardTitle>
          <CardDescription>
            Informações da visita agendada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <div className="flex items-center space-x-2">
              <Badge className={coresStatus.visita[visita.status]}>
                {visita.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Data da Visita</p>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <p>{formatarData(visita.data)}</p>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Cliente</p>
              <p>{nomeCliente || 'Cliente não encontrado'}</p>
            </div>
            
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Propriedade</p>
              <p>{nomePropriedade || 'Propriedade não encontrada'}</p>
            </div>
            
            {visita.projetoId && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">Projeto</p>
                <p>{nomeProjeto || 'Projeto não encontrado'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Realização da Visita</CardTitle>
              <CardDescription>
                Preencha as informações sobre a visita realizada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva as observações e conclusões da visita realizada"
                        className="min-h-[150px]"
                        {...field}
                        disabled={enviando}
                      />
                    </FormControl>
                    <FormDescription>
                      Registre detalhes importantes, recomendações e próximos passos
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
                    disabled={enviando}
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
                              <option value="selecione">Selecione um tipo</option>
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
                      disabled={enviando}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Documento
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Adicionar Fotos</h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione fotos tiradas durante a visita
                  </p>
                </div>

                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Clique para selecionar</span> ou arraste e solte
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG ou JPEG (máx. 10MB por arquivo)
                      </p>
                    </div>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg, image/jpg"
                      multiple
                      onChange={handleFileChange}
                      disabled={enviando}
                    />
                  </label>
                </div>

                {previewUrls.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Fotos selecionadas ({previewUrls.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden border">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removerArquivoSelecionado(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remover"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/visitas/${visitaId}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? (
                  <>Registrando...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Registrar Visita
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
