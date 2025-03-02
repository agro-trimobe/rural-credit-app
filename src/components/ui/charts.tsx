'use client'

import * as React from 'react'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { cn } from '@/lib/utils'

export type ChartConfig = Record<
  string,
  {
    label: string
    color: string
  }
>

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig
  children: React.ReactElement
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartProps) {
  // Cria variáveis CSS para as cores do gráfico
  React.useEffect(() => {
    if (!config) return

    Object.entries(config).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value.color)
    })

    return () => {
      if (!config) return
      Object.keys(config).forEach((key) => {
        document.documentElement.style.removeProperty(`--color-${key}`)
      })
    }
  }, [config])

  return (
    <div className={cn('w-full', className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

// Componente de BarChart
export function BarChart({ data, options = {} }: { data: any; options?: any }) {
  const config = React.useMemo(() => {
    const keys = data.datasets.map((dataset: any) => dataset.label)
    return keys.reduce((acc: ChartConfig, key: string, index: number) => {
      const colors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
      ]
      acc[key] = {
        label: key,
        color: colors[index % colors.length]
      }
      return acc
    }, {})
  }, [data])

  const chartData = React.useMemo(() => {
    return data.labels.map((label: string, index: number) => {
      const item: Record<string, any> = { name: label }
      data.datasets.forEach((dataset: any) => {
        item[dataset.label] = dataset.data[index]
      })
      return item
    })
  }, [data])

  return (
    <ChartContainer config={config} className="h-80">
      <RechartsBarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => {
            return [value, config[name]?.label || name]
          }}
        />
        <Legend />
        {data.datasets.map((dataset: any, index: number) => (
          <Bar 
            key={index} 
            dataKey={dataset.label} 
            fill={`var(--color-${dataset.label})`} 
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}

// Componente de LineChart
export function LineChart({ data, options = {} }: { data: any; options?: any }) {
  const config = React.useMemo(() => {
    const keys = data.datasets.map((dataset: any) => dataset.label)
    return keys.reduce((acc: ChartConfig, key: string, index: number) => {
      const colors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
      ]
      acc[key] = {
        label: key,
        color: colors[index % colors.length]
      }
      return acc
    }, {})
  }, [data])

  const chartData = React.useMemo(() => {
    return data.labels.map((label: string, index: number) => {
      const item: Record<string, any> = { name: label }
      data.datasets.forEach((dataset: any) => {
        item[dataset.label] = dataset.data[index]
      })
      return item
    })
  }, [data])

  return (
    <ChartContainer config={config} className="h-80">
      <RechartsLineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => {
            return [value, config[name]?.label || name]
          }}
        />
        <Legend />
        {data.datasets.map((dataset: any, index: number) => (
          <Line
            key={index}
            type="monotone"
            dataKey={dataset.label}
            stroke={`var(--color-${dataset.label})`}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  )
}

// Componente de PieChart
export function PieChart({ data, options = {} }: { data: any; options?: any }) {
  const chartData = React.useMemo(() => {
    return data.labels.map((label: string, index: number) => ({
      name: label,
      value: data.datasets[0].data[index]
    }))
  }, [data])

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ]

  return (
    <ChartContainer className="h-80">
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string, props: any) => {
          return [value, props.payload.name]
        }} />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  )
}

// Componente de DoughnutChart
export function DoughnutChart({ data, options = {} }: { data: any; options?: any }) {
  const chartData = React.useMemo(() => {
    return data.labels.map((label: string, index: number) => ({
      name: label,
      value: data.datasets[0].data[index]
    }))
  }, [data])

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ]

  return (
    <ChartContainer className="h-80">
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string, props: any) => {
          return [value, props.payload.name]
        }} />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  )
}
