import { useEffect, useState } from 'react'
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api'

interface Order {
  id: string
  vehicle: string
  plate: string
  origin: string
  destination: string
  origin_lat?: number
  origin_lng?: number
  destino_lat?: number
  destino_lng?: number
  status: string
  driver: string
}

interface MapViewProps {
  orders: Order[]
  apiKey?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
}

// Centro padrão: Maringá-PR
const defaultCenter = {
  lat: -23.4205,
  lng: -51.9333,
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
}

export default function MapView({ orders, apiKey }: MapViewProps) {
  const [selectedMarker, setSelectedMarker] = useState<{
    position: { lat: number; lng: number }
    order: Order
    type: 'origin' | 'destination'
  } | null>(null)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [mapZoom, setMapZoom] = useState(7)

  // Ajusta o centro e zoom baseado nas ordens
  useEffect(() => {
    if (orders.length > 0) {
      const validOrders = orders.filter(
        (order) =>
          order.origin_lat &&
          order.origin_lng &&
          order.destino_lat &&
          order.destino_lng
      )

      if (validOrders.length > 0) {
        // Calcula o centro médio de todas as ordens
        const avgLat =
          validOrders.reduce((sum, order) => sum + (order.origin_lat || 0), 0) /
          validOrders.length
        const avgLng =
          validOrders.reduce((sum, order) => sum + (order.origin_lng || 0), 0) /
          validOrders.length

        setMapCenter({ lat: avgLat, lng: avgLng })
        setMapZoom(validOrders.length === 1 ? 10 : 7)
      }
    }
  }, [orders])

  if (!apiKey) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Configure Google Maps API
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Para visualizar o rastreamento em tempo real, configure sua chave de API do Google Maps.
          </p>
          <a
            href="https://developers.google.com/maps/documentation/javascript/get-api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Obter API Key
          </a>
          <p className="text-xs text-gray-500 mt-4">
            Configure a variável <code className="bg-white px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={mapOptions}
        >
          {orders.map((order) => {
            // Marcador de Origem (verde)
            if (order.origin_lat && order.origin_lng) {
              const originPosition = {
                lat: order.origin_lat,
                lng: order.origin_lng,
              }

              return (
                <div key={`${order.id}-origin`}>
                  <Marker
                    position={originPosition}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: '#10B981',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    }}
                    onClick={() =>
                      setSelectedMarker({
                        position: originPosition,
                        order,
                        type: 'origin',
                      })
                    }
                  />

                  {/* Marcador de Destino (vermelho) */}
                  {order.destino_lat && order.destino_lng && (
                    <>
                      <Marker
                        position={{
                          lat: order.destino_lat,
                          lng: order.destino_lng,
                        }}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: '#EF4444',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }}
                        onClick={() =>
                          setSelectedMarker({
                            position: {
                              lat: order.destino_lat!,
                              lng: order.destino_lng!,
                            },
                            order,
                            type: 'destination',
                          })
                        }
                      />

                      {/* Linha conectando origem e destino */}
                      <Polyline
                        path={[originPosition, { lat: order.destino_lat, lng: order.destino_lng }]}
                        options={{
                          strokeColor: order.status === 'em_transito' ? '#3B82F6' : '#9CA3AF',
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          geodesic: true,
                        }}
                      />
                    </>
                  )}
                </div>
              )
            }
            return null
          })}

          {/* InfoWindow ao clicar no marcador */}
          {selectedMarker && (
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{selectedMarker.order.id}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedMarker.type === 'origin'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedMarker.type === 'origin' ? 'Origem' : 'Destino'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">
                  {selectedMarker.order.vehicle}
                </p>
                <p className="text-xs text-gray-500 mb-1">{selectedMarker.order.plate}</p>
                <p className="text-xs text-gray-600">
                  {selectedMarker.type === 'origin'
                    ? selectedMarker.order.origin
                    : selectedMarker.order.destination}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Motorista: {selectedMarker.order.driver}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            <span className="text-gray-700">Origem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            <span className="text-gray-700">Destino</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-500"></div>
            <span className="text-gray-700">Rota Ativa</span>
          </div>
        </div>
      </div>
    </div>
  )
}
