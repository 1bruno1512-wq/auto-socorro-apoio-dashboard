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
        // Testa a conexão fazendo uma query simples
        const { data, error } = await supabase
          .from('_realtime')
          .select('*')
          .limit(1)
        
        if (error && error.code !== 'PGRST200') {
          // Se não houver tabela _realtime, tenta uma query alternativa
          const { error: healthError } = await supabase.auth.getSession()
          
          if (healthError) {
            throw healthError
          }
        }

        setStatus({
          connected: true,
          loading: false,
          error: null,
          projectInfo: {
            url: supabase.supabaseUrl,
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
