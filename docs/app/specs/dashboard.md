# Worker: Dashboard (Gemini)

Projeto: `C:\Users\esmsa\Desktop\Organização\Projetos\Spotify-familia`, um app Next.js 16 + Supabase. **Leia primeiro `docs/app/DESIGN.md` inteiro**: tokens, componentes e regras de trabalho são obrigatórios.

## Seus arquivos (só estes)

- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/SummaryCards.tsx`, `ProgressBar.tsx`, `MemberList.tsx`, `MemberRow.tsx`
- novos arquivos em `components/dashboard/` com prefixo `Dashboard` ou `Devedores` (ex.: `DevedoresCard.tsx`, `CustoCard.tsx`)

`MemberRow` também é usado em `app/(dashboard)/membros/page.tsx`, que é de outro worker. Mantenha as props atuais (`membro`, `pagamento`) compatíveis.

## Objetivo

O dashboard é a tela que o usuário abre todo dia no celular. Em 3 segundos ele precisa saber **quanto falta receber, quem está devendo e quanto**, e conseguir **registrar um pagamento com um toque**.

## Dados disponíveis

`getDashboardData()` de `lib/actions/pagamentos.ts` retorna:
- `membros`, `pagamentosMes` (com status efetivo) e `summary` (já existiam);
- `devedores: Devedor[]`;
- `custo: ResumoCusto`.

Os tipos estão em `types/database.ts`. Os dois últimos campos estão sendo implementados agora em paralelo, então hoje vêm vazios; programe contra o tipo.

Ações disponíveis:
- `marcarPago(pagamentoId)` (já existe);
- `quitarPendencias(membroId)` → `{ success, quitadas } | { error }`.

## O que construir (mobile first)

1. **Cabeçalho do mês:** título grande ("Novembro") e uma linha de resumo ("R$ 19,50 de R$ 39,00 recebidos"), com a barra de progresso fina em verde. Substitui o par SummaryCards + ProgressBar atual: simplifique, sem 4 cards competindo.
2. **Card "Quem está devendo"** (`devedores`):
   - uma linha por devedor: avatar, nome, meses em aberto em texto curto ("out, nov") e total em destaque;
   - quem tem atraso aparece com o vermelho de perigo e o ícone ⚠, sempre com texto, não só cor;
   - ação de 1 toque: **"Recebi"** (alvo ≥ 44 px):
     - com 1 mês em aberto, marca esse mês;
     - com vários, abre um `Sheet` confirmando "Quitar 2 meses (R$ 13,00) de Diego?" e chama `quitarPendencias`.
   - Toast de sucesso e de erro; spinner enquanto envia.
   - Se `devedores` estiver vazio, mostre o estado "Todo mundo em dia 🎉".
3. **Botão do relatório:** `<RelatorioButton variant="full" />` de `components/relatorio/RelatorioButton.tsx`, logo abaixo do card de devedores ("Mandar cobrança no grupo"). O componente é de outro worker: só o posicione.
4. **Card de custo** (`custo`):
   - com `valorPlano`: "Plano R$ 34,90 · Cobrado R$ 39,00 · Sobra R$ 4,10", ou "Você cobre R$ X" se for negativo;
   - com `valorPlano` null: um convite discreto com link para `/configuracoes` ("Informe quanto custa o plano para ver se a conta fecha").
5. **Lista de membros do mês** (MemberList/MemberRow), abaixo e mais discreta:
   - status do mês atual de cada membro e o botão de marcar pago com 1 toque, que já existe;
   - restilize com os tokens, mantendo "Ver todos" → `/membros`.
6. Mantenha `<Header />` e o `Suspense` com skeleton. Ajuste o skeleton (`DashboardSkeleton` em `components/ui/Skeleton.tsx` **não é seu**: crie o seu skeleton local se precisar).

## Evidência de conclusão

Veja a seção "Regras de trabalho" do DESIGN.md e reporte com `worker_done`.
