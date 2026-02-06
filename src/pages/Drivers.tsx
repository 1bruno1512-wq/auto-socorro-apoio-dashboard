import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import DriverModal from '../components/drivers/DriverModal'
import TripHistoryModal from '../components/drivers/TripHistoryModal'

interface Driver {
  id: string
  nome: string
  telefone: string
  cpf: string
  cnh: string
  status: 'ativo' | 'inativo' | 'em_viagem'
  foto_url?: string
  created_at: string
  updated_at: string
}

const getStatusColor = (status: string) => {
  const colors = {
    ativo: 'bg-green-100 text-green-800',
    inativo: 'bg-gray-100 text-gray-800',
    em_viagem: 'bg-blue-100 text-blue-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    ativo: 'Ativo',
    inativo: 'Inativo',
    em_viagem: 'Em Viagem',
  }
  return labels[status as keyof typeof labels] || status
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [showTripHistory, setShowTripHistory] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('motoristas')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setDrivers(data || [])
    } catch (err) {
      console.error('Error fetching drivers:', err)
      setError('Erro ao carregar motoristas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDriver = () => {
    setSelectedDriver(null)
    setShowModal(true)
  }

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver)
    setShowModal(true)
  }

  const handleViewHistory = (driverId: string) => {
    setSelectedDriverId(driverId)
    setShowTripHistory(true)
  }

  const handleDeactivateDriver = async (driver: Driver) => {
    if (!confirm(`Deseja realmente desativar o motorista ${driver.nome}?`)) {
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('motoristas')
        .update({ status: 'inativo' })
        .eq('id', driver.id)

      if (updateError) throw updateError

      await fetchDrivers()
    } catch (err) {
      console.error('Error deactivating driver:', err)
      alert('Erro ao desativar motorista. Tente novamente.')
    }
  }

  const handleModalSuccess = () => {
    setShowModal(false)
    fetchDrivers()
  }

  const filteredDrivers = drivers.filter((driver) =>
    driver.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.cpf.includes(searchTerm) ||
    driver.telefone.includes(searchTerm)
  )

  const stats = {
    total: drivers.length,
    ativos: drivers.filter(d => d.status === 'ativo').length,
    emViagem: drivers.filter(d => d.status === 'em_viagem').length,
    inativos: drivers.filter(d => d.status === 'inativo').length,
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Motoristas</h1>
        <p className="text-gray-600">Gerencie os motoristas da sua frota</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Ativos</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{stats.ativos}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Em Viagem</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.emViagem}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Inativos</p>
          <p className="mt-1 text-2xl font-bold text-gray-600">{stats.inativos}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleCreateDriver}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Motorista
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">Carregando motoristas...</p>
          </div>
        </div>
      ) : filteredDrivers.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Nenhum motorista encontrado' : 'Nenhum motorista cadastrado'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchTerm
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seu primeiro motorista'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateDriver}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Adicionar Motorista
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Drivers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      {driver.foto_url ? (
                        <img src={driver.foto_url} alt={driver.nome} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold text-blue-600">
                          {driver.nome.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{driver.nome}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(driver.status)}`}>
                        {getStatusLabel(driver.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{driver.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    <span>CPF: {driver.cpf}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>CNH: {driver.cnh}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewHistory(driver.id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Histórico
                  </button>
                  <button
                    onClick={() => handleEditDriver(driver)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    Editar
                  </button>
                  {driver.status !== 'inativo' && (
                    <button
                      onClick={() => handleDeactivateDriver(driver)}
                      className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
                      title="Desativar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <DriverModal
          driver={selectedDriver}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showTripHistory && selectedDriverId && (
        <TripHistoryModal
          driverId={selectedDriverId}
          onClose={() => setShowTripHistory(false)}
        />
      )}
    </div>
  )
}
