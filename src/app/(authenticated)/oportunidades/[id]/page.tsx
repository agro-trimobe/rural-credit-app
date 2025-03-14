'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import { 
  ArrowLeft,
  FileEdit,
  ArrowUpRight,
  Trash2,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Oportunidade } from '@/lib/crm-utils'
import { oportunidadesApi } from '@/lib/mock-api/oportunidades'
import { clientesApi } from '@/lib/mock-api/clientes'
import { formatarMoeda, formatarData, formatarDataHora, coresStatus } from '@/lib/formatters'

export default function OportunidadeDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null)
  const [nomeCliente, setNomeCliente] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        const dadosOportunidade = await oportunidadesApi.buscarOportunidadePorId(id)
        
        if (!dadosOportunidade) {
          setErro('Oportunidade não encontrada')
          return
        }
        
        setOportunidade(dadosOportunidade)
        
        // Carregar dados do cliente
        if (dadosOportunidade.clienteId) {
          const cliente = await clientesApi.buscarClientePorId(dadosOportunidade.clienteId)
          if (cliente) {
            setNomeCliente(cliente.nome)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setErro('Erro ao carregar dados da oportunidade')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [id])

  const handleExcluir = async () => {
    setDialogoExclusaoAberto(true)
  }

  const confirmarExclusao = async () => {
    try {
      const sucesso = await oportunidadesApi.excluirOportunidade(id)
      
      if (sucesso) {
        router.push('/oportunidades')
      } else {
        throw new Error('Não foi possível excluir a oportunidade.')
      }
    } catch (error) {
      console.error('Erro ao excluir oportunidade:', error)
    } finally {
      setDialogoExclusaoAberto(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (erro || !oportunidade) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/oportunidades">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Oportunidades
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{erro || 'Oportunidade não encontrada'}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/oportunidades">
                Voltar para lista de oportunidades
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const isOportunidadeAtiva = oportunidade.status !== 'Ganho' && oportunidade.status !== 'Perdido'
  const isProximoContatoAtrasado = oportunidade.proximoContato && new Date(oportunidade.proximoContato) <= new Date()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/oportunidades">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Oportunidades
          </Link>
        </Button>
        <div className="flex space-x-2">
          {isOportunidadeAtiva && (
            <Button variant="outline" asChild>
              <Link href={`/oportunidades/${id}/avancar`}>
                <ArrowUpRight className="mr-2 h-4 w-4" /> Avançar Status
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/oportunidades/${id}/editar`}>
              <FileEdit className="mr-2 h-4 w-4" /> Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleExcluir}>
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{oportunidade.titulo}</CardTitle>
                <CardDescription>
                  <Link href={`/clientes/${oportunidade.clienteId}`} className="hover:underline">
                    {nomeCliente || 'Cliente não encontrado'}
                  </Link>
                </CardDescription>
              </div>
              <Badge className={coresStatus.oportunidade[oportunidade.status]}>
                {oportunidade.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Descrição</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {oportunidade.descricao}
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  Valor da Oportunidade
                </h3>
                <p className="text-xl font-semibold">{formatarMoeda(oportunidade.valor)}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  Cliente
                </h3>
                <p>
                  <Link href={`/clientes/${oportunidade.clienteId}`} className="text-primary hover:underline">
                    {nomeCliente || 'Cliente não encontrado'}
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximo Contato</CardTitle>
            </CardHeader>
            <CardContent>
              {oportunidade.proximoContato ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatarData(oportunidade.proximoContato)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatarDataHora(oportunidade.proximoContato).split(' ')[1]}</span>
                  </div>
                  {isProximoContatoAtrasado && (
                    <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                      Contato atrasado
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum próximo contato agendado</p>
              )}
            </CardContent>
            {isOportunidadeAtiva && (
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/oportunidades/${id}/editar`}>
                    Agendar Contato
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={coresStatus.oportunidade[oportunidade.status]}>
                  {oportunidade.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em:</span>
                <span>{formatarData(oportunidade.dataCriacao)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atualizado em:</span>
                <span>{formatarData(oportunidade.dataAtualizacao)}</span>
              </div>
            </CardContent>
            {isOportunidadeAtiva && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="flex-1 mr-2" asChild>
                  <Link href={`/oportunidades/${id}/avancar?resultado=ganho`}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Ganho
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/oportunidades/${id}/avancar?resultado=perdido`}>
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                    Perdido
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Oportunidade</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta oportunidade?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
