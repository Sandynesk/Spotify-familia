# SpotiFamília 🎵

Um aplicativo web moderno e premium para gerenciar o **Plano Família do Spotify**. Chega de planilhas confusas e conversas chatas sobre dinheiro. O SpotiFamília organiza membros, controla cobranças mensais e mantém um histórico claro de pagamentos.

---

## 🎧 Visão Geral

O projeto foi construído com foco primário em **UI/UX premium**, replicando e expandindo a identidade visual do Spotify com um toque moderno. Ele inclui animações fluidas (`framer-motion`), componentes responsivos, e um sistema robusto de autenticação e banco de dados rodando no **Supabase**.

### Principais Features Adicionadas:
- ✨ **Landing Page Dinâmica**: Completamente responsiva, com background dinâmico (partículas animadas), mockups e efeitos "Glow" modernos.
- 🔐 **Autenticação Premium**: Fluxo de Login/Cadastro em interface otimizada com abas animadas, foco de input personalizado (`ring-inset` anti-clip) e validação de força da senha.
- 💎 **Componentes de UI de Alta Fidelidade**: 
  - Botões com gradientes sutis, efeitos *hover* 3D e rotação de 360° em ícones (como a logo oficial do Spotify).
  - Ícone de site (Favicon) gerado dinamicamente no Next.js (`app/icon.tsx`) usando a logo desenhada em puro SVG.
- 📱 **Responsividade Total**: Layout adaptável garantindo consistência em telas Mobile, Tablets e Desktops, prevenindo até bugs comuns de zoom em formulários no iOS Safari.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js (App Router + Server Components + Server Actions)
- **Linguagem:** TypeScript strict
- **Estilização:** Tailwind CSS (Tema escuro customizado do Spotify)
- **Animações:** Framer Motion
- **Banco de Dados & Auth:** Supabase (PostgreSQL + RLS)
- **Ícones:** Lucide React

---

## 🚀 Instalação Local

```bash
# 1. Clone o repositório e entre na pasta do projeto
git clone <seu-repo>
cd spotifamilia

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.local.example .env.local
# (Edite .env.local com suas credenciais do Supabase)

# 4. Inicie o servidor em modo de desenvolvimento
npm run dev
```

Acesse o projeto em localmente: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuração do Supabase

### 1. Criar o Projeto
1. Acesse [supabase.com](https://supabase.com) e crie um **New project**.
2. Vá em **Project Settings → API** e anote a sua **Project URL** e a **anon key**.

### 2. Preparar as Variáveis de Ambiente
Preencha o arquivo `.env.local` na raiz do seu projeto recém-criado:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Criar as Tabelas do Banco
1. No painel do Supabase, acesse o menu **SQL Editor**.
2. Cole o conteúdo do arquivo [`supabase-schema.sql`](./supabase-schema.sql) existente na raiz do projeto e clique em **Run**. Isso criará as tabelas de membros e pagamentos, além das lógicas de segurança (Row Level Security).

---

## 📂 Estrutura do Projeto

```text
app/
├── (auth)/                → Landing page (`/`), Login e Cadastro
├── (dashboard)/           → Área restrita do usuário (Dash, Membros, Histórico)
├── api/auth/callback/     → Verificador de sessão e tokens do Supabase
├── icon.tsx               → Ícone de Site gerado dinamicamente no Build (Favicon)
└── layout.tsx             → Root layout base

components/
├── public/                → Navbar, Footer e Inputs públicos da Landing page e Auth
├── ui/                    → Biblioteca de UI (Button animado, Toast, SpotifyLogo, inputs)
├── dashboard/             → Placas de resumo financeiro e gráficos
└── layout/                → Sidebar Desktop e Navegação Mobile

lib/
├── supabase/              → Clientes de conexão Server e Browser
├── actions/               → Lógicas de regras de negócio (Server Actions)
└── utils/                 → Formatadores de Moeda, Data e Geração de cores

types/database.ts          → Tipagem estrita de tabelas
middleware.ts              → Guardião de rotas autenticadas da aplicação
```

---

## 📱 Responsividade e Estilização

O projeto adota o conceito de "Mobile First", mantendo a melhor performance possível:

| Breakpoint | Layout |
|---|---|
| `< 768px` (Mobile) | Colunaúnica, adequação de tipografia (previne *iOS zoom* focus), e botões full-width adaptáveis. Animações simplificadas para performance de toque. |
| `768–1024px` (Tablet)| Grid contínuo ajustado e inputs em 2 colunas. |
| `> 1024px` (Desktop) | Animações de Hover (`group-hover:rotate-360`, glows) ativadas. Layout side-by-side de painéis. |

O esquema de cores segue as diretrizes do **Spotify Design**:
- Backound: Escuro (`#121212`), Containers: (`#181818`), Hover/Select: (`#282828`).
- Accent Glow & Brands: (`#1DB954` a `#1ed760`).
