'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  ChevronDown, 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileEdit, 
  Trash2, 
  Eye,
  Users,
  Home,
  FileText,
  Calendar,
  Filter,
  ArrowUpRight,
  Clock
} from 'lucide-react'
import { formatarCpfCnpj, formatarTelefone, formatarData, formatarMoeda } from '@/lib/formatters'
import { clientesApi, projetosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { Cliente, Projeto } from '@/lib/crm-utils'

// Importação dos componentes padronizados
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { FiltrosPadrao } from '@/components/ui/filtros-padrao'
import { CardEstatistica } from '@/components/ui/card-padrao'
import { TabelaPadrao } from '@/components/ui/tabela-padrao'
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

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | 'Pequeno' | 'Médio' | 'Grande'>('Todos')
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'PF' | 'PJ'>('Todos')
  const [ultimaInteracao, setUltimaInteracao] = useState<'Todos' | '7dias' | '30dias' | '90dias'>('Todos')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [dadosClientes, dadosProjetos] = await Promise.all([
          clientesApi.listarClientes(),
          projetosApi.listarProjetos()
        ])
        setClientes(dadosClientes)
        setProjetos(dadosProjetos)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  // Estatísticas para os cards
  const estatisticas = {
    totalClientes: clientes.length,
    clientesPF: clientes.filter(c => c.tipo === 'PF').length,
    clientesPJ: clientes.filter(c => c.tipo === 'PJ').length,
    pequenos: clientes.filter(c => c.perfil === 'pequeno').length,
    medios: clientes.filter(c => c.perfil === 'medio').length,
    grandes: clientes.filter(c => c.perfil === 'grande').length,
    totalProjetos: projetos.length,
    projetosAtivos: projetos.filter(p => p.status === 'Em Elaboração' || p.status === 'Em Análise').length,
    projetosAprovados: projetos.filter(p => p.status === 'Aprovado' || p.status === 'Contratado').length,
    valorTotalProjetos: projetos.reduce((total, projeto) => total + projeto.valorTotal, 0)
  }

  // Filtrar clientes com base na busca e nos filtros
  const clientesFiltrados = clientes.filter(cliente => {
    const correspondeAoBusca = 
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) || 
      cliente.cpfCnpj.includes(busca) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase())
    
    const correspondeAoPerfil = filtro === 'Todos' || 
      (filtro === 'Pequeno' && cliente.perfil === 'pequeno') ||
      (filtro === 'Médio' && cliente.perfil === 'medio') ||
      (filtro === 'Grande' && cliente.perfil === 'grande')
    
    const correspondeAoTipo = filtroTipo === 'Todos' ||
      (filtroTipo === 'PF' && cliente.tipo === 'PF') ||
      (filtroTipo === 'PJ' && cliente.tipo === 'PJ')
    
    // Filtro de última interação seria implementado com dados reais
    // Por enquanto, retornamos true para todos
    const correspondeAInteracao = true
    
    return correspondeAoBusca && correspondeAoPerfil && correspondeAoTipo && correspondeAInteracao
  })

  // Função para obter a cor do badge com base no perfil
  const getCorBadge = (perfil: string) => {
    switch (perfil) {
      case 'pequeno':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'medio':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'grande':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  // Função para abrir o diálogo de confirmação
  const confirmarExclusao = (cliente: Cliente) => {
    setClienteParaExcluir(cliente)
    setDialogAberto(true)
  }

  // Função para excluir cliente
  const handleExcluirCliente = async () => {
    if (!clienteParaExcluir) return
    
    try {
      await clientesApi.excluirCliente(clienteParaExcluir.id)
      
      // Atualiza a lista de clientes após a exclusão
      setClientes(clientes.filter(c => c.id !== clienteParaExcluir.id))
      
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi excluído com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cliente.',
        variant: 'destructive',
      })
    } finally {
      setDialogAberto(false)
      setClienteParaExcluir(null)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <CabecalhoPagina
        titulo="Clientes"
        descricao="Gerencie seus clientes e acompanhe suas informações"
        acoes={
          <Button asChild>
            <Link href="/clientes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        }
      />

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <CardEstatistica
          titulo="Total de Clientes"
          valor={`${estatisticas.totalClientes} (PF: ${estatisticas.clientesPF} | PJ: ${estatisticas.clientesPJ})`}
          icone={<Users className="h-5 w-5" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100"
          corIcone="text-blue-500"
        />
        
        <CardEstatistica
          titulo="Projetos Ativos"
          valor={`${estatisticas.projetosAtivos} de ${estatisticas.totalProjetos}`}
          icone={<FileText className="h-5 w-5" />}
          className="bg-gradient-to-br from-green-50 to-green-100"
          corIcone="text-green-500"
        />
        
        <CardEstatistica
          titulo="Perfil dos Clientes"
          valor={`P:${estatisticas.pequenos} | M:${estatisticas.medios} | G:${estatisticas.grandes}`}
          icone={<Home className="h-5 w-5" />}
          className="bg-gradient-to-br from-purple-50 to-purple-100"
          corIcone="text-purple-500"
        />
        
        <CardEstatistica
          titulo="Valor em Projetos"
          valor={formatarMoeda(estatisticas.valorTotalProjetos)}
          icone={<ArrowUpRight className="h-5 w-5" />}
          className="bg-gradient-to-br from-amber-50 to-amber-100"
          corIcone="text-amber-500"
        />
      </div>

      {/* Filtros e busca */}
      <FiltrosPadrao
        valorBusca={busca}
        onBusca={(valor) => setBusca(valor)}
        placeholderBusca="Buscar por nome, CPF/CNPJ ou email..."
        onResetarFiltros={() => {
          setFiltroTipo('Todos')
          setUltimaInteracao('Todos')
          setFiltro('Todos')
          setBusca('')
        }}
        botaoNovo={{
          texto: "Novo Cliente",
          onClick: () => window.location.href = "/clientes/novo",
          icone: <Plus className="h-4 w-4" />
        }}
        filtrosAvancados={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Perfil do Cliente</label>
              <Select value={filtro} onValueChange={(value: any) => setFiltro(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Pequeno">Pequeno</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Cliente</label>
              <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Última Interação</label>
              <Select value={ultimaInteracao} onValueChange={(value: any) => setUltimaInteracao(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Qualquer período</SelectItem>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Total de {clientesFiltrados.length} clientes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TabelaPadrao
            dados={clientesFiltrados}
            colunas={[
              {
                chave: 'nome',
                titulo: 'Nome',
                alinhamento: 'left',
              },
              {
                chave: 'cpfCnpj',
                titulo: 'CPF/CNPJ',
                renderizador: (valor) => formatarCpfCnpj(valor)
              },
              {
                chave: 'telefone',
                titulo: 'Telefone',
                renderizador: (valor) => formatarTelefone(valor)
              },
              {
                chave: 'perfil',
                titulo: 'Perfil',
                renderizador: (valor) => (
                  <Badge variant="outline" className={getCorBadge(valor)}>
                    {valor === 'pequeno' ? 'Pequeno' : 
                     valor === 'medio' ? 'Médio' : 'Grande'}
                  </Badge>
                )
              },
              {
                chave: 'propriedades',
                titulo: 'Propriedades',
                renderizador: (valor) => valor?.length || 0
              },
              {
                chave: 'dataCadastro',
                titulo: 'Cadastro',
                renderizador: (valor) => formatarData(valor)
              },
            ]}
            idChave="id"
            mensagemVazia="Nenhum cliente encontrado."
            acaoRenderizador={(cliente) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/clientes/${cliente.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/clientes/${cliente.id}/editar`}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => confirmarExclusao(cliente)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              {clienteParaExcluir && `Tem certeza que deseja excluir o cliente ${clienteParaExcluir.nome}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluirCliente} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
