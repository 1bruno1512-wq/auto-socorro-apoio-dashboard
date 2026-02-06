import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Driver {
  id: string
  nome: string
  telefone: string
  cpf: string
  cnh: string
  status: 'ativo' | 'inativo' | 'em_viagem'
  foto_url?: string
}

interface DriverModalProps {
  driver: Driver | null
  onClose: () => void
  onSuccess: () => void
}

export default function DriverModal({ driver, onClose, onSuccess }: DriverModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cpf: '',
    cnh: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (driver) {
      setFormData({
        nome: driver.nome,
        telefone: driver.telefone,
        cpf: driver.cpf,
        cnh: driver.cnh,
      })
    }
  }, [driver])

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value.slice(0, 14)
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return value.slice(0, 15)
  }

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '')
    
    if (numbers.length !== 11) return false
    
    // Check for repeated digits
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    // Validate check digits
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i)
    }
    let digit = 11 - (sum % 11)
    if (digit >= 10) digit = 0
    if (digit !== parseInt(numbers.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i)
    }
    digit = 11 - (sum % 11)
    if (digit >= 10) digit = 0
    if (digit !== parseInt(numbers.charAt(10))) return false
    
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'cpf') {
      setFormData({ ...formData, [name]: formatCPF(value) })
    } else if (name === 'telefone') {
      setFormData({ ...formData, [name]: formatPhone(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validations
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório')
      return
    }

    if (!formData.telefone.trim()) {
      setError('Telefone é obrigatório')
      return
    }

    if (!formData.cpf.trim()) {
      setError('CPF é obrigatório')
      return
    }

    if (!validateCPF(formData.cpf)) {
      setError('CPF inválido')
      return
    }

    if (!formData.cnh.trim()) {
      setError('CNH é obrigatória')
      return
    }

    try {
      setLoading(true)

      if (driver) {
        // Update existing driver
        const { error: updateError } = await supabase
          .from('motoristas')
          .update({
            nome: formData.nome.trim(),
            telefone: formData.telefone,
            cpf: formData.cpf,
            cnh: formData.cnh.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', driver.id)

        if (updateError) {
          if (updateError.code === '23505') {
            throw new Error('CPF já cadastrado para outro motorista')
          }
          throw updateError
        }
      } else {
        // Create new driver
        const { error: insertError } = await supabase
          .from('motoristas')
          .insert([
            {
              nome: formData.nome.trim(),
              telefone: formData.telefone,
              cpf: formData.cpf,
              cnh: formData.cnh.trim(),
              status: 'ativo',
            },
          ])

        if (insertError) {
          if (insertError.code === '23505') {
            throw new Error('CPF já cadastrado')
          }
          throw insertError
        }
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving driver:', err)
      setError(err.message || 'Erro ao salvar motorista. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {driver ? 'Editar Motorista' : 'Novo Motorista'}
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
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
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

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="João Silva"
                required
              />
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(44) 99999-9999"
                required
              />
            </div>

            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                CPF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000.000.000-00"
                required
              />
            </div>

            {/* CNH */}
            <div>
              <label htmlFor="cnh" className="block text-sm font-medium text-gray-700 mb-1">
                CNH <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cnh"
                name="cnh"
                value={formData.cnh}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="00000000000"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                driver ? 'Salvar Alterações' : 'Adicionar Motorista'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
