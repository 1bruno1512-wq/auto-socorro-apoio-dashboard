# Auto Socorro Apoio - Dashboard Frontend

Dashboard moderno e responsivo para sistema de gestão de transporte de veículos e auto socorro com rastreamento em tempo real via Google Maps.

## 🚀 Stack Técnica

- **Vite** - Build tool ultra-rápido
- **React 19** - Framework UI
- **TypeScript** - Type safety
- **TailwindCSS** - Styling utility-first
- **Supabase** - Backend as a Service (banco de dados + auth)
- **Google Maps** - Rastreamento de veículos e rotas

## ✨ Funcionalidades Implementadas

### Interface Completa
- ✅ **Sidebar** com navegação (Dashboard, Ordens, Rastreamento, Motoristas, Financeiro)
- ✅ **Header** com busca e notificações
- ✅ **Cards de estatísticas** (Ordens Ativas, Veículos em Rota, Entregas, Faturamento)
- ✅ **Lista de ordens ativas** com status, origem/destino, motorista, ETA
- ✅ **Google Maps integrado** com marcadores e rotas
- ✅ **Marcadores de origem** (verde) e **destino** (vermelho)
- ✅ **Polylines** conectando origem e destino
- ✅ **Info windows** com detalhes das ordens ao clicar
- ✅ **Fallback visual** quando API key não está configurada
- ✅ **Design responsivo** mobile-first
- ✅ **Dados mock** para visualização

### 🗺️ Mapa Interativo
- **Marcadores coloridos:**
  - 🟢 Verde = Origem
  - 🔴 Vermelho = Destino
- **Rotas:** Linhas conectando origem e destino (azul para ativas, cinza para inativas)
- **Info popups:** Clique nos marcadores para ver detalhes (placa, número da ordem, motorista)
- **Centro automático:** Mapa ajusta-se automaticamente baseado nas ordens ativas
- **Legenda:** Explicação visual dos marcadores
- **Responsivo:** Funciona em desktop e mobile

## 🔑 Configuração do Google Maps API

### 1. Obter API Key

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as seguintes APIs:
   - **Maps JavaScript API** (obrigatório)
   - **Geocoding API** (recomendado)
   - **Directions API** (opcional, para rotas otimizadas)

4. Vá em **APIs & Services → Credentials**
5. Clique em **+ Create Credentials → API Key**
6. Copie a chave gerada

### 2. Configurar Restrições (Recomendado)

Para segurança, restrinja sua API key:

1. Clique na chave criada
2. Em **Application restrictions:**
   - Escolha "HTTP referrers"
   - Adicione seus domínios:
     ```
     localhost:5173/*
     *.vercel.app/*
     seu-dominio.com/*
     ```
3. Em **API restrictions:**
   - Escolha "Restrict key"
   - Selecione apenas: Maps JavaScript API, Geocoding API, Directions API

### 3. Configurar no Projeto

#### Desenvolvimento Local
Crie o arquivo `.env.local`:

```bash
# Supabase
VITE_SUPABASE_URL=https://hxgqsgpeeaqhkerramjf.supabase.co
VITE_SUPABASE_ANON_KEY=sua_key_do_supabase

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=sua_google_maps_api_key_aqui
```

#### Vercel (Produção)

No dashboard do Vercel:
1. Vá em **Settings → Environment Variables**
2. Adicione:
   - `VITE_GOOGLE_MAPS_API_KEY` → sua chave
3. Faça redeploy do projeto

### 4. Verificar Funcionamento

- ✅ **Com API key:** Mapa aparece com marcadores
- ❌ **Sem API key:** Placeholder bonito com instruções

## 🛠️ Como Rodar

### Desenvolvimento
```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

### Build
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 📦 Deploy

### Vercel (Recomendado)
```bash
# Via CLI
vercel --prod

# Ou conecte o repo no dashboard do Vercel
```

**⚠️ Importante:** Configure as variáveis de ambiente no Vercel após o deploy!

### GitHub + Vercel (Automático)
1. Crie repo no GitHub
2. Push do código
3. Conecte no Vercel
4. Configure env vars no dashboard
5. Deploy automático a cada push

## 🎯 Próximos Passos

### MVP - Fase 1
- [x] Integrar Google Maps com marcadores
- [x] Rotas visuais entre origem e destino
- [x] Info windows com detalhes
- [ ] Conectar com Supabase (API real)
- [ ] Autenticação (login/logout)
- [ ] CRUD de ordens de serviço
- [ ] Rastreamento GPS em tempo real (Supabase Realtime)

### Fase 2
- [ ] Posição do veículo em movimento
- [ ] Histórico de rotas (linha GPS completa)
- [ ] Directions API para rotas otimizadas
- [ ] Estimativa de tempo real baseada em tráfego
- [ ] App Mobile para motoristas
- [ ] Painel do cliente
- [ ] Módulo financeiro
- [ ] Relatórios gerenciais

## 📂 Estrutura de Pastas
```
src/
├── components/
│   ├── Dashboard.tsx       # Sidebar + Layout
│   └── MapView.tsx         # Mapa Google Maps (NOVO!)
├── pages/
│   └── DashboardHome.tsx   # Dashboard principal
├── App.tsx                 # Root component
├── main.tsx                # Entry point
└── index.css               # Global styles + Tailwind
```

## 🎨 Paleta de Cores

- **Primária:** Blue 600 (#2563EB)
- **Sucesso:** Green 600 (#059669)
- **Alerta:** Yellow 600 (#D97706)
- **Erro:** Red 600 (#DC2626)
- **Neutro:** Gray 50-900

## 🗺️ Schema Supabase (Coordenadas)

O mapa espera os seguintes campos nas tabelas:

### `ordens_servico`
```sql
origem_lat    FLOAT    # Latitude da origem
origem_lng    FLOAT    # Longitude da origem
destino_lat   FLOAT    # Latitude do destino
destino_lng   FLOAT    # Longitude do destino
status        TEXT     # em_transito, aguardando_coleta, etc
```

### `viagens` (opcional, para rotas completas)
```sql
rota_gps      JSONB    # Array de {lat, lng, timestamp}
```

## 💡 Dicas

- **Sem cartão de crédito?** O Google Maps API tem um free tier generoso:
  - $200 créditos mensais grátis
  - ~28.000 carregamentos de mapa por mês
  - Você só é cobrado se passar disso

- **Alternativa gratuita:** Considere Leaflet + OpenStreetMap se não puder usar Google Maps

- **Performance:** O componente MapView só carrega quando há ordens ativas

- **Mobile:** Mapa responsivo, ajusta altura automaticamente

## 📝 Troubleshooting

### Mapa não aparece
- ✅ Verifique se a API key está em `.env.local`
- ✅ Confirme que Maps JavaScript API está ativada
- ✅ Verifique restrições de domínio
- ✅ Abra o console do navegador para ver erros

### Marcadores não aparecem
- ✅ Verifique se os dados têm `origem_lat`, `origem_lng`, `destino_lat`, `destino_lng`
- ✅ Confirme que as coordenadas são válidas (lat: -90 a 90, lng: -180 a 180)

### Erro de billing
- ✅ Ative o billing no Google Cloud (não será cobrado no free tier)
- ✅ Adicione método de pagamento (necessário mesmo no plano grátis)

## 🚀 Deploy ID

**Vercel Deployment:** `X0VfUIQPjW8AdLhwq4cMlSDO`

## 📄 Licença

Proprietário - Auto Socorro Apoio © 2026
