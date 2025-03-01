'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileQuestion, 
  Search, 
  BookOpen, 
  FileText, 
  BarChart, 
  Tag,
  Eye,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { formatarData } from '@/lib/crm-utils'
import { 
  conhecimentoApi, 
  ArtigoConhecimento, 
  Legislacao, 
  ProgramaFinanciamento 
} from '@/lib/mock-api/conhecimento'

export default function ConhecimentoPage() {
  const router = useRouter()
  const [termoBusca, setTermoBusca] = useState('')
  const [artigos, setArtigos] = useState<ArtigoConhecimento[]>([])
  const [legislacoes, setLegislacoes] = useState<Legislacao[]>([])
  const [programas, setProgramas] = useState<ProgramaFinanciamento[]>([])
  const [tagsPopulares, setTagsPopulares] = useState<{tag: string, contagem: number}[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [artigosData, legislacoesData, programasData, estatisticas] = await Promise.all([
          conhecimentoApi.getArtigos(),
          conhecimentoApi.getLegislacoes(),
          conhecimentoApi.getProgramasAtivos(),
          conhecimentoApi.getEstatisticas()
        ])
        
        setArtigos(artigosData)
        setLegislacoes(legislacoesData)
        setProgramas(programasData)
        setTagsPopulares(estatisticas.tagsPopulares)
        setCarregando(false)
      } catch (erro) {
        console.error('Erro ao carregar dados:', erro)
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar a base de conhecimento. Tente novamente mais tarde.',
          variant: 'destructive',
        })
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  const pesquisar = async () => {
    if (!termoBusca.trim()) return
    
    setCarregando(true)
    try {
      const [artigosResultado, legislacoesResultado, programasResultado] = await Promise.all([
        conhecimentoApi.pesquisarArtigos(termoBusca),
        conhecimentoApi.pesquisarLegislacao(termoBusca),
        conhecimentoApi.pesquisarProgramas(termoBusca)
      ])
      
      setArtigos(artigosResultado)
      setLegislacoes(legislacoesResultado)
      setProgramas(programasResultado)
      setCarregando(false)
    } catch (erro) {
      console.error('Erro ao pesquisar:', erro)
      toast({
        title: 'Erro na pesquisa',
        description: 'Não foi possível realizar a pesquisa. Tente novamente mais tarde.',
        variant: 'destructive',
      })
      setCarregando(false)
    }
  }

  const limparPesquisa = async () => {
    setTermoBusca('')
    setCarregando(true)
    try {
      const [artigosData, legislacoesData, programasData] = await Promise.all([
        conhecimentoApi.getArtigos(),
        conhecimentoApi.getLegislacoes(),
        conhecimentoApi.getProgramasAtivos()
      ])
      
      setArtigos(artigosData)
      setLegislacoes(legislacoesData)
      setProgramas(programasData)
      setCarregando(false)
    } catch (erro) {
      console.error('Erro ao limpar pesquisa:', erro)
      setCarregando(false)
    }
  }

  const pesquisarPorTag = async (tag: string) => {
    setTermoBusca(tag)
    setCarregando(true)
    try {
      const [artigosResultado, legislacoesResultado] = await Promise.all([
        conhecimentoApi.getArtigosPorTag(tag),
        conhecimentoApi.pesquisarLegislacao(tag)
      ])
      
      setArtigos(artigosResultado)
      setLegislacoes(legislacoesResultado)
      setCarregando(false)
    } catch (erro) {
      console.error('Erro ao pesquisar por tag:', erro)
      setCarregando(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h1>
          <p className="text-muted-foreground">
            Acesse artigos, legislações e informações sobre linhas de crédito rural
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pesquisar na Base de Conhecimento</CardTitle>
          <CardDescription>
            Busque por artigos, legislações ou programas de financiamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Digite sua pesquisa..."
                className="pl-8"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && pesquisar()}
              />
            </div>
            <Button onClick={pesquisar}>Pesquisar</Button>
            {termoBusca && (
              <Button variant="outline" onClick={limparPesquisa}>
                Limpar
              </Button>
            )}
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Tags populares:</p>
            <div className="flex flex-wrap gap-2">
              {tagsPopulares.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => pesquisarPorTag(tag.tag)}
                >
                  {tag.tag} ({tag.contagem})
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="artigos">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="artigos" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Artigos
          </TabsTrigger>
          <TabsTrigger value="legislacao" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Legislação
          </TabsTrigger>
          <TabsTrigger value="programas" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Programas de Financiamento
          </TabsTrigger>
        </TabsList>
        
        {/* Conteúdo da aba Artigos */}
        <TabsContent value="artigos">
          <Card>
            <CardHeader>
              <CardTitle>Artigos Técnicos</CardTitle>
              <CardDescription>
                Conteúdo especializado sobre crédito rural e projetos agropecuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              {carregando ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">Carregando artigos...</p>
                </div>
              ) : artigos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <FileQuestion className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-lg font-medium">Nenhum artigo encontrado</p>
                    <p className="text-sm text-muted-foreground">
                      {termoBusca 
                        ? `Não encontramos artigos para "${termoBusca}". Tente outros termos.` 
                        : 'Não há artigos disponíveis no momento.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artigos.map((artigo) => (
                    <Card key={artigo.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <Badge variant="outline" className="mb-2 self-start">
                            {artigo.categoria}
                          </Badge>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Eye className="h-3 w-3 mr-1" />
                            {artigo.visualizacoes}
                          </div>
                        </div>
                        <CardTitle className="text-lg">{artigo.titulo}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatarData(artigo.dataPublicacao)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {artigo.conteudo}
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-col items-start pt-0">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {artigo.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs"
                              onClick={() => pesquisarPorTag(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => router.push(`/crm/conhecimento/artigos/${artigo.id}`)}
                        >
                          Ler artigo
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba Legislação */}
        <TabsContent value="legislacao">
          <Card>
            <CardHeader>
              <CardTitle>Legislação e Normas</CardTitle>
              <CardDescription>
                Leis, decretos e normas relacionadas ao crédito rural
              </CardDescription>
            </CardHeader>
            <CardContent>
              {carregando ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">Carregando legislações...</p>
                </div>
              ) : legislacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-lg font-medium">Nenhuma legislação encontrada</p>
                    <p className="text-sm text-muted-foreground">
                      {termoBusca 
                        ? `Não encontramos legislações para "${termoBusca}". Tente outros termos.` 
                        : 'Não há legislações disponíveis no momento.'}
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Órgão</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legislacoes.map((legislacao) => (
                      <TableRow key={legislacao.id}>
                        <TableCell className="font-medium">{legislacao.titulo}</TableCell>
                        <TableCell>{legislacao.numero}</TableCell>
                        <TableCell>{legislacao.orgao}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{legislacao.categoria}</Badge>
                        </TableCell>
                        <TableCell>{formatarData(legislacao.dataPublicacao)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/crm/conhecimento/legislacao/${legislacao.id}`)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(legislacao.linkOficial, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Acessar link oficial
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba Programas de Financiamento */}
        <TabsContent value="programas">
          <Card>
            <CardHeader>
              <CardTitle>Programas de Financiamento</CardTitle>
              <CardDescription>
                Linhas de crédito e programas de financiamento disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {carregando ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">Carregando programas...</p>
                </div>
              ) : programas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <BarChart className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-lg font-medium">Nenhum programa encontrado</p>
                    <p className="text-sm text-muted-foreground">
                      {termoBusca 
                        ? `Não encontramos programas para "${termoBusca}". Tente outros termos.` 
                        : 'Não há programas disponíveis no momento.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programas.map((programa) => (
                    <Card key={programa.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <Badge 
                            className={`mb-2 ${
                              programa.status === 'Ativo' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : programa.status === 'Em breve' 
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }`}
                          >
                            {programa.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {programa.instituicao}
                          </div>
                        </div>
                        <CardTitle className="text-lg">{programa.nome}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {programa.descricao}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium">Taxa de Juros:</p>
                            <p className="text-muted-foreground">{programa.taxaJuros}</p>
                          </div>
                          <div>
                            <p className="font-medium">Prazo Máximo:</p>
                            <p className="text-muted-foreground">{programa.prazoMaximo} meses</p>
                          </div>
                          <div>
                            <p className="font-medium">Valor Máximo:</p>
                            <p className="text-muted-foreground">
                              {programa.valorMaximo.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Público-Alvo:</p>
                            <p className="text-muted-foreground line-clamp-1">{programa.publicoAlvo}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/crm/conhecimento/programas/${programa.id}`)}
                        >
                          Ver detalhes
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => router.push(`/crm/simulacoes/nova?programa=${programa.id}`)}
                        >
                          Simular
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
