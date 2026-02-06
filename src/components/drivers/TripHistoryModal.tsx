import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Trip {
  id: string
  origem: string
  destino: string
  status: string
  data_inicio: string
  data_fim?: string
  distancia_km?: number
  valor?: number
}

interface TripHistoryModalProps {
  driverId: string
  onClose: () => void
}

const getStatusColor = (status: string) => {
  const colors = {
    concluida: 'bg-green-100 text-green-800',
    em_andamento: 'bg-blue-100 text-blue-800',
    cancelada: 'bg-red-100 text-red-800',
    aguardando: 'bg-yellow-100 text-yellow-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    concluida: 'Concluída',
    em_andamento: 'Em Andamento',
    cancelada: 'Cancelada',
    aguardando: 'Aguardando',
  }
  return labels[status as keyof typeof labels] || status
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function TripHistoryModal({ driverId, onClose }: TripHistoryModalProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [driverName, setDriverName] = useState<string>('')

  useEffect(() => {
    fetchTrips()
    fetchDriverName()
  }, [driverId])

  const fetchDriverName = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('motoristas')
        .select('nome')
        .eq('id', driverId)
        .single()

      if (fetchError) throw fetchError
      setDriverName(data.nome)
    } catch (err) {
      console.error('Error fetching driver name:', err)
    }
  }

  const fetchTrips = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('viagens')
        .select('*')
        .eq('motorista_id', driverId)
        .order('data_inicio', { ascending: false })

      if (fetchError) throw fetchError

      setTrips(data || [])
    } catch (err) {
      console.error('Error fetching trips:', err)
      setError('Erro ao carregar histórico de viagens.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const stats = {
    total: trips.length,
    concluidas: trips.filter(t => t.status === 'concluida').length,
    emAndamento: trips.filter(t => t.status === 'em_andamento').length,
    totalKm: trips.reduce((sum, t) => sum + (t.distancia_km || 0), 0),
    totalValor: trips.reduce((sum, t) => sum + (t.valor || 0), 0),
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Viagens</h2>
            {driverName && (
              <p className="text-sm text-gray-600 mt-1">Motorista: {driverName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        {!loading && trips.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Concluídas</p>
              <p className="text-lg font-semibold text-green-600">{stats.concluidas}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Em Andamento</p>
              <p className="text-lg font-semibold text-blue-600">{stats.emAndamento}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total KM</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalKm.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Faturamento</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalValor)}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">Carregando histórico...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          ) : trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma viagem encontrada</h3>
              <p className="text-sm text-gray-600">Este motorista ainda não realizou viagens.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {getStatusLabel(trip.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(trip.data_inicio)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="font-medium">{trip.origem}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="font-medium">{trip.destino}</span>
                      </div>
                    </div>

                    {trip.valor && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(trip.valor)}</p>
                        {trip.distancia_km && (
                          <p className="text-xs text-gray-500">{trip.distancia_km.toFixed(0)} km</p>
                        )}
                      </div>
                    )}
                  </div>

                  {trip.data_fim && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Concluída em {formatDate(trip.data_fim)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
