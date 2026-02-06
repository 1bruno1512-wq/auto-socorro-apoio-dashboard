# 🚀 Guia de Deploy

## Opção 1: Deploy Automático no Vercel

### Via Dashboard (Mais Fácil)
1. Acesse https://vercel.com
2. Login com GitHub
3. Clique em "Add New Project"
4. Importe este repositório
5. Vercel detecta Vite automaticamente
6. Clique em "Deploy"

✅ **Deploy automático em cada push!**

### Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## Opção 2: Deploy Manual

### Netlify
```bash
npm run build
# Upload da pasta dist/ no dashboard do Netlify
```

### GitHub Pages
```bash
npm run build
# Configure GitHub Pages apontando para pasta dist/
```

---

## ⚙️ Variáveis de Ambiente (Futuro)

Quando integrar Supabase, criar `.env`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📊 Performance

Build otimizado com:
- Code splitting automático
- Minificação
- Tree shaking
- Lazy loading

---

## 🔧 Troubleshooting

### Build falha
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deploy falha
- Verifique se `npm run build` funciona localmente
- Confira as variáveis de ambiente
- Revise logs de deploy no Vercel

---

## 📞 Precisa de Ajuda?

Entre em contato ou abra uma issue no repositório.
