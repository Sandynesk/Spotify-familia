# B6 — Agenda de vencimentos (`/agenda` + .ics) e Linha do tempo (`/historico`)

Leia antes: `docs/app/v2/_REGRAS.md`, `docs/app/v2/DESIGN-V2.md`, `docs/app/v2/B-contratos.md`.
Porta: **3216**.

## Arquivos que são seus
- `app/(dashboard)/agenda/**` (novo)
- `app/(dashboard)/historico/**`
- `components/agenda/**`, `components/historico/**` (novos)
- `app/api/agenda/**` (novo)
- `lib/actions/agenda.ts` (novo, se precisar)

## `/agenda`
- `PageHeader` "Agenda" + subtítulo "Próximo vencimento: Bruno, dia 10".
- **Calendário do mês** (momento-assinatura): grade 7 colunas estilo Calendário da Apple, hoje destacado com círculo menta, dias com vencimentos mostram pontinhos coloridos por status (pago/pendente/atrasado) e mini-avatares; navegar entre meses com chevrons e gesto de swipe horizontal; tocar num dia → lista daquele dia abaixo (com ações marcar pago/cobrar → `/cobrar?membro=`).
- **Lista "Próximos 30 dias"** agrupada por semana ("Esta semana", "Próxima semana"...), com contagem regressiva ("em 3 dias").
- **Adicionar ao calendário**: botão que baixa `/api/agenda/ics` (gera com `gerarIcs` de `lib/domain/agenda`, `Content-Type: text/calendar; charset=utf-8`, `Content-Disposition: attachment; filename="spotifamilia-vencimentos.ics"`, protegido: só usuário logado/demo). Explique num `Sheet` como importar no iPhone/Google Agenda (passos curtos).
- Desktop: calendário à esquerda (7 col), lista à direita (5 col).

## `/historico` — Linha do tempo
- `PageHeader` "Histórico".
- Filtros: `SegmentedControl` (Tudo · Pagamentos · Membros) + filtro por membro (chips com avatar) + período.
- Feed agrupado por dia ("Hoje", "Ontem", "3 de novembro") com eventos de `linhaDoTempo` (`lib/domain/atividade`): ícone em caixa colorida, frase natural ("**Ana** pagou outubro · R$ 6,82 · 2 dias antes do vencimento"), hora. Linha vertical conectando os eventos.
- Resumo no topo: total recebido no período, nº de pagamentos.
- Paginação "Carregar mais" ou rolagem infinita simples.
- Manter o que a página atual oferece de útil (leia `app/(dashboard)/historico/page.tsx` antes de refazer).

## Aceite
- Em `/demo`: calendário com pontos corretos; navegação de meses; download do `.ics` válido (abra o arquivo e confira BEGIN:VCALENDAR, VEVENT por membro, RRULE); linha do tempo com eventos e filtros; 360 px sem rolagem horizontal.
- `loading.tsx`/`error.tsx`.
- `tsc`, `eslint "app/(dashboard)/agenda" "app/(dashboard)/historico" components/agenda components/historico app/api/agenda`, `npm run build` verdes.
