'use client'

import * as React from 'react'
import { Cell, Label, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts'

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
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
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
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                        style={{ fill: 'hsl(var(--foreground))', fontSize: '24px', fontWeight: 'bold' }}
                      >
                        {totalValue}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                        style={{ fill: 'hsl(var(--muted-foreground))', fontSize: '14px' }}
                      >
                        {data.datasets[0].label || 'Projetos'}
                      </tspan>
                    </text>
                  )
                }
                return null
              }}
            />
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
      </ResponsiveContainer>
    </ChartContainer>
  )
}
