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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  FileEdit, 
  Trash2, 
  Calendar,
  MapPin,
  FileText,
  User,
  Camera,
  File,
  FileCheck,
  Plus
} from 'lucide-react'
import { Visita } from '@/lib/crm-utils'
import { formatarData, formatarDataHora, coresStatus } from '@/lib/formatters'
import { visitasApi } from '@/lib/mock-api/visitas'
import { clientesApi } from '@/lib/mock-api/clientes'
import { propriedadesApi } from '@/lib/mock-api/propriedades'
import { projetosApi } from '@/lib/mock-api/projetos'
import { toast } from '@/hooks/use-toast'

// Componente cliente que implementa a lógica com hooks
export default function VisitaDetalhesConteudo({ visitaId }: { visitaId: string }) {
  const router = useRouter()
  const [visita, setVisita] = useState<Visita | null>(null)
  const [nomeCliente, setNomeCliente] = useState<string>('')
  const [nomePropriedade, setNomePropriedade] = useState<string>('')
  const [nomeProjeto, setNomeProjeto] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    const carregarVisita = async () => {
      try {
        setCarregando(true)
        const dadosVisita = await visitasApi.buscarVisitaPorId(visitaId)
        
        if (!dadosVisita) {
          toast({
            title: 'Erro',
            description: 'Visita não encontrada',
            variant: 'destructive',
          })
          router.push('/visitas')
          return
        }
        
        setVisita(dadosVisita)
        
        // Carregar dados do cliente
        const cliente = await clientesApi.buscarClientePorId(dadosVisita.clienteId)
        if (cliente) {
          setNomeCliente(cliente.nome)
        }
        
        // Carregar dados da propriedade
        const propriedade = await propriedadesApi.buscarPropriedadePorId(dadosVisita.propriedadeId)
        if (propriedade) {
          setNomePropriedade(propriedade.nome)
        }
        
        // Carregar dados do projeto (se existir)
        if (dadosVisita.projetoId) {
          const projeto = await projetosApi.buscarProjetoPorId(dadosVisita.projetoId)
          if (projeto) {
            setNomeProjeto(projeto.titulo)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar visita:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da visita.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarVisita()
  }, [visitaId, router])

  const handleExcluir = async () => {
    if (!visita) return
    
    if (!confirm('Tem certeza que deseja excluir esta visita?')) {
      return
    }
    
    try {
      setExcluindo(true)
      const sucesso = await visitasApi.excluirVisita(visita.id)
      
      if (sucesso) {
        toast({
          title: 'Visita excluída',
          description: 'A visita foi excluída com sucesso.',
        })
        router.push('/visitas')
      } else {
        throw new Error('Não foi possível excluir a visita.')
      }
    } catch (error) {
      console.error('Erro ao excluir visita:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a visita.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!visita) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Visita não encontrada.</p>
            <Button asChild className="mt-4">
              <Link href="/visitas">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Visitas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verificar se a visita está atrasada (data no passado e status ainda é Agendada)
  const isVisitaAtrasada = visita.status === 'Agendada' && new Date(visita.data) < new Date()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/visitas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detalhes da Visita</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/visitas/${visita.id}/editar`}>
              <FileEdit className="mr-2 h-4 w-4" /> Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleExcluir} disabled={excluindo}>
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
          {visita.status === 'Agendada' && (
            <Button variant="default" asChild>
              <Link href={`/visitas/${visita.id}/registrar`}>
                <Calendar className="mr-2 h-4 w-4" /> Registrar Visita
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Visita</CardTitle>
            <CardDescription>
              Detalhes e observações da visita técnica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="flex items-center space-x-2">
                <Badge className={coresStatus.visita[visita.status]}>
                  {visita.status}
                </Badge>
                {isVisitaAtrasada && (
                  <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                    Atrasada
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">Data da Visita</p>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <p>{formatarData(visita.data)}</p>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Link href={`/clientes/${visita.clienteId}`} className="text-primary hover:underline">
                    {nomeCliente || 'Cliente não encontrado'}
                  </Link>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">Propriedade</p>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Link href={`/propriedades/${visita.propriedadeId}`} className="text-primary hover:underline">
                    {nomePropriedade || 'Propriedade não encontrada'}
                  </Link>
                </div>
              </div>
              
              {visita.projetoId && (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">Projeto</p>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Link href={`/projetos/${visita.projetoId}`} className="text-primary hover:underline">
                      {nomeProjeto || 'Projeto não encontrado'}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Observações</p>
              <p className="whitespace-pre-wrap">{visita.observacoes || 'Sem observações'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fotos da Visita</CardTitle>
              <CardDescription>
                {visita.fotos.length} foto(s) registrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visita.fotos.length === 0 ? (
                <div className="text-center py-4">
                  <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Nenhuma foto registrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {visita.fotos.map((foto, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={foto} 
                        alt={`Foto ${index + 1}`} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/visitas/${visita.id}/fotos`}>
                  <Camera className="mr-2 h-4 w-4" /> Gerenciar Fotos
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>
                Documentos relacionados à visita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/visitas/${visita.id}/documentos`}>
                    <FileCheck className="mr-2 h-4 w-4" /> Ver Documentos
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/documentos/novo?visitaId=${visita.id}&clienteId=${visita.clienteId}`}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Documento
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
                <p className="text-sm">{formatarDataHora(visita.dataCriacao)}</p>
              </div>
              {visita.dataAtualizacao && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                  <p className="text-sm">{formatarDataHora(visita.dataAtualizacao)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
