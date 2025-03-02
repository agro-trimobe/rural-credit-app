'use client'

import * as React from 'react'
import { Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { ChartConfig, ChartContainer, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart'

interface DoughnutChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
    }[]
  }
  className?: string
}

export function DoughnutChart({ data, className }: DoughnutChartProps) {
  // Transformar os dados para o formato esperado pelo Recharts
  const chartData = React.useMemo(() => {
    return data.labels.map((label, index) => ({
      name: label,
      value: data.datasets[0].data[index],
    }))
  }, [data])

  // Calcular o valor total para exibir no centro
  const totalValue = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }, [chartData])

  // Configuração do gráfico
  const chartConfig = React.useMemo(() => {
    return data.labels.reduce((config, label, index) => {
      return {
        ...config,
        [label]: {
          label,
        },
      }
    }, {} as ChartConfig)
  }, [data.labels])

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsPieChart>
        {/* Texto no centro do gráfico */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '24px', fontWeight: 'bold' }}
        >
          {totalValue}
        </text>
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '14px', fill: 'var(--muted-foreground)' }}
        >
          {data.datasets[0].label || 'Total'}
        </text>
        
        {/* Gráfico de rosca */}
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={false}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`hsl(var(--chart-${(index % 5) + 1}))`}
            />
          ))}
        </Pie>
        
        {/* Tooltip e legenda */}
        <Tooltip content={<ChartTooltipContent />} />
        <Legend 
          content={<ChartLegendContent />} 
          verticalAlign="middle" 
          align="left"
          layout="vertical"
        />
      </RechartsPieChart>
    </ChartContainer>
  )
}
