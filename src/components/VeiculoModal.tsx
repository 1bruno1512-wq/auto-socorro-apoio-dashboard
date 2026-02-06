import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
}

interface VeiculoModalProps {
  veiculo: Veiculo | null
  onClose: (saved: boolean) => void
}

export default function VeiculoModal({ veiculo, onClose }: VeiculoModalProps) {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    placa: '',
    ano: new Date().getFullYear(),
    tipo: 'guincho',
    capacidade_toneladas: 0,
    foto_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (veiculo) {
      setFormData({
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        placa: veiculo.placa,
        ano: veiculo.ano,
        tipo: veiculo.tipo,
        capacidade_toneladas: veiculo.capacidade_toneladas,
        foto_url: veiculo.foto_url || '',
      })
    }
  }, [veiculo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ano' || name === 'capacidade_toneladas' ? Number(value) : value
    }))
  }

  const formatPlaca = (value: string) => {
    // Remove tudo que não for letra ou número
    let placa = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    
    // Limita a 7 caracteres
    placa = placa.slice(0, 7)
    
    // Formata como ABC-1234 ou ABC1D23 (Mercosul)
    if (placa.length > 3) {
      placa = placa.slice(0, 3) + '-' + placa.slice(3)
    }
    
    return placa
  }

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlaca(e.target.value)
    setFormData(prev => ({ ...prev, placa: formatted }))
  }

  const validateForm = () => {
    if (!formData.marca.trim()) {
      setError('Marca é obrigatória')
      return false
    }
    if (!formData.modelo.trim()) {
      setError('Modelo é obrigatório')
      return false
    }
    if (!formData.placa.trim() || formData.placa.length < 7) {
      setError('Placa inválida (formato: ABC-1234)')
      return false
    }
    if (formData.ano < 1900 || formData.ano > new Date().getFullYear() + 1) {
      setError('Ano inválido')
      return false
    }
    if (formData.capacidade_toneladas <= 0) {
      setError('Capacidade deve ser maior que zero')
      return false
    }
    return true
  }

  const checkPlacaUnica = async (placa: string) => {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('id')
        .eq('placa', placa)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      // Se está editando, ignora o próprio veículo
      if (data && veiculo && data.id === veiculo.id) {
        return true
      }
      
      return !data
    } catch (err) {
      console.error('Erro ao verificar placa:', err)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    // Verifica se placa é única (somente ao criar ou se mudou a placa)
    if (!veiculo || veiculo.placa !== formData.placa) {
      const placaUnica = await checkPlacaUnica(formData.placa)
      if (!placaUnica) {
        setError('Esta placa já está cadastrada')
        return
      }
    }

    setLoading(true)

    try {
      if (veiculo) {
        // Editar veículo existente
        const { error } = await supabase
          .from('veiculos')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', veiculo.id)

        if (error) throw error
      } else {
        // Criar novo veículo
        const { error } = await supabase
          .from('veiculos')
          .insert([{
            ...formData,
            status: 'disponivel',
          }])

        if (error) throw error
      }

      onClose(true)
    } catch (err: any) {
      console.error('Erro ao salvar veículo:', err)
      setError(err.message || 'Erro ao salvar veículo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={() => !loading && onClose(false)}
        ></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {veiculo ? 'Editar Veículo' : 'Novo Veículo'}
              </h3>
              <button
                onClick={() => !loading && onClose(false)}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Marca */}
                <div>
                  <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-1">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="marca"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Ex: Volkswagen, Ford, Iveco"
                  />
                </div>

                {/* Modelo */}
                <div>
                  <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Ex: Constellation, Cargo"
                  />
                </div>

                {/* Placa */}
                <div>
                  <label htmlFor="placa" className="block text-sm font-medium text-gray-700 mb-1">
                    Placa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="placa"
                    name="placa"
                    value={formData.placa}
                    onChange={handlePlacaChange}
                    required
                    disabled={loading}
                    maxLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
                    placeholder="ABC-1234"
                  />
                </div>

                {/* Ano */}
                <div>
                  <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">
                    Ano <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="ano"
                    name="ano"
                    value={formData.ano}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="guincho">Guincho</option>
                    <option value="reboque">Reboque</option>
                    <option value="plataforma">Plataforma</option>
                  </select>
                </div>

                {/* Capacidade */}
                <div>
                  <label htmlFor="capacidade_toneladas" className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidade (toneladas) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacidade_toneladas"
                    name="capacidade_toneladas"
                    value={formData.capacidade_toneladas}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    min="0.1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Ex: 5.5"
                  />
                </div>

                {/* URL da Foto */}
                <div className="md:col-span-2">
                  <label htmlFor="foto_url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Foto (opcional)
                  </label>
                  <input
                    type="url"
                    id="foto_url"
                    name="foto_url"
                    value={formData.foto_url}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onClose(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {veiculo ? 'Salvar Alterações' : 'Adicionar Veículo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
