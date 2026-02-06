import { useState, useEffect } from 'react'
import type { Order, CreateOrderInput, UpdateOrderInput } from '../types/order'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateOrderInput | UpdateOrderInput) => Promise<boolean>
  order?: Order | null
  mode: 'create' | 'edit'
}

export default function OrderModal({
  isOpen,
  onClose,
  onSubmit,
  order,
  mode,
}: OrderModalProps) {
  const [formData, setFormData] = useState<CreateOrderInput>({
    veiculo_cliente_marca: '',
    veiculo_cliente_modelo: '',
    veiculo_cliente_placa: '',
    veiculo_cliente_ano: new Date().getFullYear(),
    origem_endereco: '',
    destino_endereco: '',
    observacoes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (mode === 'edit' && order) {
      setFormData({
        veiculo_cliente_marca: order.veiculo_cliente_marca,
        veiculo_cliente_modelo: order.veiculo_cliente_modelo,
        veiculo_cliente_placa: order.veiculo_cliente_placa,
        veiculo_cliente_ano: order.veiculo_cliente_ano,
        origem_endereco: order.origem_endereco,
        destino_endereco: order.destino_endereco,
        observacoes: order.observacoes || '',
      })
    } else {
      setFormData({
        veiculo_cliente_marca: '',
        veiculo_cliente_modelo: '',
        veiculo_cliente_placa: '',
        veiculo_cliente_ano: new Date().getFullYear(),
        origem_endereco: '',
        destino_endereco: '',
        observacoes: '',
      })
    }
    setErrors({})
  }, [mode, order, isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.veiculo_cliente_marca.trim()) {
      newErrors.veiculo_cliente_marca = 'Marca é obrigatória'
    }
    if (!formData.veiculo_cliente_modelo.trim()) {
      newErrors.veiculo_cliente_modelo = 'Modelo é obrigatório'
    }
    if (!formData.veiculo_cliente_placa.trim()) {
      newErrors.veiculo_cliente_placa = 'Placa é obrigatória'
    } else if (!/^[A-Z]{3}-?\d{4}$|^[A-Z]{3}-?\d[A-Z]\d{2}$/.test(formData.veiculo_cliente_placa.toUpperCase())) {
      newErrors.veiculo_cliente_placa = 'Placa inválida (ABC-1234 ou ABC1D23)'
    }
    if (!formData.veiculo_cliente_ano || formData.veiculo_cliente_ano < 1900 || formData.veiculo_cliente_ano > new Date().getFullYear() + 1) {
      newErrors.veiculo_cliente_ano = 'Ano inválido'
    }
    if (!formData.origem_endereco.trim()) {
      newErrors.origem_endereco = 'Endereço de origem é obrigatório'
    }
    if (!formData.destino_endereco.trim()) {
      newErrors.destino_endereco = 'Endereço de destino é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Normaliza placa
      const normalizedData = {
        ...formData,
        veiculo_cliente_placa: formData.veiculo_cliente_placa.toUpperCase().replace('-', ''),
      }

      const success = await onSubmit(normalizedData)

      if (success) {
        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpa erro do campo ao editar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Nova Ordem de Serviço' : 'Editar Ordem de Serviço'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Veículo */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Dados do Veículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca *
                    </label>
                    <input
                      type="text"
                      name="veiculo_cliente_marca"
                      value={formData.veiculo_cliente_marca}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.veiculo_cliente_marca ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Toyota"
                    />
                    {errors.veiculo_cliente_marca && (
                      <p className="mt-1 text-xs text-red-600">{errors.veiculo_cliente_marca}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      name="veiculo_cliente_modelo"
                      value={formData.veiculo_cliente_modelo}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.veiculo_cliente_modelo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Corolla"
                    />
                    {errors.veiculo_cliente_modelo && (
                      <p className="mt-1 text-xs text-red-600">{errors.veiculo_cliente_modelo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placa *
                    </label>
                    <input
                      type="text"
                      name="veiculo_cliente_placa"
                      value={formData.veiculo_cliente_placa}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.veiculo_cliente_placa ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="ABC-1234"
                      maxLength={8}
                    />
                    {errors.veiculo_cliente_placa && (
                      <p className="mt-1 text-xs text-red-600">{errors.veiculo_cliente_placa}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano *
                    </label>
                    <input
                      type="number"
                      name="veiculo_cliente_ano"
                      value={formData.veiculo_cliente_ano}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.veiculo_cliente_ano ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="2024"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                    {errors.veiculo_cliente_ano && (
                      <p className="mt-1 text-xs text-red-600">{errors.veiculo_cliente_ano}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Origem e Destino */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Trajeto</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço de Origem *
                    </label>
                    <input
                      type="text"
                      name="origem_endereco"
                      value={formData.origem_endereco}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.origem_endereco ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Rua, Número, Bairro, Cidade - Estado"
                    />
                    {errors.origem_endereco && (
                      <p className="mt-1 text-xs text-red-600">{errors.origem_endereco}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço de Destino *
                    </label>
                    <input
                      type="text"
                      name="destino_endereco"
                      value={formData.destino_endereco}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.destino_endereco ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Rua, Número, Bairro, Cidade - Estado"
                    />
                    {errors.destino_endereco && (
                      <p className="mt-1 text-xs text-red-600">{errors.destino_endereco}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Informações adicionais sobre a ordem de serviço..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  mode === 'create' ? 'Criar Ordem' : 'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
