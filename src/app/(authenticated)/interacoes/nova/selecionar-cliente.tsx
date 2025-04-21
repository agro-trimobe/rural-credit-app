'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  X, 
  UserCircle, 
  Clock, 
  Filter, 
  ChevronRight 
} from 'lucide-react'
import { Cliente } from '@/lib/crm-utils'
import { formatarData, formatarTelefone, formatarCpfCnpj } from '@/lib/formatters'
import { clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function NovaInteracaoSelecionarClienteConteudo() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([])
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroRecentes, setFiltroRecentes] = useState<boolean>(false)
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const todosClientes = await clientesApi.listarClientes()
        setClientes(todosClientes)
        setClientesFiltrados(todosClientes)
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de clientes',
          variant: 'destructive',
        })
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])
  
  useEffect(() => {
    let filtrados = [...clientes]
    
    // Aplicar filtro de busca
    if (busca.trim() !== '') {
      const termoBusca = busca.toLowerCase()
      filtrados = filtrados.filter(cliente => 
        cliente.nome.toLowerCase().includes(termoBusca) ||
        cliente.email?.toLowerCase().includes(termoBusca) ||
        cliente.telefone?.includes(termoBusca) ||
        cliente.cpfCnpj?.includes(termoBusca) ||
        cliente.cidade?.toLowerCase().includes(termoBusca) ||
        cliente.estado?.toLowerCase().includes(termoBusca)
      )
    }
    
    // Aplicar filtro de tipo
    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter(cliente => cliente.tipo === filtroTipo)
    }
    
    // Aplicar filtro de recentes (últimos 5 clientes acessados)
    if (filtroRecentes) {
      filtrados = filtrados.sort((a, b) => {
        const dataA = a.dataAtualizacao || a.dataCadastro || ''
        const dataB = b.dataAtualizacao || b.dataCadastro || ''
        return new Date(dataB).getTime() - new Date(dataA).getTime()
      }).slice(0, 5)
    }
    
    setClientesFiltrados(filtrados)
  }, [busca, clientes, filtroTipo, filtroRecentes])
  
  const selecionarCliente = (clienteId: string) => {
    router.push(`/clientes/${clienteId}/interacoes/nova`)
  }
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho e breadcrumbs */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/interacoes" className="hover:text-primary">Interações</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium text-foreground">Nova Interação</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Selecionar Cliente</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/interacoes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Barra de pesquisa e filtros */}
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes por nome, email, telefone, CPF/CNPJ ou localização..."
            className="pl-8 pr-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-9 w-9" 
              onClick={() => setBusca('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={filtroTipo === 'todos' ? 'bg-primary/10' : ''} 
            onClick={() => setFiltroTipo('todos')}
          >
            Todos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={filtroTipo === 'PF' ? 'bg-primary/10' : ''} 
            onClick={() => setFiltroTipo('PF')}
          >
            <UserCircle className="mr-1 h-3.5 w-3.5" />
            Pessoa Física
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={filtroTipo === 'PJ' ? 'bg-primary/10' : ''} 
            onClick={() => setFiltroTipo('PJ')}
          >
            <Building className="mr-1 h-3.5 w-3.5" />
            Pessoa Jurídica
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={filtroRecentes ? 'bg-primary/10' : ''} 
            onClick={() => setFiltroRecentes(!filtroRecentes)}
          >
            <Clock className="mr-1 h-3.5 w-3.5" />
            Recentes
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Clientes</CardTitle>
          <CardDescription className="text-xs">
            Selecione um cliente para registrar uma nova interação
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          {clientesFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clientesFiltrados.map((cliente) => (
                <Card key={cliente.id} className="overflow-hidden hover:border-primary transition-colors">
                  <CardContent className="p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                          {cliente.nome.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{cliente.nome}</h3>
                          <p className="text-xs text-muted-foreground">{formatarCpfCnpj(cliente.cpfCnpj)}</p>
                        </div>
                      </div>
                      <Badge variant={cliente.tipo === 'PF' ? 'outline' : 'secondary'} className="text-xs">
                        {cliente.tipo}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1 text-xs mt-1">
                      {cliente.email && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="truncate">{cliente.email}</span>
                        </div>
                      )}
                      {cliente.telefone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{formatarTelefone(cliente.telefone)}</span>
                        </div>
                      )}
                      {(cliente.cidade || cliente.estado) && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="truncate">
                            {cliente.cidade && cliente.estado 
                              ? `${cliente.cidade}, ${cliente.estado}`
                              : cliente.cidade || cliente.estado
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      className="mt-3 w-full" 
                      size="sm" 
                      onClick={() => selecionarCliente(cliente.id)}
                    >
                      Selecionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <User className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-sm font-medium">Nenhum cliente encontrado</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                {busca || filtroTipo !== 'todos' ? 'Tente ajustar os filtros aplicados' : 'Cadastre um cliente antes de registrar interações'}
              </p>
              {!busca && filtroTipo === 'todos' && (
                <Button asChild size="sm">
                  <Link href="/clientes/novo">
                    Cadastrar Cliente
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
