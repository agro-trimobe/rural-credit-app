'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import type { LatLngExpression } from 'leaflet'

// Interface para os dados do mapa
interface DadosMapa {
  visitas: Visita[]
  clientesMap: {[key: string]: string}
  propriedades: PropriedadeComCoordenadas[]
  centroDoBrasil: LatLngExpression
  obterCoordenadas: (propriedadeId: string) => LatLngExpression | null
  obterInfoPropriedade: (propriedadeId: string) => { nome: string; municipio: string; estado: string }
  obterClasseMarcador: (visita: Visita) => string
  isVisitaAtrasada: (visita: Visita) => boolean
}

// Interface para o componente de mapa
interface MapComponentsProps {
  dados: DadosMapa
}

// Importação dinâmica dos componentes do Leaflet para evitar erros de SSR
const MapComponents = dynamic<MapComponentsProps>(
  () => import('./map-components'),
  { 
    loading: () => (
      <div className="flex items-center justify-center h-[580px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false 
  }
)
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  Eye, 
  FileEdit,
  CheckSquare,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Visita } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import Link from 'next/link'
import { propriedadesApi } from '@/lib/api'





// Interface para as coordenadas
interface Coordenadas {
  latitude: number
  longitude: number
}

// Interface para propriedades com coordenadas
interface PropriedadeComCoordenadas {
  id: string
  nome: string
  coordenadas?: Coordenadas
  clienteId: string
  municipio?: string
  estado?: string
}

interface MapaVisitasProps {
  visitas: Visita[]
  clientesMap: {[key: string]: string}
}



export function MapaVisitas({ visitas, clientesMap }: MapaVisitasProps) {
  const [propriedades, setPropriedades] = useState<PropriedadeComCoordenadas[]>([])
  const [carregando, setCarregando] = useState(true)
  const [centroDoBrasil] = useState<LatLngExpression>([-15.77972, -47.92972]) // Brasília

  // Verificar se a visita está atrasada (data no passado e status ainda é Agendada)
  const isVisitaAtrasada = (visita: Visita) => {
    return visita.status === 'Agendada' && new Date(visita.data) < new Date()
  }

  useEffect(() => {
    const carregarPropriedades = async () => {
      try {
        const dados = await propriedadesApi.listarPropriedades()
        setPropriedades(dados)
      } catch (error) {
        console.error('Erro ao carregar propriedades:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarPropriedades()
  }, [])

  // Função para obter as coordenadas de uma propriedade
  const obterCoordenadas = (propriedadeId: string): LatLngExpression | null => {
    const propriedade = propriedades.find(p => p.id === propriedadeId)
    
    if (propriedade?.coordenadas) {
      return [propriedade.coordenadas.latitude, propriedade.coordenadas.longitude]
    }
    
    // Se não tiver coordenadas, gerar coordenadas aleatórias para demonstração
    // Coordenadas aproximadas do Brasil
    const latMin = -33.7683777809
    const latMax = 5.24448639569
    const longMin = -73.9872354804
    const longMax = -34.7299934555
    
    // Gerar coordenadas aleatórias, mas consistentes para cada propriedade
    const seed = propriedadeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const random = (min: number, max: number, seed: number) => {
      const x = Math.sin(seed) * 10000
      const rand = x - Math.floor(x)
      return min + rand * (max - min)
    }
    
    const lat = random(latMin, latMax, seed)
    const long = random(longMin, longMax, seed + 1)
    
    return [lat, long]
  }

  // Obter informações da propriedade
  const obterInfoPropriedade = (propriedadeId: string) => {
    const propriedade = propriedades.find(p => p.id === propriedadeId)
    return {
      nome: propriedade?.nome || 'Propriedade não encontrada',
      municipio: propriedade?.municipio || '',
      estado: propriedade?.estado || ''
    }
  }

  // Obter classe CSS para o marcador com base no status da visita
  const obterClasseMarcador = (visita: Visita) => {
    if (isVisitaAtrasada(visita)) return 'map-marker-atrasada'
    
    switch (visita.status) {
      case 'Agendada':
        return 'map-marker-agendada'
      case 'Realizada':
        return 'map-marker-realizada'
      case 'Cancelada':
        return 'map-marker-cancelada'
      default:
        return ''
    }
  }

  if (carregando) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 flex items-center justify-center h-[580px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  // Preparar os dados para o componente de mapa
  const dadosMapa = {
    visitas,
    clientesMap,
    propriedades,
    centroDoBrasil,
    obterCoordenadas,
    obterInfoPropriedade,
    obterClasseMarcador,
    isVisitaAtrasada
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 relative">
        {carregando ? (
          <div className="flex items-center justify-center h-[580px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <MapComponents dados={dadosMapa} />
        )}
      </CardContent>
    </Card>
  )
}
