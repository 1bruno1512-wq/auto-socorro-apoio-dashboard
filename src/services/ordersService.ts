import { supabase } from '../lib/supabase'
import type { Order, CreateOrderInput, UpdateOrderInput, OrderStatus } from '../types/order'

/**
 * Gera número único de ordem no formato OS-YYYYMMDD-XXX
 */
const generateOrderNumber = async (): Promise<string> => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const prefix = `OS-${today}`
  
  // Busca última ordem do dia
  const { data, error } = await supabase
    .from('ordens_servico')
    .select('numero_ordem')
    .like('numero_ordem', `${prefix}%`)
    .order('numero_ordem', { ascending: false })
    .limit(1)
  
  if (error) {
    console.error('Error generating order number:', error)
    return `${prefix}-001`
  }
  
  if (!data || data.length === 0) {
    return `${prefix}-001`
  }
  
  // Incrementa sequencial
  const lastNumber = parseInt(data[0].numero_ordem.split('-')[2])
  const nextNumber = (lastNumber + 1).toString().padStart(3, '0')
  return `${prefix}-${nextNumber}`
}

/**
 * Lista todas as ordens de serviço
 */
export const listOrders = async (filters?: {
  status?: OrderStatus
  search?: string
}): Promise<{ data: Order[] | null; error: any }> => {
  try {
    let query = supabase
      .from('ordens_servico')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Filtro por status
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    // Busca por placa ou número da ordem
    if (filters?.search) {
      query = query.or(
        `veiculo_cliente_placa.ilike.%${filters.search}%,numero_ordem.ilike.%${filters.search}%`
      )
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error listing orders:', error)
    return { data: null, error }
  }
}

/**
 * Busca ordem por ID
 */
export const getOrderById = async (id: string): Promise<{ data: Order | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { data: null, error }
  }
}

/**
 * Cria nova ordem de serviço
 */
export const createOrder = async (
  input: CreateOrderInput
): Promise<{ data: Order | null; error: any }> => {
  try {
    const numero_ordem = await generateOrderNumber()
    
    const { data, error } = await supabase
      .from('ordens_servico')
      .insert({
        numero_ordem,
        ...input,
        status: 'aguardando',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error creating order:', error)
    return { data: null, error }
  }
}

/**
 * Atualiza ordem existente
 */
export const updateOrder = async (
  id: string,
  input: UpdateOrderInput
): Promise<{ data: Order | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('ordens_servico')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating order:', error)
    return { data: null, error }
  }
}

/**
 * Deleta ordem (soft delete - marca como cancelado)
 */
export const deleteOrder = async (id: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('ordens_servico')
      .update({
        status: 'cancelado',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    console.error('Error deleting order:', error)
    return { error }
  }
}

/**
 * Deleta ordem permanentemente (hard delete)
 */
export const hardDeleteOrder = async (id: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('ordens_servico')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    console.error('Error hard deleting order:', error)
    return { error }
  }
}

/**
 * Obtém estatísticas do dashboard
 */
export const getOrderStats = async (): Promise<{
  data: {
    total: number
    aguardando: number
    em_andamento: number
    concluido_hoje: number
    valor_total_mes: number
  } | null
  error: any
}> => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    
    // Total de ordens ativas
    const { count: total } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'cancelado')
    
    // Aguardando
    const { count: aguardando } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aguardando')
    
    // Em andamento
    const { count: em_andamento } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'em_andamento')
    
    // Concluídas hoje
    const { count: concluido_hoje } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluido')
      .gte('updated_at', startOfDay)
    
    // Valor total do mês
    const { data: ordersMonth } = await supabase
      .from('ordens_servico')
      .select('valor_servico')
      .gte('created_at', startOfMonth)
    
    const valor_total_mes = ordersMonth?.reduce((sum, order) => sum + (order.valor_servico || 0), 0) || 0
    
    return {
      data: {
        total: total || 0,
        aguardando: aguardando || 0,
        em_andamento: em_andamento || 0,
        concluido_hoje: concluido_hoje || 0,
        valor_total_mes,
      },
      error: null,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { data: null, error }
  }
}
