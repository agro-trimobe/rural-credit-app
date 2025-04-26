'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Info } from 'lucide-react'
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

// Componente para centralizar o mapa
function CentralizarMapa({ coordenadas }: { coordenadas: LatLngExpression }) {
  const map = useMap()
  useEffect(() => {
    map.setView(coordenadas, 15) // Zoom mais próximo para visualizar a propriedade
  }, [coordenadas, map])
  return null
}

// Interface para os dados do mapa
interface DadosMapaPropriedade {
  coordenadas: LatLngExpression
  nome: string
  municipio?: string
  estado?: string
}

export default function MapComponentsPropriedade({ dados }: { dados: DadosMapaPropriedade }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  
  // Configurar ícones do Leaflet apenas uma vez na inicialização do componente
  useEffect(() => {
    // Corrigir o problema com os ícones padrão do Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl
    
    L.Icon.Default.mergeOptions({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
    })
    
    // Nenhum outro código de inicialização de mapa aqui - deixar o React handleá-lo
    // com a propriedade key no componente pai
  }, [])

  const { coordenadas, nome, municipio, estado } = dados

  return (
    <MapContainer 
      center={coordenadas} 
      zoom={15} 
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      className="leaflet-container"
    >
      <CentralizarMapa coordenadas={coordenadas} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker 
        position={coordenadas}
        icon={markerIcon}
      >
        <Popup>
          <div className="map-popup-title">
            {nome}
          </div>
          
          <div className="map-popup-info">
            {(municipio || estado) && (
              <div className="map-popup-info-item">
                <MapPin className="h-4 w-4" />
                <span>
                  {municipio}
                  {municipio && estado ? ', ' : ''}
                  {estado}
                </span>
              </div>
            )}
            
            <div className="map-popup-info-item">
              <Info className="h-4 w-4" />
              <span>
                Lat: {Array.isArray(coordenadas) ? coordenadas[0].toFixed(6) : ''},
                Lng: {Array.isArray(coordenadas) ? coordenadas[1].toFixed(6) : ''}
              </span>
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}
