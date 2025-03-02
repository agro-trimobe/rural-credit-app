'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatarMoeda } from '@/lib/crm-utils'
import { clientesApi } from '@/lib/mock-api/clientes'
import { projetosApi } from '@/lib/mock-api/projetos'
import { visitasApi } from '@/lib/mock-api/visitas'
import { oportunidadesApi } from '@/lib/mock-api/oportunidades'
import { BarChart, LineChart } from '@/components/ui/charts'
import { PieChart } from '@/components/ui/pie-chart'
import { DoughnutChart } from '@/components/ui/doughnut-chart'
import { CalendarIcon, ClipboardList, CreditCard, Users } from 'lucide-react'
import Link from 'next/link'

export default function CRMDashboard() {
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
  
  // Preparar dados para gráficos
  const dadosGraficoProjetos = {
    labels: Object.keys(estatisticas.projetosStatus),
    datasets: [
      {
        label: 'Projetos',
        data: Object.values(estatisticas.projetosStatus),
      },
    ],
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
    labels: Object.keys(estatisticas.visitasStatus),
    datasets: [
      {
        label: 'Visitas',
        data: Object.values(estatisticas.visitasStatus),
      },
    ],
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
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas atividades e desempenho
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/clientes" className="text-primary hover:underline">
                Ver todos os clientes
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalProjetos}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/projetos" className="text-primary hover:underline">
                Gerenciar projetos
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Projetos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(estatisticas.valorProjetos)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total em projetos ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Visitas</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.visitasStatus['Agendada'] || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/visitas" className="text-primary hover:underline">
                Ver agenda de visitas
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projetos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
          <TabsTrigger value="visitas">Visitas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projetos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projetos por Status</CardTitle>
              <CardDescription>
                Distribuição dos projetos por status atual
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-80">
              <DoughnutChart data={dadosGraficoProjetos} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="oportunidades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funil de Oportunidades</CardTitle>
              <CardDescription>
                Valor e quantidade de oportunidades por estágio
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart data={dadosGraficoOportunidades} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="visitas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visitas por Status</CardTitle>
              <CardDescription>
                Distribuição das visitas técnicas por status
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-80">
              <PieChart data={dadosGraficoVisitas} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
