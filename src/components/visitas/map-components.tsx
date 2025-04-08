'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Calendar, 
  FileText, 
  Eye, 
  FileEdit,
  CheckSquare,
  Info
} from 'lucide-react'
import { Visita } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import Link from 'next/link'
import type { LatLngExpression } from 'leaflet'

// Importar estilos do Leaflet
import 'leaflet/dist/leaflet.css'

// Corrigir problema com os ícones do Leaflet
const markerIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

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

// Componente para centralizar o mapa
function CentralizarMapa({ coordenadas }: { coordenadas: LatLngExpression }) {
  const map = useMap()
  useEffect(() => {
    map.setView(coordenadas, 5)
  }, [coordenadas, map])
  return null
}

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

export default function MapComponents({ dados }: { dados: DadosMapa }) {
  // Corrigir problema com o Leaflet no SSR
  useEffect(() => {
    // Corrigir o problema com os ícones padrão do Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl
    
    L.Icon.Default.mergeOptions({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
    })
  }, [])

  const { 
    visitas, 
    clientesMap, 
    centroDoBrasil, 
    obterCoordenadas, 
    obterInfoPropriedade, 
    obterClasseMarcador, 
    isVisitaAtrasada 
  } = dados

  return (
    <>
      <MapContainer 
        center={centroDoBrasil} 
        zoom={4} 
        scrollWheelZoom={true}
        style={{ height: 580, width: '100%' }}
        className="leaflet-container"
      >
        <CentralizarMapa coordenadas={centroDoBrasil} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {visitas.map(visita => {
          const coordenadas = obterCoordenadas(visita.propriedadeId)
          if (!coordenadas) return null
          
          const infoPropriedade = obterInfoPropriedade(visita.propriedadeId)
          const classeMarcador = obterClasseMarcador(visita)
          
          return (
            <Marker 
              key={visita.id} 
              position={coordenadas}
              icon={markerIcon}
            >
              <Popup>
                <div className="map-popup-title">
                  {clientesMap[visita.clienteId] || 'Cliente não encontrado'}
                </div>
                
                <div className="map-popup-info">
                  <div className="map-popup-info-item">
                    <Calendar className="h-4 w-4" />
                    <span>{formatarData(visita.data)}</span>
                    {isVisitaAtrasada(visita) && (
                      <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 text-xs">
                        Atrasada
                      </Badge>
                    )}
                  </div>
                  
                  <div className="map-popup-info-item">
                    <Badge className={
                      visita.status === 'Agendada' ? 'bg-blue-500' :
                      visita.status === 'Realizada' ? 'bg-green-500' :
                      'bg-red-500'
                    }>
                      {visita.status}
                    </Badge>
                  </div>
                  
                  <div className="map-popup-info-item">
                    <MapPin className="h-4 w-4" />
                    <span>{infoPropriedade.nome}</span>
                  </div>
                  
                  {(infoPropriedade.municipio || infoPropriedade.estado) && (
                    <div className="map-popup-info-item">
                      <Info className="h-4 w-4" />
                      <span>
                        {infoPropriedade.municipio}
                        {infoPropriedade.municipio && infoPropriedade.estado ? ', ' : ''}
                        {infoPropriedade.estado}
                      </span>
                    </div>
                  )}
                  
                  {visita.observacoes && (
                    <div className="map-popup-info-item">
                      <FileText className="h-4 w-4" />
                      <span className="line-clamp-2">{visita.observacoes}</span>
                    </div>
                  )}
                </div>
                
                <div className="map-popup-actions">
                  <Link href={`/visitas/${visita.id}`} className="map-popup-button" style={{ color: 'white' }}>
                    <Eye className="h-3 w-3" style={{ color: 'white' }} /> Ver
                  </Link>
                  <Link href={`/visitas/${visita.id}/editar`} className="map-popup-button" style={{ color: 'white' }}>
                    <FileEdit className="h-3 w-3" style={{ color: 'white' }} /> Editar
                  </Link>
                  {visita.status === 'Agendada' && (
                    <Link href={`/visitas/${visita.id}/registrar`} className="map-popup-button" style={{ color: 'white' }}>
                      <CheckSquare className="h-3 w-3" style={{ color: 'white' }} /> Registrar
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      {/* Legenda do mapa */}
      <div className="map-legend">
        <div className="map-legend-title">Legenda</div>
        <div className="map-legend-items">
          <div className="map-legend-item">
            <div className="map-legend-color agendada"></div>
            <span>Agendada</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-color realizada"></div>
            <span>Realizada</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-color cancelada"></div>
            <span>Cancelada</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-color atrasada"></div>
            <span>Atrasada</span>
          </div>
        </div>
      </div>
    </>
  )
}
