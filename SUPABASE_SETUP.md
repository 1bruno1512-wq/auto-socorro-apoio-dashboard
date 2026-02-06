# Configuração do Supabase

## Passos para Configurar

### 1. Obter a Chave Anon Key

Acesse o dashboard do Supabase:
https://supabase.com/dashboard/project/hxgqsgpeeaqhkerramjf/settings/api

Você encontrará:
- **Project URL**: https://hxgqsgpeeaqhkerramjf.supabase.co (já configurada)
- **anon/public key**: Copie esta chave

### 2. Configurar Localmente

Edite o arquivo `.env.local` e substitua `your_anon_key_here` pela chave anon copiada:

```env
VITE_SUPABASE_URL=https://hxgqsgpeeaqhkerramjf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configurar no Vercel

Após fazer o deploy, configure as variáveis de ambiente no Vercel:

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `auto-socorro-apoio-frontend`
3. Vá em Settings → Environment Variables
4. Adicione:
   - `VITE_SUPABASE_URL` = `https://hxgqsgpeeaqhkerramjf.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sua_chave_anon_aqui`
5. Redeploy o projeto

### 4. Testar a Conexão

Após configurar as variáveis, você pode testar a conexão usando o componente:

```tsx
import { SupabaseConnectionTest } from './components/SupabaseConnectionTest'

function App() {
  return (
    <div>
      <SupabaseConnectionTest />
    </div>
  )
}
```

## Arquivos Criados

- ✅ `src/lib/supabase.ts` - Cliente Supabase configurado
- ✅ `src/hooks/useSupabaseConnection.ts` - Hook para testar conexão
- ✅ `src/components/SupabaseConnectionTest.tsx` - Componente de teste visual
- ✅ `.env.local` - Variáveis de ambiente (não versionado)

## Uso Básico

```typescript
import { supabase } from './lib/supabase'

// Exemplo: Buscar dados
const { data, error } = await supabase
  .from('tabela')
  .select('*')

// Exemplo: Inserir dados
const { data, error } = await supabase
  .from('tabela')
  .insert({ campo: 'valor' })
```

## Segurança

⚠️ **Importante**: 
- A `anon key` é segura para uso no frontend
- Nunca commit o arquivo `.env.local` (já está no .gitignore)
- Configure Row Level Security (RLS) nas tabelas do Supabase
