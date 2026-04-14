# SpotiFamília 🎵

Dashboard para gerenciar o **Plano Família do Spotify** — controle membros, cobranças mensais e histórico de pagamentos.

## Tech Stack

- **Next.js 16** (App Router + Server Components + Server Actions)
- **TypeScript** strict
- **Tailwind CSS v4** com tema Spotify customizado
- **Supabase** (PostgreSQL + Auth + RLS)
- **Lucide React** (ícones)

---

## Configuração do Supabase

### 1. Criar projeto
1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Anote a **Project URL** e a **anon key** (Settings → API)

### 2. Criar as tabelas
1. Vá em **SQL Editor** no painel do Supabase
2. Cole e execute o conteúdo de [`supabase-schema.sql`](./supabase-schema.sql)

### 3. Criar usuário (dono do plano)
1. Em **Authentication → Users → Add user**
2. Crie um usuário com seu email e senha

---

## Instalação local

```bash
# 1. Entre na pasta do projeto
cd spotifamilia

# 2. Instale dependências (já instaladas se você usou create-next-app)
npm install

# 3. Configure variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais Supabase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

---

## Estrutura do Projeto

```
app/
├── (auth)/login/        → Página de login
├── (dashboard)/
│   ├── page.tsx         → Dashboard principal
│   ├── membros/         → Lista, detalhe, criar, editar membros
│   └── historico/       → Histórico geral de pagamentos
├── api/auth/callback/   → Callback do Supabase Auth
└── layout.tsx           → Root layout

components/
├── ui/                  → Avatar, Badge, Button, Card, Input, Skeleton, Toast
├── dashboard/           → SummaryCards, ProgressBar, MemberList, MemberRow
├── members/             → MemberForm, PaymentHistory, MemberStats
└── layout/              → Sidebar, BottomNav, Header, FAB

lib/
├── supabase/            → client.ts (browser), server.ts (SSR)
├── actions/             → membros.ts, pagamentos.ts (Server Actions)
└── utils/               → currency, date, avatar, payments

types/database.ts        → Tipos TypeScript
middleware.ts            → Auth guard
```

---

## Funcionalidades

### Dashboard (`/`)
- Cards resumo: membros ativos, total a receber, já pago, em atraso
- Barra de progresso de arrecadação do mês
- Lista de membros ordenada: atrasado → pendente → pago
- Botão rápido "Marcar como pago"

### Membros (`/membros`)
- Lista completa com status do mês atual
- Criação com geração automática de 12 meses de pagamentos

### Detalhe do membro (`/membros/[id]`)
- Informações cadastrais
- Estatísticas com % de pagamentos em dia (gráfico donut SVG)
- Histórico cronológico reverso
- Ações: marcar pago / desfazer pagamento

### Histórico (`/historico`)
- Todos os pagamentos agrupados por mês

---

## Responsividade

| Breakpoint | Layout |
|---|---|
| < 768px (mobile) | Single column, bottom nav, FAB |
| 768–1024px (tablet) | Grid 2 colunas |
| > 1024px (desktop) | Sidebar fixa, grid 3–4 colunas |

---

## Design

Segue rigorosamente a identidade visual do Spotify:
- Fundo `#121212`, cards `#181818`, hover `#282828`
- Verde accent `#1DB954`
- Tipografia DM Sans (substituta da Circular)
- Skeletons shimmer no style Spotify
- Animações 200ms ease
