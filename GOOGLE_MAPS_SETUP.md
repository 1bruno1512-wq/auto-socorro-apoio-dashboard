# 🗺️ Google Maps API - Guia Rápido

## TL;DR - 5 Minutos

```bash
1. Google Cloud Console → Novo Projeto
2. Ativar: Maps JavaScript API
3. Credentials → Create API Key
4. Copiar chave
5. Adicionar no Vercel: VITE_GOOGLE_MAPS_API_KEY
6. Redeploy
```

---

## 🎯 Passo a Passo Detalhado

### 1. Acessar Google Cloud Console

🔗 https://console.cloud.google.com/

- Faça login com sua conta Google
- Primeiro acesso pode pedir aceitar termos

---

### 2. Criar Projeto

```
┌─────────────────────────────────────┐
│ Google Cloud Console                │
│                                     │
│  [Select a project ▼]              │
│                                     │
│  → NEW PROJECT                      │
│     Nome: Auto Socorro Apoio        │
│     [CREATE]                        │
└─────────────────────────────────────┘
```

- Clique em "Select a project" (topo da página)
- Clique em "NEW PROJECT"
- Nome sugerido: "Auto Socorro Apoio"
- Organização: pode deixar vazio
- Clique em "CREATE"
- Aguarde criação (~10 segundos)

---

### 3. Ativar APIs Necessárias

```
Menu ☰ → APIs & Services → Library
```

#### 3.1 Maps JavaScript API (OBRIGATÓRIO)
1. Pesquise: "Maps JavaScript API"
2. Clique no resultado
3. Clique em **ENABLE**
4. Aguarde ativação

#### 3.2 Geocoding API (RECOMENDADO)
1. Volte para Library
2. Pesquise: "Geocoding API"
3. Clique e **ENABLE**

#### 3.3 Directions API (OPCIONAL)
1. Volte para Library
2. Pesquise: "Directions API"
3. Clique e **ENABLE**

---

### 4. Criar API Key

```
Menu ☰ → APIs & Services → Credentials
```

1. Clique em **+ CREATE CREDENTIALS** (topo)
2. Selecione: **API key**
3. Uma chave será gerada (ex: `AIzaSyC-1234567890abcdefGHIJKLMNOP`)
4. **COPIE E SALVE** essa chave (aparece apenas 1 vez)

---

### 5. Configurar Restrições (IMPORTANTE!)

⚠️ **Não pule esta etapa! Protege contra uso indevido.**

Após criar a chave, ela aparece na lista. Clique no nome dela:

#### 5.1 Application restrictions

```
● None (não recomendado)
● HTTP referrers (web sites) ✅ ESCOLHA ESTA
● IP addresses
● Android apps
● iOS apps
```

Selecione: **HTTP referrers (web sites)**

Adicione os seguintes referrers:

```
localhost:5173/*
*.vercel.app/*
auto-socorro-apoio-dashboard.vercel.app/*
```

Clique em **+ ADD AN ITEM** para cada linha.

#### 5.2 API restrictions

```
● Don't restrict key (não recomendado)
● Restrict key ✅ ESCOLHA ESTA
```

Selecione: **Restrict key**

Marque apenas:
- ✅ Maps JavaScript API
- ✅ Geocoding API
- ✅ Directions API

#### 5.3 Salvar

Clique em **SAVE** no final da página.

---

### 6. Configurar Billing (NECESSÁRIO)

⚠️ **SIM, é necessário cartão de crédito MAS:**

✅ **Free Tier Generoso:**
- $200 créditos grátis todo mês
- ~28.000 visualizações de mapa/mês grátis
- Você NÃO será cobrado automaticamente
- Pode configurar alertas para evitar surpresas

**Como configurar:**

```
Menu ☰ → Billing → Link a billing account
```

1. Clique em **CREATE BILLING ACCOUNT**
2. Preencha dados do cartão
3. Aceite termos
4. Clique em **START MY FREE TRIAL**

**Configurar Alerta (Recomendado):**

```
Billing → Budgets & alerts → CREATE BUDGET
```

- Nome: "Maps API Alert"
- Budget amount: $5 ou $10
- Threshold: 50%, 90%, 100%
- Email alerts: ✅

Assim você recebe email se atingir limite.

---

### 7. Verificar se Funcionou

No Google Cloud Console:

```
APIs & Services → Dashboard
```

Você deve ver:
- ✅ Maps JavaScript API (Enabled)
- ✅ Geocoding API (Enabled)
- ✅ Directions API (Enabled)

---

## 🔧 Adicionar no Projeto

### Desenvolvimento Local

Crie/edite `.env.local`:

```bash
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC-SUA_CHAVE_AQUI
```

Reinicie o servidor dev:
```bash
npm run dev
```

### Produção (Vercel)

1. Acesse: https://vercel.com/dashboard
2. Selecione projeto: **auto-socorro-apoio-dashboard**
3. Vá em: **Settings → Environment Variables**
4. Clique em: **Add**
5. Preencha:
   - **Key:** `VITE_GOOGLE_MAPS_API_KEY`
   - **Value:** `AIzaSyC-SUA_CHAVE_AQUI`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
6. Clique em **Save**

### Redeploy

No Vercel:
1. Vá em **Deployments**
2. Clique nos 3 pontos do último deploy
3. Clique em **Redeploy**

Ou via Git:
```bash
git commit --allow-empty -m "config: add google maps api key"
git push
```

---

## 🎉 Testando

Acesse sua aplicação e verifique:

### ✅ Funcionando:
- Mapa aparece
- Marcadores verde (origem) e vermelho (destino)
- Linhas azuis conectando pontos
- Clique mostra info popup

### ❌ Não funcionando:

**Se aparecer placeholder "Configure Google Maps API":**
- Variável não está configurada
- Faça redeploy após adicionar

**Se aparecer erro no console (F12):**

- `RefererNotAllowedMapError` → Adicione domínio nas restrições
- `ApiNotActivatedMapError` → Ative Maps JavaScript API
- `BillingNotEnabledMapError` → Configure billing
- `InvalidKeyMapError` → Verifique se copiou a chave correta

---

## 💰 Monitorar Custos

### Ver Uso Atual:

```
Google Cloud Console → APIs & Services → Dashboard
```

Clique em cada API para ver:
- Requests today
- Requests per second
- Errors

### Estimar Custos:

Calculadora oficial:
https://mapsplatform.google.com/pricing/

**Exemplo de uso típico:**

| Métrica | Quantidade/mês | Custo |
|---------|----------------|-------|
| Map loads | 10.000 | $0 (free tier) |
| Geocoding requests | 5.000 | $0 (free tier) |
| Directions requests | 1.000 | $0 (free tier) |
| **TOTAL** | | **$0** |

Free tier cobre:
- Até 28.000 map loads
- Até 40.000 geocoding requests  
- Até 2.500 directions requests

---

## 🔒 Segurança

### ✅ Boas Práticas:

1. **Sempre restrinja por HTTP referrer**
   - Evita uso não autorizado
   - Protege contra abusos

2. **Restrinja APIs específicas**
   - Ative apenas o necessário
   - Reduz superfície de ataque

3. **Configure alertas de billing**
   - Monitore gastos
   - Evite surpresas

4. **Não commite chaves no Git**
   - Use variáveis de ambiente
   - Arquivo `.env.local` está no `.gitignore`

### ❌ Evite:

- ❌ Deixar chave sem restrições
- ❌ Compartilhar chave publicamente
- ❌ Commitar chave no código
- ❌ Usar mesma chave em múltiplos projetos

---

## 🆘 Problemas Comuns

### "Credit card required"

- É normal, Google exige para qualquer projeto
- Você NÃO será cobrado no free tier
- Pode cancelar billing depois se quiser

### "Maps JavaScript API not enabled"

- Vá em APIs & Services → Library
- Pesquise "Maps JavaScript API"
- Clique em ENABLE

### "This page can't load Google Maps correctly"

1. Abra console (F12)
2. Veja erro específico
3. Resolva conforme mensagem:
   - Billing → Configure cartão
   - RefererNotAllowed → Adicione domínio
   - InvalidKey → Verifique chave

### Billing desabilitado

- Não é possível usar sem billing configurado
- É política do Google desde 2018
- Free tier cobre uso básico

---

## 📚 Recursos Úteis

- **Documentação oficial:** https://developers.google.com/maps/documentation/javascript
- **Preços:** https://mapsplatform.google.com/pricing/
- **Erros comuns:** https://developers.google.com/maps/documentation/javascript/error-messages
- **Calculadora de custos:** https://mapsplatform.google.com/pricing/#pricing-grid
- **Suporte:** https://developers.google.com/maps/support

---

## 🎯 Checklist Final

- [ ] Projeto criado no Google Cloud
- [ ] Maps JavaScript API ativada
- [ ] API Key criada
- [ ] Restrições configuradas (HTTP referrers + API restrictions)
- [ ] Billing configurado (com alerta)
- [ ] Chave adicionada no Vercel (VITE_GOOGLE_MAPS_API_KEY)
- [ ] Redeploy feito
- [ ] Mapa funcionando na aplicação

---

Se tudo estiver marcado, **parabéns! 🎉** Seu mapa está funcionando!
