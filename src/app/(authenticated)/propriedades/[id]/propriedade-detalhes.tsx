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
  Map
} from 'lucide-react'
import { Cliente, Propriedade, Projeto } from '@/lib/crm-utils'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import { clientesApi, propriedadesApi, projetosApi } from '@/lib/mock-api'
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

// Componente cliente que implementa a lógica com hooks
function PropriedadeDetalhesConteudo({ propriedadeId }: { propriedadeId: string }) {
  const router = useRouter()
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState("informacoes")
  const [dialogAberto, setDialogAberto] = useState(false)

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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/propriedades">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detalhes da Propriedade</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/propriedades/${propriedade.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleExcluir}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{propriedade.nome}</CardTitle>
              <CardDescription>
                {propriedade.municipio}, {propriedade.estado}
              </CardDescription>
            </div>
            <Badge>
              {propriedade.area} hectares
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Informações da Propriedade</h3>
                <div className="space-y-1.5">
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
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Proprietário</h3>
                {cliente ? (
                  <div className="space-y-1.5">
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
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Proprietário não encontrado</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="informacoes" value={abaAtiva} onValueChange={setAbaAtiva}>
            <TabsList className="mb-2">
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              <TabsTrigger value="projetos">Projetos</TabsTrigger>
            </TabsList>

            <TabsContent value="informacoes" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Localização</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    {propriedade.coordenadas ? (
                      <div className="space-y-2">
                        <p className="text-sm">Latitude: {propriedade.coordenadas.latitude}</p>
                        <p className="text-sm">Longitude: {propriedade.coordenadas.longitude}</p>
                        <div className="mt-2 bg-slate-100 h-40 rounded-md flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">Mapa da propriedade</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Coordenadas não disponíveis</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Dados Cadastrais</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium">Data de Cadastro</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatarData(propriedade.dataCriacao)}
                        </p>
                      </div>
                      {propriedade.dataAtualizacao && (
                        <div>
                          <h4 className="text-sm font-medium">Última Atualização</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatarData(propriedade.dataAtualizacao)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="projetos" className="space-y-4">
              {projetos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Esta propriedade não possui projetos cadastrados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projetos.map((projeto) => (
                    <Card key={projeto.id}>
                      <CardHeader>
                        <CardTitle>{projeto.titulo}</CardTitle>
                        <CardDescription>
                          {projeto.linhaCredito} • {projeto.status}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium mb-1">Valor</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatarMoeda(projeto.valorTotal)}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Data de Criação</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatarData(projeto.dataCriacao)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild>
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
        </CardContent>
      </Card>
      
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
  )
}

export default PropriedadeDetalhesConteudo
