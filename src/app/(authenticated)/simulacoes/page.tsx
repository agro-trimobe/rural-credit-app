'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calculator, 
  Search, 
  Plus, 
  ArrowUpDown, 
  MoreHorizontal,
  FileText,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Simulacao } from '@/lib/crm-utils'
import { formatarMoeda, formatarData } from '@/lib/formatters'
import { simulacoesApi } from '@/lib/api'

export default function SimulacoesPage() {
  const router = useRouter()
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([])
  const [filtro, setFiltro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarSimulacoes = async () => {
      try {
        const dados = await simulacoesApi.listarSimulacoes()
        setSimulacoes(dados)
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar simulações:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as simulações.',
          variant: 'destructive'
        })
        setCarregando(false)
      }
    }

    carregarSimulacoes()
  }, [])

  const simulacoesFiltradas = simulacoes.filter(simulacao => 
    simulacao.linhaCredito.toLowerCase().includes(filtro.toLowerCase())
  )

  const handleExcluirSimulacao = async (id: string) => {
    try {
      await simulacoesApi.excluirSimulacao(id)
      setSimulacoes(simulacoes.filter(s => s.id !== id))
      toast({
        title: 'Sucesso',
        description: 'Simulação excluída com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao excluir simulação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a simulação.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Simulações de Crédito</h1>
          <p className="text-muted-foreground">
            Gerencie simulações de financiamento para diferentes linhas de crédito rural
          </p>
        </div>
        <Button onClick={() => router.push('/simulacoes/nova')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Simulação
        </Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Simulações</CardTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por linha de crédito..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="h-9 w-full md:w-[300px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Carregando simulações...</p>
            </div>
          ) : simulacoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <Calculator className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-medium">Nenhuma simulação encontrada</p>
                <p className="text-sm text-muted-foreground">
                  {filtro 
                    ? 'Tente ajustar os filtros ou criar uma nova simulação.' 
                    : 'Comece criando sua primeira simulação de crédito rural.'}
                </p>
              </div>
              <Button onClick={() => router.push('/simulacoes/nova')}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Simulação
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Linha de Crédito</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Valor
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Taxa de Juros</TableHead>
                  <TableHead>Prazo (meses)</TableHead>
                  <TableHead>Carência</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulacoesFiltradas.map((simulacao) => (
                  <TableRow key={simulacao.id}>
                    <TableCell className="font-medium">{simulacao.linhaCredito}</TableCell>
                    <TableCell>{formatarMoeda(simulacao.valorFinanciamento)}</TableCell>
                    <TableCell>{simulacao.taxaJuros}% a.a.</TableCell>
                    <TableCell>{simulacao.prazoTotal}</TableCell>
                    <TableCell>{simulacao.carencia}</TableCell>
                    <TableCell>{formatarMoeda(simulacao.valorParcela)}</TableCell>
                    <TableCell>{formatarData(simulacao.dataCriacao)}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/simulacoes/${simulacao.id}`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExcluirSimulacao(simulacao.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
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
    </div>
  )
}
