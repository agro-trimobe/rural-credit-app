'use client'

import { useState, useEffect } from 'react'
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
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/hooks/use-toast'

const PROJECT_STATUS = {
  'em_andamento': 'Em Andamento',
  'concluido': 'Concluído',
  'cancelado': 'Cancelado',
  'aguardando_documentos': 'Aguardando Documentos',
  'em_analise': 'Em Análise'
} as const;

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
  status: z.string().min(1, 'Status é obrigatório'),
})

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)

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
      status: '',
    },
  })

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await apiClient.projects.get(params.id as string)

        // Preencher o formulário com os dados do projeto
        form.reset({
          clientName: project.clientName,
          document: project.document,
          phone: project.phone,
          email: project.email,
          projectName: project.projectName,
          purpose: project.purpose,
          amount: project.amount.toString(),
          creditLine: project.creditLine,
          propertyName: project.propertyName,
          area: project.area.toString(),
          location: project.location,
          status: project.status,
        })
      } catch (error) {
        console.error('Erro ao carregar projeto:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do projeto',
          variant: 'destructive',
        })
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)

      await apiClient.projects.update(params.id as string, {
        ...values,
        amount: parseFloat(values.amount.replace(/\./g, '').replace(',', '.')),
        area: parseFloat(values.area),
      })

      toast({
        title: 'Sucesso',
        description: 'Projeto atualizado com sucesso',
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o projeto',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/projects" className="hover:text-primary">Projetos</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground">Editar Projeto</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Editar Projeto</h1>
          <p className="text-sm text-muted-foreground">
            Atualize as informações do projeto
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Informações do Cliente</CardTitle>
                <CardDescription className="text-xs">
                  Dados do cliente responsável pelo projeto
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Nome do cliente" className="pl-8" {...field} />
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
                            <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="CPF ou CNPJ" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Telefone" className="pl-8" {...field} />
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
                            <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="E-mail" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Informações do Projeto</CardTitle>
                <CardDescription className="text-xs">
                  Dados do projeto de crédito rural
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 grid gap-4">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Projeto</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Nome do projeto" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finalidade</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Target className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Finalidade do projeto" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Valor do projeto" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="creditLine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linha de Crédito</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a linha de crédito" />
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
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Projeto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PROJECT_STATUS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Informações da Propriedade</CardTitle>
                <CardDescription className="text-xs">
                  Dados da propriedade rural
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 grid gap-4">
                <FormField
                  control={form.control}
                  name="propertyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Propriedade</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Nome da propriedade" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área (ha)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Área em hectares" {...field} />
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
                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Localização da propriedade" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.back()}
                className="w-24"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-24"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
