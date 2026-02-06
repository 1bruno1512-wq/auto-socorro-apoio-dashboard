import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  ordensAtivas: number
  veiculosEmRota: number
  entregasHoje: number
  faturamentoMes: number
}

interface OrdemAtiva {
  id: string
  numero_ordem: string
  veiculo_cliente_marca: string
  veiculo_cliente_modelo: string
  veiculo_cliente_placa: string
  origem_endereco: string
  destino_endereco: string
  distancia_km: number
  valor_servico: number
  status: string
  created_at: string
  motorista_nome?: string
}

const getStatusColor = (status: string) => {
  const colors = {
    aguardando: 'bg-yellow-100 text-yellow-800',
    em_andamento: 'bg-blue-100 text-blue-800',
    concluido: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    aguardando: 'Aguardando',
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  }
  return labels[status as keyof typeof labels] || status
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    ordensAtivas: 0,
    veiculosEmRota: 0,
    entregasHoje: 0,
    faturamentoMes: 0,
  })
  const [ordens, setOrdens] = useState<OrdemAtiva[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      
      // 1. Ordens Ativas (aguardando ou em_andamento)
      const { count: ordensAtivasCount, error: ordensError } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .in('status', ['aguardando', 'em_andamento'])

      if (ordensError) throw ordensError

      // 2. Veículos em Rota
      const { count: veiculosEmRotaCount, error: veiculosError } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'em_uso')

      if (veiculosError) throw veiculosError

      // 3. Entregas Hoje (concluídas hoje)
      const hoje = new Date().toISOString().split('T')[0]
      const { count: entregasHojeCount, error: entregasError } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'concluido')
        .gte('concluido_at', `${hoje}T00:00:00`)
        .lte('concluido_at', `${hoje}T23:59:59`)

      if (entregasError) throw entregasError

      // 4. Faturamento do Mês (soma dos valores de serviço do mês atual)
      const primeiroDiaMes = new Date()
      primeiroDiaMes.setDate(1)
      primeiroDiaMes.setHours(0, 0, 0, 0)
      
      const { data: faturamentoData, error: faturamentoError } = await supabase
        .from('ordens_servico')
        .select('valor_servico')
        .gte('created_at', primeiroDiaMes.toISOString())

      if (faturamentoError) throw faturamentoError

      const faturamentoTotal = faturamentoData?.reduce(
        (sum, ordem) => sum + (ordem.valor_servico || 0), 
        0
      ) || 0

      // 5. Lista de Ordens Ativas (com JOIN para motorista se houver viagem)
      const { data: ordensData, error: ordensListError } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          viagens (
            motorista_id,
            motoristas (
              nome
            )
          )
        `)
        .in('status', ['aguardando', 'em_andamento'])
        .order('created_at', { ascending: false })
        .limit(10)

      if (ordensListError) throw ordensListError

      // Mapear os dados para o formato esperado
      const ordensFormatadas: OrdemAtiva[] = (ordensData || []).map((ordem: any) => ({
        id: ordem.id,
        numero_ordem: ordem.numero_ordem,
        veiculo_cliente_marca: ordem.veiculo_cliente_marca,
        veiculo_cliente_modelo: ordem.veiculo_cliente_modelo,
        veiculo_cliente_placa: ordem.veiculo_cliente_placa,
        origem_endereco: ordem.origem_endereco,
        destino_endereco: ordem.destino_endereco,
        distancia_km: ordem.distancia_km,
        valor_servico: ordem.valor_servico,
        status: ordem.status,
        created_at: ordem.created_at,
        motorista_nome: ordem.viagens?.[0]?.motoristas?.nome || null,
      }))

      setStats({
        ordensAtivas: ordensAtivasCount || 0,
        veiculosEmRota: veiculosEmRotaCount || 0,
        entregasHoje: entregasHojeCount || 0,
        faturamentoMes: faturamentoTotal,
      })

      setOrdens(ordensFormatadas)
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err)
      setError(err.message || 'Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Auto-refresh a cada 60 segundos
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-6">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Erro ao carregar dashboard</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button
                onClick={() => {
                  setLoading(true)
                  fetchDashboardData()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statsCards = [
    { 
      label: 'Ordens Ativas', 
      value: stats.ordensAtivas.toString(),
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      label: 'Veículos em Rota', 
      value: stats.veiculosEmRota.toString(),
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      label: 'Entregas Hoje', 
      value: stats.entregasHoje.toString(),
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      label: 'Faturamento Mês', 
      value: `R$ ${(stats.faturamentoMes / 1000).toFixed(1)}k`,
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ]

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                {stat.icon}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Ordens Ativas</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {ordens.length} {ordens.length === 1 ? 'ordem ativa' : 'ordens ativas'}
                </p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                + Nova Ordem
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {ordens.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-medium">Nenhuma ordem ativa</p>
                <p className="text-sm text-gray-500 mt-1">Crie uma nova ordem para começar</p>
              </div>
            ) : (
              ordens.map((ordem) => (
                <div
                  key={ordem.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {ordem.numero_ordem}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ordem.status)}`}>
                          {getStatusLabel(ordem.status)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-900 font-medium mb-1">
                        {ordem.veiculo_cliente_marca} {ordem.veiculo_cliente_modelo}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">{ordem.veiculo_cliente_placa}</p>
                      
                      <div className="flex items-start gap-2 text-xs text-gray-600 mb-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="flex-1">
                          {ordem.origem_endereco} → {ordem.destino_endereco}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2">
                        {ordem.motorista_nome && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {ordem.motorista_nome}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          {ordem.distancia_km} km
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          R$ {ordem.valor_servico.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {ordens.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Ver todas as ordens →
              </button>
            </div>
          )}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Em Andamento</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {ordens.filter(o => o.status === 'em_andamento').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Aguardando</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {ordens.filter(o => o.status === 'aguardando').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Entregas Hoje</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.entregasHoje}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setLoading(true)
                fetchDashboardData()
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
