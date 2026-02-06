import { useSupabaseConnection } from '../hooks/useSupabaseConnection'

export function SupabaseConnectionTest() {
  const { connected, loading, error, projectInfo } = useSupabaseConnection()

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700">🔄 Testando conexão com Supabase...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-700 font-semibold mb-2">❌ Erro na conexão</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  if (connected) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-green-700 font-semibold mb-2">✅ Conectado ao Supabase!</h3>
        {projectInfo && (
          <div className="text-green-600 text-sm space-y-1">
            <p><strong>URL:</strong> {projectInfo.url}</p>
            <p><strong>Conectado em:</strong> {new Date(projectInfo.connected_at).toLocaleString('pt-BR')}</p>
          </div>
        )}
      </div>
    )
  }

  return null
}
