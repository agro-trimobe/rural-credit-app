'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Map } from 'lucide-react'
import type { LatLngExpression } from 'leaflet'

// Interface para as coordenadas
interface Coordenadas {
  latitude: number
  longitude: number
}

// Interface para o componente de mapa da propriedade
interface MapaPropriedadeProps {
  coordenadas?: Coordenadas
  nome: string
  municipio?: string
  estado?: string
}

// Interface para os dados do mapa
interface DadosMapaPropriedade {
  coordenadas: LatLngExpression
  nome: string
  municipio?: string
  estado?: string
}

// Interface para o componente de mapa
interface MapComponentsPropriedadeProps {
  dados: DadosMapaPropriedade
}

// Importação dinâmica dos componentes do Leaflet para evitar erros de SSR
const MapComponentsPropriedade = dynamic<MapComponentsPropriedadeProps>(
  () => import('./map-components-propriedade'),
  { 
    loading: () => (
      <div className="flex items-center justify-center h-[250px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false 
  }
)

export default function MapaPropriedade({ coordenadas, nome, municipio, estado }: MapaPropriedadeProps) {
  const [mapaCarregado, setMapaCarregado] = useState(false)

  useEffect(() => {
    // Marcar que o mapa foi carregado no lado do cliente
    setMapaCarregado(true)
  }, [])

  if (!coordenadas) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Map className="h-5 w-5 mr-2 text-primary" />
            Mapa da Propriedade
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[250px] rounded-b-lg overflow-hidden">
          <div className="bg-slate-100 h-full w-full flex items-center justify-center">
            <div className="text-center">
              <Map className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground mt-2">Coordenadas não disponíveis</p>
              <p className="text-xs text-muted-foreground">Adicione coordenadas para visualizar o mapa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Converter coordenadas para o formato do Leaflet
  const coordenadasLeaflet: LatLngExpression = [coordenadas.latitude, coordenadas.longitude]

  // Preparar dados para o componente de mapa
  const dadosMapa: DadosMapaPropriedade = {
    coordenadas: coordenadasLeaflet,
    nome,
    municipio,
    estado
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Map className="h-5 w-5 mr-2 text-primary" />
          Mapa da Propriedade
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[250px] rounded-b-lg overflow-hidden">
        {mapaCarregado && <MapComponentsPropriedade dados={dadosMapa} />}
      </CardContent>
    </Card>
  )
}
