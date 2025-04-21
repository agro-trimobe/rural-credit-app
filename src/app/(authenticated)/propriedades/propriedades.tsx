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
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Search,
  Plus,
  MapPin,
  Ruler,
  User,
  Calendar,
  FileText,
  Filter,
  List,
  Map as MapIcon,
  Home,
  BarChart2,
  ChevronRight
} from 'lucide-react'
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { CardEstatistica } from '@/components/ui/card-padrao'
import { FiltrosPadrao, FiltroSelect } from '@/components/ui/filtros-padrao'
import MapaPropriedadesLista from '@/components/propriedades/mapa-propriedades-lista'
import { Propriedade, Projeto } from '@/lib/crm-utils'
import { propriedadesApi, clientesApi, projetosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function PropriedadesConteudo() {
  const router = useRouter()
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [carregandoProjetos, setCarregandoProjetos] = useState(true)
  const [busca, setBusca] = useState('')
  const [visualizacao, setVisualizacao] = useState<'grid' | 'tabela' | 'mapa'>('grid')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [filtroTamanho, setFiltroTamanho] = useState<string>('')

  // Estatísticas calculadas
  const totalPropriedades = propriedades.length
  const totalArea = propriedades.reduce((acc, prop) => acc + prop.area, 0)
  const totalEstados = [...new Set(propriedades.map(p => p.estado))].length
  
  // Mapeamento de propriedade para projetos
  const projetosPorPropriedade = propriedades.reduce((acc, prop) => {
    acc[prop.id] = projetos.filter(p => p.propriedadeId === prop.id).length
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        setCarregandoProjetos(true)
        
        // Carregar propriedades
        const dadosPropriedades = await propriedadesApi.listarPropriedades()
        setPropriedades(dadosPropriedades)
        setCarregando(false)
        
        // Carregar projetos para estatísticas
        const dadosProjetos = await projetosApi.listarProjetos()
        setProjetos(dadosProjetos)
        setCarregandoProjetos(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados.',
          variant: 'destructive',
        })
        setCarregando(false)
        setCarregandoProjetos(false)
      }
    }

    carregarDados()
  }, [])

  // Função para classificar o tamanho da propriedade
  const classificarTamanho = (area: number) => {
    if (area < 20) return { texto: 'Pequena', cor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' }
    if (area < 100) return { texto: 'Média', cor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' }
    return { texto: 'Grande', cor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' }
  }

  // Filtrar propriedades
  const propriedadesFiltradas = propriedades
    .filter(propriedade => 
      (propriedade.nome.toLowerCase().includes(busca.toLowerCase()) ||
      propriedade.municipio.toLowerCase().includes(busca.toLowerCase()) ||
      propriedade.estado.toLowerCase().includes(busca.toLowerCase())) &&
      (filtroEstado === '' || propriedade.estado === filtroEstado) &&
      (filtroTamanho === '' || 
        (filtroTamanho === 'pequena' && propriedade.area < 20) ||
        (filtroTamanho === 'media' && propriedade.area >= 20 && propriedade.area < 100) ||
        (filtroTamanho === 'grande' && propriedade.area >= 100)
      )
    )

  // Estados únicos para filtro
  const estados = [...new Set(propriedades.map(p => p.estado))].sort()

  // Componente de carregamento
  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        <Skeleton className="h-10 w-full" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CabecalhoPagina
        titulo="Propriedades"
        descricao="Gerencie propriedades rurais e terrenos cadastrados"
        breadcrumbs={[
          { titulo: 'Dashboard', href: '/dashboard' },
          { titulo: 'Propriedades' }
        ]}
        badges={<Badge variant="outline">{totalPropriedades}</Badge>}
        acoes={
          <Button asChild>
            <Link href="/propriedades/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova Propriedade
            </Link>
          </Button>
        }
      />

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardEstatistica
          titulo="Área Total"
          valor={`${totalArea.toLocaleString('pt-BR')} ha`}
          icone={<Ruler className="h-5 w-5" />}
        />
        
        <CardEstatistica
          titulo="Estados"
          valor={totalEstados}
          icone={<MapPin className="h-5 w-5" />}
          corIcone="text-blue-600"
        />
        
        <CardEstatistica
          titulo="Projetos Vinculados"
          valor={carregandoProjetos ? '...' : projetos.length}
          icone={<FileText className="h-5 w-5" />}
          corIcone="text-green-600"
        />
      </div>

      {/* Filtros e busca */}
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <FiltrosPadrao
          titulo="Lista de Propriedades"
          subtitulo={`Mostrando ${propriedadesFiltradas.length} de ${totalPropriedades} propriedades`}
          termoBusca={busca}
          onChangeBusca={(e) => setBusca(e.target.value)}  
          placeholderBusca="Buscar propriedades..."
        >
          <FiltroSelect
            label="Estado"
            valor={filtroEstado}
            onChange={(valor: string) => setFiltroEstado(valor)}
            opcoes={[
              { valor: '', label: 'Todos os Estados' },
              ...estados.map(estado => ({ valor: estado, label: estado }))
            ]}
          />
          <FiltroSelect
            label="Tamanho"
            valor={filtroTamanho}
            onChange={(valor: string) => setFiltroTamanho(valor)}
            opcoes={[
              { valor: '', label: 'Todos os Tamanhos' },
              { valor: 'pequena', label: 'Pequena (até 20 ha)' },
              { valor: 'media', label: 'Média (20 a 100 ha)' },
              { valor: 'grande', label: 'Grande (mais de 100 ha)' }
            ]}
          />
        </FiltrosPadrao>
      </div>

      {/* Conteúdo baseado na visualização selecionada */}
      {propriedadesFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Nenhuma propriedade encontrada</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={visualizacao} onValueChange={(v) => setVisualizacao(v as 'grid' | 'tabela' | 'mapa')} className="w-full">
          <div className="flex items-center justify-end mb-4">
            <TabsList className="grid w-[270px] grid-cols-3">
              <TabsTrigger value="grid" className="flex items-center">
                <List className="h-4 w-4 mr-1" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="tabela" className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-1" />
                Tabela
              </TabsTrigger>
              <TabsTrigger value="mapa" className="flex items-center">
                <MapIcon className="h-4 w-4 mr-1" />
                Mapa
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {propriedadesFiltradas.map((propriedade) => {
                const tamanho = classificarTamanho(propriedade.area)
                return (
                  <Card key={propriedade.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{propriedade.nome}</CardTitle>
                        <Badge className={tamanho.cor}>{tamanho.texto}</Badge>
                      </div>
                      <CardDescription>
                        {propriedade.municipio}, {propriedade.estado}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                          <span className="text-sm text-muted-foreground">{propriedade.endereco}</span>
                        </div>
                        <div className="flex items-center">
                          <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{propriedade.area.toLocaleString('pt-BR')} hectares</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {projetosPorPropriedade[propriedade.id] || 0} projeto(s)
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Projetos vinculados a esta propriedade</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/propriedades/${propriedade.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="tabela" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Projetos</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propriedadesFiltradas.map((propriedade) => {
                      const tamanho = classificarTamanho(propriedade.area)
                      return (
                        <TableRow key={propriedade.id}>
                          <TableCell className="font-medium">{propriedade.nome}</TableCell>
                          <TableCell>{propriedade.municipio}, {propriedade.estado}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {propriedade.area.toLocaleString('pt-BR')} ha
                              <Badge className={tamanho.cor}>{tamanho.texto}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>{projetosPorPropriedade[propriedade.id] || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/propriedades/${propriedade.id}`}>
                                Ver Detalhes
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapa" className="mt-0">
            {propriedadesFiltradas.some(p => p.coordenadas) ? (
              <MapaPropriedadesLista 
                propriedades={propriedadesFiltradas.filter(p => p.coordenadas)} 
                classificarTamanho={classificarTamanho}
                projetosPorPropriedade={projetosPorPropriedade}
              />
            ) : (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <MapIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-lg text-muted-foreground mt-4">Nenhuma propriedade com coordenadas encontrada</p>
                    <p className="text-sm text-muted-foreground">Adicione coordenadas às propriedades para visualizá-las no mapa</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
