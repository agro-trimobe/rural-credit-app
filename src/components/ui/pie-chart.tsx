'use client'

import * as React from 'react'
import { Cell, Legend, Pie, PieChart as RechartsPieChart, Tooltip } from 'recharts'

import { ChartConfig, ChartContainer, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart'

interface PieChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
    }[]
  }
  className?: string
}

export function PieChart({ data, className }: PieChartProps) {
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
      const colors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
      ]
      return {
        ...config,
        [label]: {
          label,
          color: colors[index % colors.length]
        },
      }
    }, {} as ChartConfig)
  }, [data.labels])

  return (
    <ChartContainer config={chartConfig} className={className || "h-full w-full"}>
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
        
        {/* Gráfico de pizza */}
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
          align="right"
        />
      </RechartsPieChart>
    </ChartContainer>
  )
}
