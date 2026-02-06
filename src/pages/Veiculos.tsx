import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import VeiculoModal from '../components/VeiculoModal'

interface Veiculo {
  id: string
  marca: string
  modelo: string
  placa: string
  ano: number
  tipo: string
  capacidade_toneladas: number
  status: 'disponivel' | 'em_uso' | 'manutencao'
  foto_url?: string
  created_at: string
  updated_at: string
}

const getStatusColor = (status: string) => {
  const colors = {
    disponivel: 'bg-green-100 text-green-800',
    em_uso: 'bg-blue-100 text-blue-800',
    manutencao: 'bg-orange-100 text-orange-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    disponivel: 'Disponível',
    em_uso: 'Em Uso',
    manutencao: 'Manutenção',
  }
  return labels[status as keyof typeof labels] || status
}

const getTipoLabel = (tipo: string) => {
  const labels = {
    guincho: 'Guincho',
    reboque: 'Reboque',
    plataforma: 'Plataforma',
  }
  return labels[tipo as keyof typeof labels] || tipo
}

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchVeiculos()
  }, [])

  const fetchVeiculos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVeiculos(data || [])
    } catch (err) {
      console.error('Erro ao buscar veículos:', err)
      setError('Erro ao carregar veículos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddVeiculo = () => {
    setSelectedVeiculo(null)
    setIsModalOpen(true)
  }

  const handleEditVeiculo = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo)
    setIsModalOpen(true)
  }

  const handleDeleteVeiculo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return

    try {
      const { error } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await fetchVeiculos()
    } catch (err) {
      console.error('Erro ao excluir veículo:', err)
      alert('Erro ao excluir veículo. Tente novamente.')
    }
  }

  const handleMarcarManutencao = async (veiculo: Veiculo) => {
    const novoStatus = veiculo.status === 'manutencao' ? 'disponivel' : 'manutencao'
    const mensagem = novoStatus === 'manutencao' 
      ? 'Deseja marcar este veículo como em manutenção?' 
      : 'Deseja marcar este veículo como disponível?'

    if (!confirm(mensagem)) return

    try {
      const { error } = await supabase
        .from('veiculos')
        .update({ status: novoStatus, updated_at: new Date().toISOString() })
        .eq('id', veiculo.id)

      if (error) throw error
      
      await fetchVeiculos()
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      alert('Erro ao atualizar status. Tente novamente.')
    }
  }

  const handleModalClose = async (saved: boolean) => {
    setIsModalOpen(false)
    setSelectedVeiculo(null)
    if (saved) {
      await fetchVeiculos()
    }
  }

  const filteredVeiculos = veiculos.filter(veiculo =>
    veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Veículos</h1>
        <p className="text-gray-600">Gerencie a frota de veículos de socorro e transporte</p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por marca, modelo, placa ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={handleAddVeiculo}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Veículo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {veiculos.filter(v => v.status === 'disponivel').length}
              </p>
              <p className="text-sm text-gray-600">Disponíveis</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {veiculos.filter(v => v.status === 'em_uso').length}
              </p>
              <p className="text-sm text-gray-600">Em Uso</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {veiculos.filter(v => v.status === 'manutencao').length}
              </p>
              <p className="text-sm text-gray-600">Em Manutenção</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando veículos...</p>
          </div>
        </div>
      ) : filteredVeiculos.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Tente ajustar os termos de busca' 
              : 'Comece adicionando o primeiro veículo da frota'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddVeiculo}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Adicionar Primeiro Veículo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVeiculos.map((veiculo) => (
            <div
              key={veiculo.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              {/* Veículo Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {veiculo.foto_url ? (
                  <img src={veiculo.foto_url} alt={`${veiculo.marca} ${veiculo.modelo}`} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
              </div>

              {/* Veículo Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {veiculo.marca} {veiculo.modelo}
                    </h3>
                    <p className="text-sm text-gray-600">{veiculo.placa} • {veiculo.ano}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(veiculo.status)}`}>
                    {getStatusLabel(veiculo.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>{getTipoLabel(veiculo.tipo)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <span>{veiculo.capacidade_toneladas}t de capacidade</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditVeiculo(veiculo)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleMarcarManutencao(veiculo)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition ${
                      veiculo.status === 'manutencao'
                        ? 'text-green-700 bg-green-100 hover:bg-green-200'
                        : 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                    }`}
                  >
                    {veiculo.status === 'manutencao' ? 'Disponível' : 'Manutenção'}
                  </button>
                  <button
                    onClick={() => handleDeleteVeiculo(veiculo.id)}
                    className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <VeiculoModal
          veiculo={selectedVeiculo}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
