import MapView from '../components/MapView'

// Mock data com coordenadas
const mockOrders = [
  {
    id: 'OS-001',
    vehicle: 'Toyota Corolla 2020',
    plate: 'ABC-1234',
    origin: 'Maringá - PR',
    destination: 'Curitiba - PR',
    origin_lat: -23.4205,
    origin_lng: -51.9333,
    destino_lat: -25.4284,
    destino_lng: -49.2733,
    status: 'em_transito',
    driver: 'João Silva',
    eta: '2h 30min',
    distance: '420 km'
  },
  {
    id: 'OS-002',
    vehicle: 'Honda Civic 2019',
    plate: 'XYZ-5678',
    origin: 'Londrina - PR',
    destination: 'São Paulo - SP',
    origin_lat: -23.3045,
    origin_lng: -51.1696,
    destino_lat: -23.5505,
    destino_lng: -46.6333,
    status: 'aguardando_coleta',
    driver: 'Maria Santos',
    eta: '45min',
    distance: '520 km'
  },
  {
    id: 'OS-003',
    vehicle: 'Ford Ka 2021',
    plate: 'DEF-9012',
    origin: 'Cascavel - PR',
    destination: 'Maringá - PR',
    origin_lat: -24.9555,
    origin_lng: -53.4552,
    destino_lat: -23.4205,
    destino_lng: -51.9333,
    status: 'em_transito',
    driver: 'Carlos Oliveira',
    eta: '1h 15min',
    distance: '280 km'
  },
]

const stats = [
  { label: 'Ordens Ativas', value: '23', change: '+12%', trend: 'up' },
  { label: 'Veículos em Rota', value: '18', change: '+8%', trend: 'up' },
  { label: 'Entregas Hoje', value: '12', change: '-3%', trend: 'down' },
  { label: 'Faturamento Mês', value: 'R$ 85,4k', change: '+15%', trend: 'up' },
]

const getStatusColor = (status: string) => {
  const colors = {
    em_transito: 'bg-blue-100 text-blue-800',
    aguardando_coleta: 'bg-yellow-100 text-yellow-800',
    concluida: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    em_transito: 'Em Trânsito',
    aguardando_coleta: 'Aguardando Coleta',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  }
  return labels[status as keyof typeof labels] || status
}

export default function DashboardHome() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <div className="p-0 lg:p-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.label}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="mt-2 text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Ordens Ativas</h2>
              <button className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition touch-manipulation">
                + Nova Ordem
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 lg:p-6 hover:bg-gray-50 cursor-pointer transition touch-manipulation"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{order.id}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 font-medium mb-1">{order.vehicle}</p>
                    <p className="text-xs text-gray-500 mb-3">{order.plate}</p>
                    
                    <div className="flex items-start gap-2 text-xs text-gray-600 mb-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="flex-1 break-words">
                        {order.origin} → {order.destination}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{order.driver}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ETA: {order.eta}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-gray-900">{order.distance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">Rastreamento</h2>
          </div>
          <div className="h-64 lg:h-[500px]">
            <MapView orders={mockOrders} apiKey={apiKey} />
          </div>
          
          <div className="p-4 space-y-2 lg:space-y-3 border-t border-gray-200">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-xs lg:text-sm text-gray-600">Em Trânsito (18)</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
              <span className="text-xs lg:text-sm text-gray-600">Aguardando (5)</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-xs lg:text-sm text-gray-600">Concluídas Hoje (12)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
