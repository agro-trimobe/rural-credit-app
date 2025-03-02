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
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileEdit, 
  Trash2, 
  Eye 
} from 'lucide-react'
import { Cliente, formatarCpfCnpj, formatarTelefone, formatarData } from '@/lib/crm-utils'
import { clientesApi } from '@/lib/mock-api'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | 'Pequeno' | 'Médio' | 'Grande'>('Todos')

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const dados = await clientesApi.listarClientes()
        setClientes(dados)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarClientes()
  }, [])

  // Filtrar clientes com base na busca e no filtro
  const clientesFiltrados = clientes.filter(cliente => {
    const correspondeAoBusca = 
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) || 
      cliente.cpfCnpj.includes(busca) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase())
    
    const correspondeAoFiltro = filtro === 'Todos' || 
      (filtro === 'Pequeno' && cliente.perfil === 'pequeno') ||
      (filtro === 'Médio' && cliente.perfil === 'medio') ||
      (filtro === 'Grande' && cliente.perfil === 'grande')
    
    return correspondeAoBusca && correspondeAoFiltro
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

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <Button asChild>
          <Link href="/crm/clientes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Total de {clientesFiltrados.length} clientes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, CPF/CNPJ ou email..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Perfil: {filtro} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFiltro('Todos')}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Pequeno')}>
                  Pequeno
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Médio')}>
                  Médio
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('Grande')}>
                  Grande
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Propriedades</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhum cliente encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientesFiltrados.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{formatarCpfCnpj(cliente.cpfCnpj)}</TableCell>
                        <TableCell>{formatarTelefone(cliente.telefone)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCorBadge(cliente.perfil)}>
                            {cliente.perfil === 'pequeno' ? 'Pequeno' : 
                             cliente.perfil === 'medio' ? 'Médio' : 'Grande'}
                          </Badge>
                        </TableCell>
                        <TableCell>{cliente.propriedades?.length || 0}</TableCell>
                        <TableCell>{formatarData(cliente.dataCadastro)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/crm/clientes/${cliente.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/crm/clientes/${cliente.id}/editar`}>
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
