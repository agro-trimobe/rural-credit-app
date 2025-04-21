'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, LineChart } from '@/components/ui/charts'
import { DoughnutChart } from '@/components/ui/doughnut-chart'
import { formatarData, formatarMoeda, coresStatus } from '@/lib/formatters'
import { clientesApi, projetosApi, visitasApi, oportunidadesApi } from '@/lib/api'
import { 
  CalendarIcon, 
  ClipboardList, 
  CreditCard, 
  TrendingUp,
  BarChart3,
  Users
} from 'lucide-react'
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { CardEstatistica } from '@/components/ui/card-padrao'
import Link from 'next/link'

interface Projeto {
  status: string
  valorTotal: number
}

interface Visita {
  status: string
}

interface OportunidadeStatus {
  quantidade: number
  valor: number
}

export default function Dashboard() {
  const [estatisticas, setEstatisticas] = useState({
    totalClientes: 0,
    totalProjetos: 0,
    totalVisitas: 0,
    valorProjetos: 0,
    valorOportunidades: 0,
    projetosStatus: {} as Record<string, number>,
    visitasStatus: {} as Record<string, number>,
    oportunidadesStatus: {} as Record<string, OportunidadeStatus>
  })
  
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar dados em paralelo
        const [clientes, projetos, visitas, estatisticasOportunidades] = await Promise.all([
          clientesApi.listarClientes(),
          projetosApi.listarProjetos(),
          visitasApi.listarVisitas(),
          oportunidadesApi.obterEstatisticas()
        ])
        
        // Calcular estatísticas de projetos por status
        const projetosStatus: Record<string, number> = {}
        projetos.forEach((projeto: Projeto) => {
          if (!projetosStatus[projeto.status]) {
            projetosStatus[projeto.status] = 0
          }
          projetosStatus[projeto.status]++
        })
        
        // Calcular estatísticas de visitas por status
        const visitasStatus: Record<string, number> = {}
        visitas.forEach((visita: Visita) => {
          if (!visitasStatus[visita.status]) {
            visitasStatus[visita.status] = 0
          }
          visitasStatus[visita.status]++
        })
        
        // Calcular valor total de projetos
        const valorProjetos = projetos.reduce((total: number, projeto: Projeto) => {
          if (projeto.status !== 'Cancelado') {
            return total + projeto.valorTotal
          }
          return total
        }, 0)
        
        setEstatisticas({
          totalClientes: clientes.length,
          totalProjetos: projetos.length,
          totalVisitas: visitas.length,
          valorProjetos,
          valorOportunidades: estatisticasOportunidades?.valorTotal || 0,
          projetosStatus,
          visitasStatus,
          oportunidadesStatus: estatisticasOportunidades?.porStatus 
            ? Object.entries(estatisticasOportunidades.porStatus).reduce((acc, [status, quantidade]) => {
                acc[status] = { 
                  quantidade: quantidade as number, 
                  valor: 0 // Valor padrão, poderia ser calculado se tivéssemos essa informação
                };
                return acc;
              }, {} as Record<string, OportunidadeStatus>)
            : {}
        })
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [])
  
  // Dados para o gráfico de projetos
  const dadosGraficoProjetos = {
    labels: Object.keys(estatisticas.projetosStatus),
    datasets: [
      {
        label: 'Projetos',
        data: Object.values(estatisticas.projetosStatus),
        total: estatisticas.totalProjetos
      }
    ]
  }
  
  const dadosGraficoOportunidades = {
    labels: Object.keys(estatisticas.oportunidadesStatus),
    datasets: [
      {
        label: 'Valor (R$)',
        data: Object.values(estatisticas.oportunidadesStatus).map(item => item.valor),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Quantidade',
        data: Object.values(estatisticas.oportunidadesStatus).map(item => item.quantidade),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  }
  
  const dadosGraficoVisitas = {
    labels: ['Realizada', 'Agendada'],
    datasets: [
      {
        label: 'Visitas',
        data: [estatisticas.visitasStatus['Realizada'] || 0, estatisticas.visitasStatus['Agendada'] || 0],
        total: estatisticas.totalVisitas
      }
    ]
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CabecalhoPagina
        titulo="Dashboard"
        descricao="Visão geral das suas atividades e desempenho"
      />

      {/* Cards de Resumo Padronizados */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <div className="relative group">
          <CardEstatistica
            titulo="Projetos Ativos"
            valor={estatisticas.totalProjetos.toString()}
            icone={<ClipboardList className="h-5 w-5" />}
          />
          <Link 
            href="/projetos" 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/5 dark:bg-white/5 transition-opacity rounded-lg"
          >
            <span className="text-xs font-medium bg-primary/90 text-primary-foreground px-2 py-1 rounded">Ver detalhes</span>
          </Link>
        </div>
        
        <div className="relative group">
          <CardEstatistica
            titulo="Valor em Projetos"
            valor={formatarMoeda(estatisticas.valorProjetos)}
            icone={<CreditCard className="h-5 w-5" />}
          />
          <Link 
            href="/projetos" 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/5 dark:bg-white/5 transition-opacity rounded-lg"
          >
            <span className="text-xs font-medium bg-primary/90 text-primary-foreground px-2 py-1 rounded">Ver detalhes</span>
          </Link>
        </div>
        
        <div className="relative group">
          <CardEstatistica
            titulo="Total de Clientes"
            valor={estatisticas.totalClientes.toString()}
            icone={<Users className="h-5 w-5" />}
          />
          <Link 
            href="/clientes" 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/5 dark:bg-white/5 transition-opacity rounded-lg"
          >
            <span className="text-xs font-medium bg-primary/90 text-primary-foreground px-2 py-1 rounded">Ver detalhes</span>
          </Link>
        </div>
        
        <div className="relative group">
          <CardEstatistica
            titulo="Valor em Oportunidades"
            valor={formatarMoeda(estatisticas.valorOportunidades)}
            icone={<TrendingUp className="h-5 w-5" />}
          />
          <Link 
            href="/oportunidades" 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/5 dark:bg-white/5 transition-opacity rounded-lg"
          >
            <span className="text-xs font-medium bg-primary/90 text-primary-foreground px-2 py-1 rounded">Ver detalhes</span>
          </Link>
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        {/* Gráfico de Projetos */}
        <Card className="shadow-md">
          <CardHeader className="pb-1 pt-2 px-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Projetos por Status</CardTitle>
                <CardDescription className="text-xs">
                  Distribuição por fase atual
                </CardDescription>
              </div>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-80 px-2 pb-3">
            <div className="w-full h-full max-w-[250px]">
              <DoughnutChart data={dadosGraficoProjetos} />
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Oportunidades */}
        <Card className="shadow-md">
          <CardHeader className="pb-1 pt-2 px-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Funil de Vendas</CardTitle>
                <CardDescription className="text-xs">
                  Oportunidades por estágio
                </CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="h-80 px-2 pb-3">
            <div className="w-full h-full">
              <BarChart data={dadosGraficoOportunidades} />
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Visitas */}
        <Card className="shadow-md">
          <CardHeader className="pb-1 pt-2 px-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Visitas por Status</CardTitle>
                <CardDescription className="text-xs">
                  Distribuição das visitas
                </CardDescription>
              </div>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-80 px-2 pb-3">
            <div className="w-full h-full max-w-[250px]">
              <DoughnutChart data={dadosGraficoVisitas} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
