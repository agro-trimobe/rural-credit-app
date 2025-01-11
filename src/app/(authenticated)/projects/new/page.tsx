'use client'

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
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Implementar lógica de submissão
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Criar Novo Projeto</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Novo Projeto</h1>
          <p className="text-muted-foreground">
            Preencha as informações abaixo para criar um novo projeto de crédito rural
          </p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Seção: Informações do Cliente */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Informações do Cliente</h2>
                  <p className="text-sm text-muted-foreground">
                    Dados do solicitante do crédito rural
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
                            <Input className="pl-9" {...field} type="email" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Seção: Dados do Projeto */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Dados do Projeto</h2>
                  <p className="text-sm text-muted-foreground">
                    Informações sobre o projeto de financiamento
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
                          defaultValue={field.value}
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
                          defaultValue={field.value}
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
                            <SelectItem value="pronaf">Pronaf</SelectItem>
                            <SelectItem value="pronamp">Pronamp</SelectItem>
                            <SelectItem value="inovagro">Inovagro</SelectItem>
                            <SelectItem value="moderfrota">Moderfrota</SelectItem>
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
                        <FormLabel>Área Total (hectares)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                            </span>
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                    <Button variant="outline" type="button">
                      Selecionar Arquivos
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
                <Button type="submit">Salvar e Continuar</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
