import { useState, useEffect, useCallback } from 'react'
import {
  listOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
} from '../services/ordersService'
import type { Order, CreateOrderInput, UpdateOrderInput, OrderStatus } from '../types/order'

interface UseOrdersReturn {
  orders: Order[]
  loading: boolean
  error: string | null
  stats: {
    total: number
    aguardando: number
    em_andamento: number
    concluido_hoje: number
    valor_total_mes: number
  } | null
  filters: {
    status?: OrderStatus
    search?: string
  }
  setFilters: (filters: { status?: OrderStatus; search?: string }) => void
  createNewOrder: (input: CreateOrderInput) => Promise<boolean>
  updateExistingOrder: (id: string, input: UpdateOrderInput) => Promise<boolean>
  deleteExistingOrder: (id: string) => Promise<boolean>
  refreshOrders: () => Promise<void>
}

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<UseOrdersReturn['stats']>(null)
  const [filters, setFilters] = useState<{ status?: OrderStatus; search?: string }>({})

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await listOrders(filters)

      if (fetchError) {
        setError('Erro ao carregar ordens de serviço')
        setOrders([])
        return
      }

      setOrders(data || [])
    } catch (err) {
      setError('Erro inesperado ao carregar ordens')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchStats = useCallback(async () => {
    const { data } = await getOrderStats()
    if (data) {
      setStats(data)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [fetchOrders, fetchStats])

  const createNewOrder = async (input: CreateOrderInput): Promise<boolean> => {
    setError(null)

    try {
      const { data, error: createError } = await createOrder(input)

      if (createError || !data) {
        setError('Erro ao criar ordem de serviço')
        return false
      }

      // Adiciona nova ordem ao topo da lista
      setOrders((prev) => [data, ...prev])
      await fetchStats()
      return true
    } catch (err) {
      setError('Erro inesperado ao criar ordem')
      return false
    }
  }

  const updateExistingOrder = async (
    id: string,
    input: UpdateOrderInput
  ): Promise<boolean> => {
    setError(null)

    try {
      const { data, error: updateError } = await updateOrder(id, input)

      if (updateError || !data) {
        setError('Erro ao atualizar ordem de serviço')
        return false
      }

      // Atualiza ordem na lista
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? data : order))
      )
      await fetchStats()
      return true
    } catch (err) {
      setError('Erro inesperado ao atualizar ordem')
      return false
    }
  }

  const deleteExistingOrder = async (id: string): Promise<boolean> => {
    setError(null)

    try {
      const { error: deleteError } = await deleteOrder(id)

      if (deleteError) {
        setError('Erro ao cancelar ordem de serviço')
        return false
      }

      // Remove ordem da lista ou atualiza status
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: 'cancelado' as OrderStatus } : order
        )
      )
      await fetchStats()
      return true
    } catch (err) {
      setError('Erro inesperado ao cancelar ordem')
      return false
    }
  }

  const refreshOrders = async () => {
    await fetchOrders()
    await fetchStats()
  }

  return {
    orders,
    loading,
    error,
    stats,
    filters,
    setFilters,
    createNewOrder,
    updateExistingOrder,
    deleteExistingOrder,
    refreshOrders,
  }
}
