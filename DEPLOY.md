# 🚀 Guia de Deploy - Auto Socorro Apoio

## Deploy Vercel: X0VfUIQPjW8AdLhwq4cMlSDO

### ✅ Status Atual
- [x] Código commitado e pushado para GitHub
- [x] Google Maps integrado no código
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Google Maps API Key obtida

---

## 📋 Checklist de Deploy

### 1️⃣ Configurar Variáveis de Ambiente no Vercel

Acesse: https://vercel.com/dashboard

1. Selecione o projeto **auto-socorro-apoio-dashboard**
2. Vá em **Settings → Environment Variables**
3. Adicione as seguintes variáveis:

#### Variável 1: VITE_SUPABASE_URL
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://hxgqsgpeeaqhkerramjf.supabase.co`
- **Environments:** Production, Preview, Development

#### Variável 2: VITE_SUPABASE_ANON_KEY
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z3FzZ3BlZWFxaGtlcnJhbWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNTUxMTEsImV4cCI6MjA1MzkzMTExMX0.jLXV3pT0SRiBQyChd-N_9qbKwLtq8OgaDkuUUwfWx5g`
- **Environments:** Production, Preview, Development

#### Variável 3: VITE_GOOGLE_MAPS_API_KEY (⚠️ Configure após obter a chave)
- **Key:** `VITE_GOOGLE_MAPS_API_KEY`
- **Value:** `sua_google_maps_api_key_aqui`
- **Environments:** Production, Preview, Development

---

### 2️⃣ Obter Google Maps API Key

#### Passo a Passo:

1. **Acesse Google Cloud Console:**
   https://console.cloud.google.com/

2. **Crie/Selecione um Projeto:**
   - Clique em "Select a project" no topo
   - Clique em "NEW PROJECT"
   - Nome: "Auto Socorro Apoio" (ou similar)
   - Clique em "CREATE"

3. **Ative as APIs Necessárias:**
   - Vá em: **APIs & Services → Library**
   - Pesquise e ative:
     - ✅ **Maps JavaScript API** (obrigatório)
     - ✅ **Geocoding API** (recomendado)
     - ✅ **Directions API** (opcional)

4. **Crie a API Key:**
   - Vá em: **APIs & Services → Credentials**
   - Clique em: **+ CREATE CREDENTIALS → API Key**
   - Copie a chave gerada (ex: `AIzaSyC...`)

5. **Configure Restrições (Importante!):**
   - Clique na chave que acabou de criar
   - Em **Application restrictions:**
     - Selecione: "HTTP referrers (web sites)"
     - Adicione:
       ```
       localhost:5173/*
       *.vercel.app/*
       auto-socorro-apoio-dashboard.vercel.app/*
       ```
   
   - Em **API restrictions:**
     - Selecione: "Restrict key"
     - Marque:
       - Maps JavaScript API
       - Geocoding API
       - Directions API

6. **Salve as configurações**

#### ⚠️ Importante sobre Billing:

O Google Maps requer método de pagamento configurado, MAS:
- ✅ $200 créditos grátis por mês
- ✅ ~28.000 carregamentos de mapa grátis/mês
- ✅ Você NÃO será cobrado se ficar dentro do free tier
- ✅ Pode configurar alertas de billing para evitar surpresas

**Para ativar billing:**
1. Vá em: **Billing → Link a billing account**
2. Adicione cartão de crédito
3. Configure billing budget alerts (ex: $5)

---

### 3️⃣ Adicionar API Key no Vercel

Depois de obter a chave do Google Maps:

1. Volte em: https://vercel.com/dashboard
2. Vá em: **Settings → Environment Variables**
3. Clique em: **VITE_GOOGLE_MAPS_API_KEY**
4. Cole a chave obtida
5. Salve

---

### 4️⃣ Fazer Redeploy

Após configurar as variáveis:

**Opção 1 - Dashboard Vercel:**
1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deployment
3. Clique em **Redeploy**
4. Marque "Use existing Build Cache"
5. Clique em **Redeploy**

**Opção 2 - Trigger automático:**
```bash
# Qualquer commit novo dispara deploy automático
git commit --allow-empty -m "trigger deploy"
git push
```

---

## 🎯 Verificação Pós-Deploy

Acesse sua aplicação no Vercel e verifique:

### ✅ Com Google Maps API configurada:
- Mapa aparece no dashboard
- Marcadores verdes (origem) e vermelhos (destino) visíveis
- Linhas azuis conectando rotas
- Clique nos marcadores mostra info popup
- Legenda aparece no canto inferior esquerdo

### ❌ Sem Google Maps API:
- Placeholder bonito aparece
- Mensagem: "Configure Google Maps API"
- Botão "Obter API Key" funciona

---

## 🔧 Troubleshooting

### Mapa não aparece após configurar API key

1. **Verifique no Vercel:**
   - Settings → Environment Variables
   - Confirme que `VITE_GOOGLE_MAPS_API_KEY` está configurada
   - Refaça deploy

2. **Verifique no Google Cloud:**
   - APIs estão ativadas?
   - Billing está configurado?
   - Restrições de domínio incluem `*.vercel.app/*`?

3. **Console do navegador:**
   - Abra DevTools (F12)
   - Veja se há erros relacionados ao Google Maps
   - Erros comuns:
     - "RefererNotAllowedMapError" → Adicione domínio nas restrições
     - "ApiNotActivatedMapError" → Ative Maps JavaScript API
     - "BillingNotEnabledMapError" → Configure billing

### Variáveis de ambiente não atualizaram

- ⚠️ Sempre faça **Redeploy** após alterar env vars
- As variáveis só são aplicadas em novos deployments

---

## 📊 Monitoramento de Uso (Google Maps)

Acesse: https://console.cloud.google.com/

1. Vá em: **APIs & Services → Dashboard**
2. Veja uso das APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API

3. Configure alertas:
   - **Billing → Budgets & alerts**
   - Crie alerta para $5 ou $10
   - Receba email se atingir limite

---

## 🎉 Próximos Passos

Após deploy configurado:

1. [ ] Testar mapa em produção
2. [ ] Conectar dados reais do Supabase
3. [ ] Implementar autenticação
4. [ ] Rastreamento GPS em tempo real
5. [ ] App mobile para motoristas

---

## 📞 Suporte

**Documentação oficial:**
- Google Maps: https://developers.google.com/maps/documentation
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs

**Erros comuns:**
- https://developers.google.com/maps/documentation/javascript/error-messages
