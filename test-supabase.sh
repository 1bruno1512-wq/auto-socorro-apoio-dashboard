#!/bin/bash

# Script de teste da integração Supabase
# Uso: ./test-supabase.sh

echo "🔍 Verificando integração Supabase..."
echo ""

# Verifica se o pacote está instalado
if grep -q "@supabase/supabase-js" package.json; then
    echo "✅ Pacote @supabase/supabase-js instalado"
else
    echo "❌ Pacote @supabase/supabase-js NÃO encontrado"
    exit 1
fi

# Verifica arquivos criados
files=(
    "src/lib/supabase.ts"
    "src/hooks/useSupabaseConnection.ts"
    "src/components/SupabaseConnectionTest.tsx"
    ".env.local"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Arquivo criado: $file"
    else
        echo "❌ Arquivo faltando: $file"
    fi
done

# Verifica .env.local
echo ""
echo "📋 Conteúdo do .env.local:"
if [ -f ".env.local" ]; then
    cat .env.local
    echo ""
    
    if grep -q "your_anon_key_here" .env.local; then
        echo "⚠️  ATENÇÃO: Substitua 'your_anon_key_here' pela chave real!"
    else
        echo "✅ Chave anon configurada"
    fi
else
    echo "❌ Arquivo .env.local não encontrado"
fi

echo ""
echo "📦 Versão do pacote instalado:"
npm list @supabase/supabase-js 2>/dev/null | grep @supabase

echo ""
echo "🚀 Para testar localmente:"
echo "   1. Configure a SUPABASE_ANON_KEY no .env.local"
echo "   2. Execute: npm run dev"
echo "   3. Adicione <SupabaseConnectionTest /> ao App.tsx"
