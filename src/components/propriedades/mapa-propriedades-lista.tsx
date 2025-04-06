'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import type { LatLngExpression } from 'leaflet'
import { Propriedade } from '@/lib/crm-utils'

// Interface para as coordenadas
interface Coordenadas {
  latitude: number
  longitude: number
}

// Interface para o componente de mapa
interface MapaPropriedadesListaProps {
  propriedades: Propriedade[]
  classificarTamanho: (area: number) => { texto: string; cor: string }
  projetosPorPropriedade: Record<string, number>
}

// Interface para os dados do mapa
interface DadosMapaPropriedades {
  propriedades: Propriedade[]
  classificarTamanho: (area: number) => { texto: string; cor: string }
  projetosPorPropriedade: Record<string, number>
  centroDoBrasil: LatLngExpression
}

// Interface para o componente de mapa
interface MapComponentsPropriedadesProps {
  dados: DadosMapaPropriedades
}

// Importação dinâmica dos componentes do Leaflet para evitar erros de SSR
const MapComponentsPropriedades = dynamic<MapComponentsPropriedadesProps>(
  () => import('./map-components-propriedades-lista'),
  { 
    loading: () => (
      <div className="flex items-center justify-center h-[580px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false 
  }
)

export default function MapaPropriedadesLista({ 
  propriedades, 
  classificarTamanho,
  projetosPorPropriedade
}: MapaPropriedadesListaProps) {
  const [mapaCarregado, setMapaCarregado] = useState(false)

  // Coordenadas aproximadas do centro do Brasil
  const centroDoBrasil: LatLngExpression = [-15.77972, -47.92972]

  useEffect(() => {
    // Marcar que o mapa foi carregado no lado do cliente
    setMapaCarregado(true)
  }, [])

  // Preparar dados para o componente de mapa
  const dadosMapa: DadosMapaPropriedades = {
    propriedades,
    classificarTamanho,
    projetosPorPropriedade,
    centroDoBrasil
  }

  return (
    <Card>
      <CardContent className="p-0 h-[580px] overflow-hidden">
        {mapaCarregado && <MapComponentsPropriedades dados={dadosMapa} />}
      </CardContent>
    </Card>
  )
}
