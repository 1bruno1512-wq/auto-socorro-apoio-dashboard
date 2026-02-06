export interface Order {
  id: string
  numero_ordem: string
  cliente_id?: string
  veiculo_cliente_marca: string
  veiculo_cliente_modelo: string
  veiculo_cliente_placa: string
  veiculo_cliente_ano: number
  origem_endereco: string
  origem_lat?: number
  origem_lng?: number
  destino_endereco: string
  destino_lat?: number
  destino_lng?: number
  distancia_km?: number
  valor_servico?: number
  status: 'aguardando' | 'em_andamento' | 'concluido' | 'cancelado'
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface CreateOrderInput {
  veiculo_cliente_marca: string
  veiculo_cliente_modelo: string
  veiculo_cliente_placa: string
  veiculo_cliente_ano: number
  origem_endereco: string
  destino_endereco: string
  observacoes?: string
}

export interface UpdateOrderInput {
  veiculo_cliente_marca?: string
  veiculo_cliente_modelo?: string
  veiculo_cliente_placa?: string
  veiculo_cliente_ano?: number
  origem_endereco?: string
  destino_endereco?: string
  status?: 'aguardando' | 'em_andamento' | 'concluido' | 'cancelado'
  observacoes?: string
}

export type OrderStatus = Order['status']
