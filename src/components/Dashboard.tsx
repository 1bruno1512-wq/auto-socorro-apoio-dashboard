import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrders } from '../hooks/useOrders'
import OrderModal from './OrderModal'
import ConfirmDialog from './ConfirmDialog'
import type { Order, OrderStatus } from '../types/order'

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const {
    orders,
    loading,
    error,
    stats,
    filters,
    setFilters,
    createNewOrder,
    updateExistingOrder,
    deleteExistingOrder,
  } = useOrders()

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [searchInput, setSearchInput] = useState('')

  const handleLogout = async () => {
    await signOut()
  }

  const getUserInitials = () => {
    if (!user?.email) return 'AS'
    return user.email.substring(0, 2).toUpperCase()
  }

  const getUserEmail = () => {
    return user?.email || 'admin@apoio.com.br'
  }

  const handleCreateOrder = () => {
    setSelectedOrder(null)
    setIsOrderModalOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderModalOpen(true)
  }

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order)
  }

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      await deleteExistingOrder(orderToDelete.id)
      setOrderToDelete(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchInput })
  }

  const handleStatusFilter = (status?: OrderStatus) => {
    setFilters({ ...filters, status })
  }

  const handleOrderSubmit = async (data: any) => {
    if (selectedOrder) {
      return await updateExistingOrder(selectedOrder.id, data)
    } else {
      return await createNewOrder(data)
    }
  }

  const displayedOrders = filters.status
    ? orders.filter((o) => o.status === filters.status)
    : orders

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Auto Socorro</h1>
          <p className="text-sm text-gray-500 mt-1">Apoio Transportes</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Ordens de Serviço
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            Rastreamento
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Motoristas
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Financeiro
          </a>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">Usuário</p>
                <p className="text-xs text-gray-500 truncate">{getUserEmail()}</p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-lg">
              <form onSubmit={handleSearch} className="relative">
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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar por placa ou número da ordem..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>

            <div className="flex items-center gap-4 ml-6">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Ordens Ativas</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.total || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Aguardando</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.aguardando || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.em_andamento || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Concluídas Hoje</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.concluido_hoje || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Ordens de Serviço</h2>
                  <button
                    onClick={handleCreateOrder}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    + Nova Ordem
                  </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleStatusFilter(undefined)}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      !filters.status
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => handleStatusFilter('aguardando')}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      filters.status === 'aguardando'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Aguardando
                  </button>
                  <button
                    onClick={() => handleStatusFilter('em_andamento')}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      filters.status === 'em_andamento'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Em Andamento
                  </button>
                  <button
                    onClick={() => handleStatusFilter('concluido')}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      filters.status === 'concluido'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Concluído
                  </button>
                  <button
                    onClick={() => handleStatusFilter('cancelado')}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      filters.status === 'cancelado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Cancelado
                  </button>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="p-12 text-center">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Carregando ordens...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && displayedOrders.length === 0 && (
                <div className="p-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    {filters.status || filters.search
                      ? 'Nenhuma ordem encontrada'
                      : 'Nenhuma ordem cadastrada'}
                  </p>
                  {!filters.status && !filters.search && (
                    <button
                      onClick={handleCreateOrder}
                      className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Criar primeira ordem
                    </button>
                  )}
                </div>
              )}

              {/* Orders */}
              <div className="divide-y divide-gray-200">
                {displayedOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {order.numero_ordem}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-900 font-medium mb-1">
                          {order.veiculo_cliente_marca} {order.veiculo_cliente_modelo}{' '}
                          {order.veiculo_cliente_ano}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          {order.veiculo_cliente_placa}
                        </p>

                        <div className="flex items-start gap-2 text-xs text-gray-600 mb-2">
                          <svg
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          <div>
                            <div>{order.origem_endereco}</div>
                            <div className="mt-1">→ {order.destino_endereco}</div>
                          </div>
                        </div>

                        {order.observacoes && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            {order.observacoes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(order)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Cancelar"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Aguardando</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats?.aguardando || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats?.total
                            ? ((stats.aguardando || 0) / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Em Andamento</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats?.em_andamento || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats?.total
                            ? ((stats.em_andamento || 0) / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Concluídas Hoje</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats?.concluido_hoje || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats?.total
                            ? ((stats.concluido_hoje || 0) / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Faturamento do Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats?.valor_total_mes || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSubmit={handleOrderSubmit}
        order={selectedOrder}
        mode={selectedOrder ? 'edit' : 'create'}
      />

      <ConfirmDialog
        isOpen={!!orderToDelete}
        title="Cancelar Ordem de Serviço"
        message={`Deseja realmente cancelar a ordem ${orderToDelete?.numero_ordem}? Esta ação marcará a ordem como cancelada.`}
        confirmText="Sim, cancelar"
        cancelText="Não"
        onConfirm={handleConfirmDelete}
        onCancel={() => setOrderToDelete(null)}
        variant="danger"
      />
    </div>
  )
}
