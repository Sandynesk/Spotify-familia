# Worker: Navegação, Configurações, Relatório e Histórico (Gemini)

Projeto: `C:\Users\esmsa\Desktop\Organização\Projetos\Spotify-familia`, um app Next.js 16 + Supabase. **Leia primeiro `docs/app/DESIGN.md` inteiro**: tokens, componentes e regras de trabalho são obrigatórios.

## Seus arquivos (só estes)

- `components/layout/Sidebar.tsx`, `BottomNav.tsx`, `Header.tsx`, `FAB.tsx`
- `components/relatorio/RelatorioButton.tsx`, mais novos arquivos em `components/relatorio/`
- `app/(dashboard)/historico/page.tsx`
- **novos:** `app/(dashboard)/configuracoes/page.tsx` e `components/configuracoes/*`

## Ações disponíveis

São stubs implementados em paralelo; use as assinaturas como estão.
- `getRelatorio()` em `lib/actions/relatorio.ts` → `{ texto } | { error }`.
- `getConfiguracoes()` → `Configuracoes | null` e `salvarConfiguracoes({ valor_plano, chave_pix })` → `{ success } | { error }`, ambas em `lib/actions/configuracoes.ts`.

## O que construir

1. **Navegação (mobile first):**
   - **BottomNav:** 4 abas (Início `/dashboard`, Membros, Visão Geral, Histórico) com estilo keynote: barra translúcida (`bg-app-bg/80 backdrop-blur`), ícone + rótulo, aba ativa em verde, alvos ≥ 44 px e `pb` com `env(safe-area-inset-bottom)`.
   - **Header (celular):**
     - título da tela;
     - à direita, ícone de engrenagem → `/configuracoes` e o botão de sair, que já existe;
     - em telas com `showBack`, o voltar à esquerda.
   - **Sidebar (desktop):** mesmo estilo, com o item "Configurações" acima de "Sair".
   - **FAB** ("adicionar membro"):
     - restilize;
     - não pode cobrir a BottomNav nem o conteúdo final; a página já tem `pb-24`;
     - esconda o FAB em `/configuracoes` e nas telas de formulário (`/membros/novo`, `/membros/*/editar`).
2. **Relatório do grupo** (`RelatorioButton` + `RelatorioSheet`):
   - **Ao tocar:** chame `getRelatorio()` (com loading) e abra um `Sheet` "Cobrança do grupo" com o texto exato numa caixa de pré-visualização (`whitespace-pre-wrap`, fonte normal, fundo `bg-app-elevated`).
   - **Botão primário "Enviar no WhatsApp":**
     - se `navigator.share` existir (celular), use `navigator.share({ text })`, que deixa escolher o grupo;
     - senão, abra `https://wa.me/?text=${encodeURIComponent(texto)}` em nova aba (`noopener`).
   - **Botão secundário "Copiar texto":** `navigator.clipboard.writeText`, com o toast "Copiado!" e fallback de seleção se a API falhar.
   - **Erro:** toast com a mensagem.
   - **Variantes:** `variant="full"` (botão largo com ícone do WhatsApp/`MessageCircle` e texto "Mandar cobrança no grupo") e `variant="icon"` (só ícone, com `aria-label`). **Mantenha a prop `variant`**, porque o dashboard usa `variant="full"`.
3. **Configurações (`/configuracoes`):**
   - página com `<Header title="Configurações" showBack />` e formulário:
     - **"Quanto custa o plano por mês"**: moeda, `inputMode="decimal"`, aceita vírgula;
     - **"Sua chave PIX"**: texto, ajuda "Aparece no relatório do grupo".
   - Botão salvar, que chama `salvarConfiguracoes`; carregue os valores com `getConfiguracoes()` num Server Component.
   - Mostre o erro retornado (ex.: tabela ainda não criada) de forma legível.
4. **Histórico (`/historico`):**
   - restilize com os tokens, mantendo o agrupamento por mês;
   - cabeçalho de mês fixo (`sticky`) ao rolar;
   - total pago do mês ao lado do título do grupo;
   - linhas mais compactas e legíveis no celular.

## Evidência de conclusão

Veja a seção "Regras de trabalho" do DESIGN.md e reporte com `worker_done`.
