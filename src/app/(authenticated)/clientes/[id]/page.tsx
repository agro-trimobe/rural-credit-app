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
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  MessageCircle
} from 'lucide-react'
import { Cliente, Interacao, Propriedade, Projeto, formatarCpfCnpj, formatarTelefone, formatarData } from '@/lib/crm-utils'
import { clientesApi, propriedadesApi, projetosApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default async function ClienteDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [interacoes, setInteracoes] = useState<Interacao[]>([])

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar cliente
        const dadosCliente = await clientesApi.buscarClientePorId(id)
        if (!dadosCliente) {
          toast({
            title: 'Erro',
            description: 'Cliente não encontrado',
            variant: 'destructive',
          })
          router.push('/crm/clientes')
          return
        }
        
        setCliente(dadosCliente)
        
        // Carregar propriedades do cliente
        const propriedadesDoCliente = await propriedadesApi.listarPropriedadesPorCliente(id)
        setPropriedades(propriedadesDoCliente)
        
        // Carregar projetos do cliente
        const projetosDoCliente = await projetosApi.listarProjetosPorCliente(id)
        setProjetos(projetosDoCliente)
        
        // Carregar interações do cliente
        const interacoesDoCliente = await clientesApi.listarInteracoes(id)
        setInteracoes(interacoesDoCliente)
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do cliente',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [id, router])

  const handleExcluir = async () => {
    if (!cliente) return

    if (window.confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
      try {
        await clientesApi.excluirCliente(cliente.id)
        toast({
          title: 'Cliente excluído',
          description: 'O cliente foi excluído com sucesso.',
        })
        router.push('/crm/clientes')
      } catch (error) {
        console.error('Erro ao excluir cliente:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o cliente.',
          variant: 'destructive',
        })
      }
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Cliente não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/crm/clientes">Voltar para lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getCorBadge = (perfil: string) => {
    switch (perfil) {
      case 'Pequeno':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'Médio':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'Grande':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/crm/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detalhes do Cliente</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/crm/clientes/${id}/editar`}>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{cliente.nome}</CardTitle>
              <CardDescription>
                Cliente desde {cliente.dataCadastro ? formatarData(cliente.dataCadastro) : 'N/A'}
              </CardDescription>
            </div>
            <Badge className={getCorBadge(cliente.perfil)}>
              {cliente.perfil}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações Pessoais</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{formatarCpfCnpj(cliente.cpfCnpj)}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{formatarTelefone(cliente.telefone)}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{cliente.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Cadastrado em {cliente.dataCadastro ? formatarData(cliente.dataCadastro) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Propriedades</h3>
                {propriedades.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma propriedade cadastrada</p>
                ) : (
                  <div className="space-y-2">
                    {propriedades.map((propriedade) => (
                      <div key={propriedade.id} className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{propriedade.nome}</p>
                          <p className="text-xs text-muted-foreground">{propriedade.endereco}</p>
                          <p className="text-xs text-muted-foreground">{propriedade.area} hectares</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <Tabs>
            <TabsList>
              <TabsTrigger value="propriedades">Propriedades</TabsTrigger>
              <TabsTrigger value="projetos">Projetos</TabsTrigger>
              <TabsTrigger value="interacoes">Interações</TabsTrigger>
            </TabsList>

            <TabsContent value="propriedades" className="space-y-4">
              {propriedades.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Este cliente não possui propriedades cadastradas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {propriedades.map((propriedade) => (
                    <Card key={propriedade.id}>
                      <CardHeader>
                        <CardTitle>{propriedade.nome}</CardTitle>
                        <CardDescription>
                          {propriedade.municipio}, {propriedade.estado}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Endereço</h4>
                            <p className="text-sm text-muted-foreground">
                              {propriedade.endereco}
                              <br />
                              {propriedade.municipio}, {propriedade.estado}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Área</h4>
                            <p className="text-sm text-muted-foreground">
                              {propriedade.area} hectares
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/crm/propriedades/${propriedade.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="projetos" className="space-y-4">
              <Separator className="my-4" />
              
              {projetos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Este cliente não possui projetos cadastrados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projetos.map((projeto) => (
                    <Card key={projeto.id}>
                      <CardHeader>
                        <CardTitle>{projeto.titulo}</CardTitle>
                        <CardDescription>
                          Linha de Crédito: {projeto.linhaCredito}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-muted">
                            {projeto.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Valor: {projeto.valorTotal}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/crm/projetos/${projeto.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="interacoes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Histórico de Interações</h3>
                <Button size="sm" asChild>
                  <Link href={`/crm/clientes/${id}/interacoes/nova`}>
                    Nova Interação
                  </Link>
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              {interacoes.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Este cliente não possui interações registradas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interacoes.map((interacao) => (
                    <Card key={interacao.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{interacao.assunto}</CardTitle>
                            <CardDescription>
                              {formatarData(interacao.data)} - {interacao.tipo}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">
                            {interacao.responsavel}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{interacao.descricao}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/crm/clientes">
              Voltar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/crm/projetos/novo?clienteId=${id}`}>
              Criar Novo Projeto
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
