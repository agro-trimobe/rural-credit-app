'use client'

import { useState, useEffect } from 'react'
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, MessageSquare, Eye, Search, Filter, Plus } from 'lucide-react'
import { Interacao, Cliente } from '@/lib/crm-utils'
import { interacoesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { formatarData } from '@/lib/formatters'

export default function InteracoesConteudo() {
  const [carregando, setCarregando] = useState(true)
  const [interacoes, setInteracoes] = useState<Interacao[]>([])
  const [clientesMap, setClientesMap] = useState<Record<string, Cliente>>({})
  const [busca, setBusca] = useState('')
  const [interacoesFiltradas, setInteracoesFiltradas] = useState<Interacao[]>([])
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar todas as interações
        const todasInteracoes = await interacoesApi.listarInteracoes()
        setInteracoes(todasInteracoes)
        setInteracoesFiltradas(todasInteracoes)
        
        // Carregar informações dos clientes relacionados
        const clientesIds = [...new Set(todasInteracoes.map(i => i.clienteId).filter(Boolean))]
        const clientesMap: Record<string, Cliente> = {}
        
        for (const clienteId of clientesIds) {
          if (clienteId) {
            const cliente = await clientesApi.buscarClientePorId(clienteId)
            if (cliente) {
              clientesMap[clienteId] = cliente
            }
          }
        }
        
        setClientesMap(clientesMap)
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as interações',
          variant: 'destructive',
        })
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])
  
  useEffect(() => {
    if (busca.trim() === '') {
      setInteracoesFiltradas(interacoes)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtradas = interacoes.filter(interacao => {
        const clienteNome = interacao.clienteId && clientesMap[interacao.clienteId]
          ? clientesMap[interacao.clienteId].nome.toLowerCase()
          : ''
          
        return (
          interacao.assunto.toLowerCase().includes(termoBusca) ||
          interacao.descricao.toLowerCase().includes(termoBusca) ||
          interacao.tipo.toLowerCase().includes(termoBusca) ||
          (interacao.status ? interacao.status.toLowerCase().includes(termoBusca) : false) ||
          clienteNome.includes(termoBusca)
        )
      })
      
      setInteracoesFiltradas(filtradas)
    }
  }, [busca, interacoes, clientesMap])
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Interações</h1>
        <Button asChild>
          <Link href="/interacoes/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Interação
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar interações..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Todas as Interações</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as interações registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interacoesFiltradas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interacoesFiltradas.map((interacao) => (
                  <TableRow key={interacao.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatarData(interacao.data)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {interacao.clienteId && clientesMap[interacao.clienteId] ? (
                        <Link 
                          href={`/clientes/${interacao.clienteId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {clientesMap[interacao.clienteId].nome}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Cliente não disponível</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {interacao.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{interacao.assunto}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {interacao.descricao}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          interacao.status === 'Concluída' ? 'default' : 
                          interacao.status === 'Em andamento' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {interacao.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/interacoes/${interacao.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma interação encontrada</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {busca ? 'Tente ajustar os termos da busca' : 'Registre sua primeira interação com um cliente'}
              </p>
              {!busca && (
                <Button asChild>
                  <Link href="/interacoes/nova">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Interação
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
