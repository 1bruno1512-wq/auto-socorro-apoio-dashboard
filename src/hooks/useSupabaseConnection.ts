import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface ConnectionStatus {
  connected: boolean
  loading: boolean
  error: string | null
  projectInfo: any | null
}

export function useSupabaseConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    loading: true,
    error: null,
    projectInfo: null
  })

  useEffect(() => {
    async function testConnection() {
      try {
        // Testa a conexão verificando a sessão
        const { error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        setStatus({
          connected: true,
          loading: false,
          error: null,
          projectInfo: {
            url: import.meta.env.VITE_SUPABASE_URL,
            connected_at: new Date().toISOString()
          }
        })
      } catch (err) {
        setStatus({
          connected: false,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          projectInfo: null
        })
      }
    }

    testConnection()
  }, [])

  return status
}
