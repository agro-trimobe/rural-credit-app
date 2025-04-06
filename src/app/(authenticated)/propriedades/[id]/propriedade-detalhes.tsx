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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  User, 
  FileText, 
  ArrowLeft, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  Ruler,
  Home,
  Map,
  ChevronRight,
  MoreHorizontal,
  Phone,
  Mail,
  Building,
  Info,
  Leaf,
  Cloud,
  Droplets
} from 'lucide-react'
import MapaPropriedade from '@/components/propriedades/mapa-propriedade'
import { Propriedade, Cliente, Projeto } from '@/lib/crm-utils'
import { formatarData, formatarDataHora, formatarMoeda } from '@/lib/formatters'
import { clientesApi, propriedadesApi, projetosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Componente cliente que implementa a lógica com hooks
function PropriedadeDetalhesConteudo({ propriedadeId }: { propriedadeId: string }) {
  const router = useRouter()
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState("informacoes")
  const [dialogAberto, setDialogAberto] = useState(false)

  const classificarTamanhoPropriedade = (area: number) => {
    if (area < 20) return { classe: 'Pequena', cor: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80' };
    if (area < 100) return { classe: 'Média', cor: 'bg-amber-100 text-amber-800 hover:bg-amber-100/80' };
    return { classe: 'Grande', cor: 'bg-green-100 text-green-800 hover:bg-green-100/80' };
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar propriedade
        const dadosPropriedade = await propriedadesApi.buscarPropriedadePorId(propriedadeId)
        if (!dadosPropriedade) {
          toast({
            title: 'Erro',
            description: 'Propriedade não encontrada',
            variant: 'destructive',
          })
          router.push('/propriedades')
          return
        }
        
        setPropriedade(dadosPropriedade)
        
        // Carregar dados do cliente
        if (dadosPropriedade.clienteId) {
          const dadosCliente = await clientesApi.buscarClientePorId(dadosPropriedade.clienteId)
          setCliente(dadosCliente)
        }
        
        // Carregar projetos relacionados à propriedade
        const dadosProjetos = await projetosApi.listarProjetosPorPropriedade(propriedadeId)
        setProjetos(dadosProjetos)
        
      } catch (error) {
        console.error('Erro ao carregar dados da propriedade:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da propriedade.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [propriedadeId, router])

  const handleExcluir = async () => {
    if (!propriedade) return
    setDialogAberto(true)
  }
  
  const confirmarExclusao = async () => {
    if (!propriedade) return
    
    try {
      await propriedadesApi.excluirPropriedade(propriedade.id)
      toast({
        title: 'Propriedade excluída',
        description: 'A propriedade foi excluída com sucesso.',
      })
      router.push('/propriedades')
    } catch (error) {
      console.error('Erro ao excluir propriedade:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a propriedade.',
        variant: 'destructive',
      })
    } finally {
      setDialogAberto(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!propriedade) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Propriedade não encontrada</p>
            <Button asChild className="mt-4">
              <Link href="/propriedades">Voltar para lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com breadcrumbs */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Link href="/propriedades" className="hover:underline">Propriedades</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Detalhes</span>
        </div>
      </div>
  
      {/* Banner principal */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{propriedade.nome}</h1>
            <p className="text-muted-foreground">{propriedade.municipio}, {propriedade.estado}</p>
          </div>
          <div className="flex items-center gap-3">
            {propriedade.area && (
              <Badge variant="outline" className={classificarTamanhoPropriedade(propriedade.area).cor}>
                {classificarTamanhoPropriedade(propriedade.area).classe}
              </Badge>
            )}
            <span className="flex items-center">
              <Ruler className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="font-semibold">{propriedade.area} hectares</span>
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href={`/propriedades/${propriedade.id}/editar`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Propriedade
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Novo Projeto
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExcluir} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
  
      {/* Conteúdo principal em tabs */}
      <Tabs defaultValue="informacoes" value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="projetos">Projetos {projetos.length > 0 && `(${projetos.length})`}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="informacoes" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card de Informações Básicas */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{propriedade.endereco}</span>
                  </div>
                  <div className="flex items-center">
                    <Map className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{propriedade.municipio}, {propriedade.estado}</span>
                  </div>
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{propriedade.area} hectares</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Cadastrada em {propriedade.dataCriacao ? formatarData(propriedade.dataCriacao) : 'N/A'}</span>
                  </div>
                  {propriedade.dataAtualizacao && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Atualizada em {formatarData(propriedade.dataAtualizacao)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Card de Proprietário */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Proprietário
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cliente ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Link href={`/clientes/${cliente.id}`} className="text-sm hover:underline">
                        {cliente.nome}
                      </Link>
                    </div>
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{cliente.endereco || 'Endereço não informado'}</span>
                    </div>
                    {cliente.telefone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{cliente.telefone}</span>
                      </div>
                    )}
                    {cliente.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{cliente.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <p className="text-sm text-muted-foreground">Proprietário não encontrado</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Vincular Proprietário
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Card de Localização */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                {propriedade.coordenadas ? (
                  <div className="space-y-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center cursor-help">
                            <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Latitude: {propriedade.coordenadas.latitude}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Coordenada norte-sul</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center cursor-help">
                            <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Longitude: {propriedade.coordenadas.longitude}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Coordenada leste-oeste</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <p className="text-sm text-muted-foreground">Coordenadas não disponíveis</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Adicionar Coordenadas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Card de Mapa (largura total) */}
            <div className="col-span-1 md:col-span-3">
              <MapaPropriedade 
                coordenadas={propriedade.coordenadas} 
                nome={propriedade.nome}
                municipio={propriedade.municipio}
                estado={propriedade.estado}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="projetos" className="mt-4">
          {projetos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-muted-foreground">Esta propriedade não possui projetos cadastrados.</p>
                <Button className="mt-4">
                  Criar Novo Projeto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projetos.map((projeto) => (
                <Card key={projeto.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{projeto.titulo}</CardTitle>
                        <CardDescription>
                          {projeto.linhaCredito}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        projeto.status === 'Contratado' ? 'default' : 
                        projeto.status === 'Em Elaboração' ? 'secondary' : 
                        projeto.status === 'Cancelado' ? 'destructive' : 'outline'
                      }>
                        {projeto.status}
                      </Badge>
                    </div>
                    
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Valor</h4>
                        <p className="text-sm font-medium">
                          {formatarMoeda(projeto.valorTotal)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Data de Criação</h4>
                        <p className="text-sm">
                          {formatarData(projeto.dataCriacao)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/projetos/${projeto.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              {propriedade && `Tem certeza que deseja excluir a propriedade ${propriedade.nome}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PropriedadeDetalhesConteudo
