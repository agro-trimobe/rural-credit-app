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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  ArrowLeft, 
  FileEdit, 
  Trash2, 
  Calendar,
  MapPin,
  FileText,
  User,
  Camera,
  File,
  FileCheck,
  Plus,
  Clock,
  CalendarDays,
  Building,
  Home,
  Info,
  History,
  Share,
  ChevronRight,
  Image
} from 'lucide-react'
import { Visita, Cliente, Propriedade, Projeto, Documento } from '@/lib/crm-utils'
import { formatarData, formatarDataHora, formatarEndereco, formatarTelefone, formatarCpfCnpj, coresStatus } from '@/lib/formatters'
import { visitasApi, clientesApi, propriedadesApi, projetosApi, documentosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Componente cliente que implementa a lógica com hooks
export default function VisitaDetalhesConteudo({ visitaId }: { visitaId: string }) {
  const router = useRouter()
  const [visita, setVisita] = useState<Visita | null>(null)
  const [nomeCliente, setNomeCliente] = useState<string>('')
  const [nomePropriedade, setNomePropriedade] = useState<string>('')
  const [nomeProjeto, setNomeProjeto] = useState<string>('')
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [excluindo, setExcluindo] = useState(false)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)

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
        
        setVisita(dadosVisita)
        
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

        // Carregar documentos relacionados à visita
        const docsVisita = await documentosApi.listarDocumentosPorVisita(visitaId)
        setDocumentos(docsVisita)
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
  }, [visitaId, router])

  const handleExcluir = async () => {
    if (!visita) return
    
    try {
      setExcluindo(true)
      const sucesso = await visitasApi.excluirVisita(visita.id)
      
      if (sucesso) {
        toast({
          title: 'Visita excluída',
          description: 'A visita foi excluída com sucesso.',
        })
        router.push('/visitas')
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a visita.',
          variant: 'destructive',
        })
        setExcluindo(false)
      }
    } catch (error) {
      console.error('Erro ao excluir visita:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a visita.',
        variant: 'destructive',
      })
      setExcluindo(false)
    } finally {
      setDialogoExclusaoAberto(false)
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

  // Verificar se a visita está atrasada (data no passado e status ainda é Agendada)
  const isVisitaAtrasada = visita.status === 'Agendada' && new Date(visita.data) < new Date()

  return (
    <div className="container py-4 space-y-4">
      {/* Cabeçalho com breadcrumbs e ações */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/visitas" className="hover:text-primary transition-colors">Visitas</Link> 
            <ChevronRight className="h-3 w-3" /> 
            <span>Detalhes</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Detalhes da Visita</h1>
            <Badge className={coresStatus.visita[visita.status]}>
              {visita.status}
            </Badge>
            {isVisitaAtrasada && (
              <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                Atrasada
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild>
                  <Link href="/visitas">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voltar para Visitas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/visitas/${visita.id}/editar`}>
              <FileEdit className="mr-2 h-4 w-4" /> Editar
            </Link>
          </Button>
          
          {visita.status === 'Agendada' && (
            <Button variant="default" size="sm" asChild>
              <Link href={`/visitas/${visita.id}/registrar`}>
                <Calendar className="mr-2 h-4 w-4" /> Registrar
              </Link>
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setDialogoExclusaoAberto(true)} 
            disabled={excluindo}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      {/* Barra de progresso baseada no status */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-500" 
          style={{ 
            width: visita.status === 'Agendada' ? '33%' : 
                  visita.status === 'Realizada' ? '100%' : 
                  visita.status === 'Cancelada' ? '100%' : '33%' 
          }}
        ></div>
      </div>

      {/* Conteúdo principal em tabs */}
      <Tabs defaultValue="informacoes" className="w-full">
        <div className="border-b mb-4">
          <TabsList className="flex justify-start gap-4 h-auto bg-transparent p-0">
            <TabsTrigger 
              value="informacoes" 
              className="flex flex-col items-center gap-1 h-auto py-2 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Info className="h-5 w-5" />
              <span>Informações</span>
            </TabsTrigger>
            <TabsTrigger 
              value="fotos" 
              className="flex flex-col items-center gap-1 h-auto py-2 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <div className="relative">
                <Image className="h-5 w-5" />
                <span className="absolute -top-1 -right-2 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">{visita.fotos.length}</span>
              </div>
              <span>Fotos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="documentos" 
              className="flex flex-col items-center gap-1 h-auto py-2 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <div className="relative">
                <FileText className="h-5 w-5" />
                <span className="absolute -top-1 -right-2 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">{documentos.length}</span>
              </div>
              <span>Documentos</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Tab de Informações */}
        <TabsContent value="informacoes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card de dados básicos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" /> 
                  Dados da Visita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Data</p>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{formatarData(visita.data)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{visita.status}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Observações</p>
                  <div className="bg-muted/50 p-2 rounded-md min-h-[60px]">
                    <p className="whitespace-pre-wrap text-sm">{visita.observacoes || 'Sem observações'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Card de relacionamentos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" /> 
                  Relacionamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                    <div className="flex items-center bg-muted/50 p-2 rounded-md">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Link href={`/clientes/${visita.clienteId}`} className="text-primary hover:underline font-medium">
                        {nomeCliente || 'Cliente não encontrado'}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Propriedade</p>
                    <div className="flex items-center bg-muted/50 p-2 rounded-md">
                      <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Link href={`/propriedades/${visita.propriedadeId}`} className="text-primary hover:underline font-medium">
                        {nomePropriedade || 'Propriedade não encontrada'}
                      </Link>
                    </div>
                  </div>
                  
                  {visita.projetoId && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Projeto</p>
                      <div className="flex items-center bg-muted/50 p-2 rounded-md">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Link href={`/projetos/${visita.projetoId}`} className="text-primary hover:underline font-medium">
                          {nomeProjeto || 'Projeto não encontrado'}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab de Fotos */}
        <TabsContent value="fotos">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" /> 
                  Fotos da Visita
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/visitas/${visita.id}/fotos`}>
                    <Camera className="mr-2 h-4 w-4" /> Gerenciar
                  </Link>
                </Button>
              </div>
              <CardDescription>
                {visita.fotos.length} foto(s) registrada(s) durante a visita técnica
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visita.fotos.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">Nenhuma foto registrada</p>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/visitas/${visita.id}/fotos`}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Fotos
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {visita.fotos.map((foto, index) => (
                    <div key={index} className="group relative aspect-square rounded-md overflow-hidden border hover:border-primary transition-colors">
                      <img 
                        src={foto} 
                        alt={`Foto ${index + 1}`} 
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-full">
                          <Image className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de Documentos */}
        <TabsContent value="documentos">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> 
                  Documentos
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/visitas/${visita.id}/documentos`}>
                      <FileCheck className="mr-2 h-4 w-4" /> Ver Todos
                    </Link>
                  </Button>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/documentos/novo?visitaId=${visita.id}&clienteId=${visita.clienteId}`}>
                      <Plus className="mr-2 h-4 w-4" /> Novo
                    </Link>
                  </Button>
                </div>
              </div>
              <CardDescription>
                {documentos.length} documento(s) relacionado(s) a esta visita
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentos.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <File className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">Nenhum documento relacionado</p>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/documentos/novo?visitaId=${visita.id}&clienteId=${visita.clienteId}`}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Documento
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documentos.map((doc) => (
                    <Link 
                      key={doc.id} 
                      href={`/documentos/${doc.id}`}
                      className="flex items-center p-3 rounded-md border hover:border-primary hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{doc.nome}</p>
                        <p className="text-xs text-muted-foreground">{doc.tipo}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {doc.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        

      </Tabs>

      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a visita
              e todos os dados associados a ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExcluir}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={excluindo}
            >
              {excluindo ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
