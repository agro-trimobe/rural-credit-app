'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, LineChart } from '@/components/ui/charts'
import { DoughnutChart } from '@/components/ui/doughnut-chart'
import { formatarMoeda } from '@/lib/formatters'
import { clientesApi } from '@/lib/mock-api/clientes'
import { projetosApi } from '@/lib/mock-api/projetos'
import { visitasApi } from '@/lib/mock-api/visitas'
import { oportunidadesApi } from '@/lib/mock-api/oportunidades'
import { 
  CalendarIcon, 
  ClipboardList, 
  CreditCard, 
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [estatisticas, setEstatisticas] = useState({
    totalClientes: 0,
    totalProjetos: 0,
    totalVisitas: 0,
    valorProjetos: 0,
    valorOportunidades: 0,
    projetosStatus: {} as Record<string, number>,
    visitasStatus: {} as Record<string, number>,
    oportunidadesStatus: {} as Record<string, { quantidade: number, valor: number }>
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
        projetos.forEach(projeto => {
          if (!projetosStatus[projeto.status]) {
            projetosStatus[projeto.status] = 0
          }
          projetosStatus[projeto.status]++
        })
        
        // Calcular estatísticas de visitas por status
        const visitasStatus: Record<string, number> = {}
        visitas.forEach(visita => {
          if (!visitasStatus[visita.status]) {
            visitasStatus[visita.status] = 0
          }
          visitasStatus[visita.status]++
        })
        
        // Calcular valor total de projetos
        const valorProjetos = projetos.reduce((total, projeto) => {
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
          valorOportunidades: estatisticasOportunidades.valorTotal,
          projetosStatus,
          visitasStatus,
          oportunidadesStatus: estatisticasOportunidades.porStatus
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
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas atividades e desempenho
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {/* Card de Projetos */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-xl font-bold">{estatisticas.totalProjetos}</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                Total em andamento
              </p>
              <Link href="/projetos" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Ver detalhes
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Card de Valor Total em Projetos */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-sm font-medium">Valor em Projetos</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-xl font-bold">{formatarMoeda(estatisticas.valorProjetos)}</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                Projetos ativos: {estatisticas.totalProjetos}
              </p>
              <Link href="/projetos" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                Ver projetos
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Card de Visitas */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-sm font-medium">Visitas</CardTitle>
            <CalendarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-xl font-bold">{estatisticas.totalVisitas}</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                Agendadas: {estatisticas.visitasStatus['Agendada'] || 0}
              </p>
              <Link href="/visitas" className="text-xs text-green-600 dark:text-green-400 hover:underline">
                Ver agenda
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Card de Oportunidades */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-xl font-bold">{Object.values(estatisticas.oportunidadesStatus).reduce((acc, curr) => acc + curr.quantidade, 0)}</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                Valor: {formatarMoeda(estatisticas.valorOportunidades)}
              </p>
              <Link href="/oportunidades" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
                Ver detalhes
              </Link>
            </div>
          </CardContent>
        </Card>
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
