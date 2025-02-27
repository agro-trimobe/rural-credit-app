'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { ChevronRight, Home, Upload, X, User, Phone, Mail, FileText, Target, DollarSign, Building2, MapPin, FileUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/hooks/use-toast'

const formSchema = z.object({
  clientName: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido'),
  projectName: z.string().min(1, 'Nome do projeto é obrigatório'),
  purpose: z.string().min(1, 'Finalidade é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  creditLine: z.string().min(1, 'Linha de crédito é obrigatória'),
  propertyName: z.string().min(1, 'Nome da propriedade é obrigatório'),
  area: z.string().min(1, 'Área é obrigatória'),
  location: z.string().min(1, 'Localização é obrigatória'),
})

export default function NewProjectPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Fazer uma chamada simples para a API para verificar a autenticação
        await apiClient.projects.list();
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Redirecionar para login se não estiver autenticado
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: '',
      document: '',
      phone: '',
      email: '',
      projectName: '',
      purpose: '',
      amount: '',
      creditLine: '',
      propertyName: '',
      area: '',
      location: '',
    }
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // 1. Criar o projeto
      const project = await apiClient.projects.create(data)

      // 2. Fazer upload dos documentos
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(file => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('projectId', project.id)
          formData.append('category', 'documentos-pessoais')
          return apiClient.documents.upload(formData)
        })

        await Promise.all(uploadPromises)
      }

      toast({
        title: "Projeto criado com sucesso",
        description: "O projeto e seus documentos foram salvos"
      })

      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro ao criar projeto",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/projects" className="hover:text-foreground transition-colors">
            Projetos
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Novo Projeto</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Novo Projeto</h1>
        <p className="text-muted-foreground">
          Preencha as informações abaixo para criar um novo projeto de crédito rural
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Seção: Informações do Cliente */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Informações do Cliente</h2>
                  <p className="text-sm text-muted-foreground">
                    Dados do cliente solicitante do crédito
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <User className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <FileText className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" type="email" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Seção: Informações do Projeto */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Informações do Projeto</h2>
                  <p className="text-sm text-muted-foreground">
                    Detalhes do projeto de financiamento
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Projeto</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <FileText className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finalidade do Financiamento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ""}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="pl-9">
                              <span className="absolute left-3 top-3 text-muted-foreground">
                                <Target className="h-4 w-4" />
                              </span>
                              <SelectValue placeholder="Selecione a finalidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="insumos">Aquisição de Insumos</SelectItem>
                            <SelectItem value="maquinas">Compra de Máquinas</SelectItem>
                            <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Solicitado</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creditLine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linha de Crédito</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ""}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="pl-9">
                              <span className="absolute left-3 top-3 text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                              </span>
                              <SelectValue placeholder="Selecione a linha" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pronaf">PRONAF</SelectItem>
                            <SelectItem value="pronamp">PRONAMP</SelectItem>
                            <SelectItem value="moderfrota">MODERFROTA</SelectItem>
                            <SelectItem value="pca">PCA</SelectItem>
                            <SelectItem value="inovagro">INOVAGRO</SelectItem>
                            <SelectItem value="moderinfra">MODERINFRA</SelectItem>
                            <SelectItem value="prodecoop">PRODECOOP</SelectItem>
                            <SelectItem value="abc">ABC</SelectItem>
                            <SelectItem value="proirriga">PROIRRIGA</SelectItem>
                            <SelectItem value="pronara">PRONARA</SelectItem>
                            <SelectItem value="finame">FINAME</SelectItem>
                            <SelectItem value="outros">OUTROS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Seção: Propriedade Rural */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Propriedade Rural</h2>
                  <p className="text-sm text-muted-foreground">
                    Informações sobre o imóvel rural
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="propertyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Propriedade</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área (hectares)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <Target className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Digite o endereço ou as coordenadas da propriedade
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Seção: Documentos */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Anexos de Documentos</h2>
                  <p className="text-sm text-muted-foreground">
                    Adicione os documentos necessários para análise
                  </p>
                </div>
                <div className="rounded-lg border border-dashed p-8">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <FileUp className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-muted-foreground">
                        Arraste arquivos aqui ou clique para selecionar
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Suportamos arquivos PDF, JPEG e PNG até 10MB
                      </p>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                      <input
                        type="file"
                        id="file-upload"
                        ref={fileInputRef}
                        className="absolute w-0 h-0 opacity-0"
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button 
                        variant="outline" 
                        className="w-full cursor-pointer" 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Arquivos
                      </Button>
                      {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium">Arquivos selecionados:</p>
                          <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                                <span className="text-sm truncate">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Projeto'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
