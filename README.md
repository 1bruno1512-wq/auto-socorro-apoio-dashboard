# Auto Socorro Apoio - Dashboard Frontend

Dashboard moderno e responsivo para sistema de gestão de transporte de veículos e auto socorro.

## 🚀 Stack Técnica

- **Vite** - Build tool ultra-rápido
- **React 18** - Framework UI
- **TypeScript** - Type safety
- **TailwindCSS** - Styling utility-first

## ✨ Funcionalidades Implementadas

### Interface Completa
- ✅ **Sidebar** com navegação (Dashboard, Ordens, Rastreamento, Motoristas, Financeiro)
- ✅ **Header** com busca e notificações
- ✅ **Cards de estatísticas** (Ordens Ativas, Veículos em Rota, Entregas, Faturamento)
- ✅ **Lista de ordens ativas** com status, origem/destino, motorista, ETA
- ✅ **Placeholder para mapa** (pronto para integrar Google Maps / Leaflet)
- ✅ **Design responsivo** mobile-first
- ✅ **Dados mock** para visualização

### Design System
- Cores profissionais (azul como cor primária)
- Tipografia limpa e legível
- Espaçamentos consistentes
- Feedback visual (hover, active states)
- Badge de status coloridos

## 🎨 Preview

### Componentes Principais:
1. **Sidebar** - Menu lateral fixo com navegação
2. **Header** - Busca global + notificações + configurações
3. **Stats Cards** - 4 cards com métricas principais
4. **Orders List** - Lista de ordens ativas com detalhes
5. **Map Panel** - Área reservada para mapa interativo

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

### GitHub + Vercel (Automático)
1. Crie repo no GitHub
2. Conecte no Vercel
3. Deploy automático a cada push

## 🎯 Próximos Passos

### MVP - Fase 1
- [ ] Integrar mapa real (Google Maps ou Leaflet)
- [ ] Conectar com Supabase (API real)
- [ ] Autenticação (login/logout)
- [ ] CRUD de ordens de serviço
- [ ] Rastreamento GPS em tempo real

### Fase 2
- [ ] App Mobile para motoristas
- [ ] Painel do cliente
- [ ] Módulo financeiro
- [ ] Relatórios gerenciais

## 📂 Estrutura de Pastas
```
src/
├── components/
│   └── Dashboard.tsx    # Componente principal
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles + Tailwind
```

## 🎨 Paleta de Cores

- **Primária:** Blue 600 (#2563EB)
- **Sucesso:** Green 600 (#059669)
- **Alerta:** Yellow 600 (#D97706)
- **Erro:** Red 600 (#DC2626)
- **Neutro:** Gray 50-900

## 📝 Notas

- Dashboard 100% funcional com dados mock
- Pronto para integração com backend
- Design baseado em referências modernas de dashboards
- Componentizado para fácil manutenção
