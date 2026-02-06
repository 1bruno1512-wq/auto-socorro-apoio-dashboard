// Mock data
const mockOrders = [
  {
    id: 'OS-001',
    vehicle: 'Toyota Corolla 2020',
    plate: 'ABC-1234',
    origin: 'Maringá - PR',
    destination: 'Curitiba - PR',
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
  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Ordens Ativas</h2>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                + Nova Ordem
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{order.id}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 font-medium mb-1">{order.vehicle}</p>
                    <p className="text-xs text-gray-500 mb-3">{order.plate}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{order.origin} → {order.destination}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {order.driver}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ETA: {order.eta}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{order.distance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rastreamento</h2>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-sm text-gray-500">Mapa será integrado</p>
              <p className="text-xs text-gray-400 mt-1">Google Maps / Leaflet</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Em Trânsito (18)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Aguardando (5)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Concluídas Hoje (12)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
