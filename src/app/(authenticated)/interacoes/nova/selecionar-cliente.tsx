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
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, User, Phone, MapPin, Eye } from 'lucide-react'
import { Cliente } from '@/lib/crm-utils'
import { clientesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default function NovaInteracaoSelecionarClienteConteudo() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([])
  
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
    if (busca.trim() === '') {
      setClientesFiltrados(clientes)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(termoBusca) ||
        cliente.email?.toLowerCase().includes(termoBusca) ||
        cliente.telefone?.includes(termoBusca) ||
        cliente.cpfCnpj?.includes(termoBusca) ||
        cliente.cidade?.toLowerCase().includes(termoBusca) ||
        cliente.estado?.toLowerCase().includes(termoBusca)
      )
      
      setClientesFiltrados(filtrados)
    }
  }, [busca, clientes])
  
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
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/interacoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Selecionar Cliente para Nova Interação</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes por nome, email, telefone, CPF/CNPJ ou localização..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Selecione um cliente para registrar uma nova interação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientesFiltrados.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{cliente.nome}</div>
                          <div className="text-sm text-muted-foreground">{cliente.cpfCnpj}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{cliente.email}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-1 h-3 w-3" />
                          {cliente.telefone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                        {cliente.cidade && cliente.estado 
                          ? `${cliente.cidade}, ${cliente.estado}`
                          : 'Não informado'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cliente.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        onClick={() => selecionarCliente(cliente.id)}
                        variant="default" 
                        size="sm"
                      >
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {busca ? 'Tente ajustar os termos da busca' : 'Cadastre um cliente antes de registrar interações'}
              </p>
              {!busca && (
                <Button asChild>
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
