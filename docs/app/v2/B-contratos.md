# Fase B — contratos entre telas (todos os workers da fase B leem)

A fase A já está na `app/v2`: design system (`components/ui`, veja `components/ui/index.ts` e a vitrine `/kit`), modo demo (`/demo`), motor de domínio (`lib/domain/**`, `lib/actions/{insights,cobranca,lote,exportar}.ts`) e PWA. **Leia esses arquivos antes de codar** e use-os — não reimplemente PIX, WhatsApp, pontualidade, ICS, CSV, divisão etc.

## Mapa de rotas (não invente outras sem avisar)
| Rota | Dono | Conteúdo |
|---|---|---|
| `/dashboard` | B1 | **Hoje** |
| `/membros`, `/membros/novo`, `/membros/[id]`, `/membros/[id]/editar` | B2 | Membros |
| `/visao-geral` | B3 | **Insights** (título da página: "Insights") |
| `/cobrar` | B4 | Central de Cobrança. Aceita `?membro=<id>` (abre direto a folha daquele membro) |
| `/api/recibo/[pagamentoId]` | B4 | imagem PNG do recibo (`next/og`) |
| `/retrospectiva` | B5 | Retrospectiva anual. Aceita `?ano=AAAA` |
| `/api/retrospectiva/card` | B5 | imagem PNG compartilhável (`next/og`) |
| `/agenda` | B6 | Agenda de vencimentos |
| `/api/agenda/ics` | B6 | download do `.ics` |
| `/historico` | B6 | Linha do tempo de atividade |
| `/configuracoes` | B7 | Ajustes (plano, PIX, mensagens, reajuste, exportar, dados) |
| `/boas-vindas` | B7 | Onboarding em passos |
| `/mais` | B8 | Hub do celular (links para tudo + instalar app + sair) |
| `/login`, `/cadastro` | B9 | Autenticação |

## Links entre telas (use exatamente)
- Cobrar um membro: `/cobrar?membro=<id>`
- Perfil do membro: `/membros/<id>`
- Novo membro: `/membros/novo`
- Primeira vez (0 membros): o **Hoje** mostra um convite para `/boas-vindas`.
- Retrospectiva: `/retrospectiva` (B1 e B3 podem mostrar um cartão-convite em dezembro/janeiro ou sempre que houver ≥ 3 meses de dados).

## Ações (server actions)
- Use as existentes em `lib/actions/*` e as da fase A. Se precisar de uma ação NOVA, crie **somente** no arquivo que a sua spec indicar (ex.: `lib/actions/hoje.ts` para B1). Não edite arquivos de ação de outros.
- Toda mutação: estado de carregando, toast de resultado, e **Desfazer** quando reversível (`useToast().show({ action })`).

## Qualidade visual (o CEO revisa por print em 390 px e 1440 px, no modo demo)
- Use `PageHeader` (título grande), `Card`, `ListGroup/ListRow`, `StatusBadge`, `NumberTicker`, `ProgressRing`, `SegmentedControl`, `EmptyState`, `Skeleton`, `Sheet`, `SwipeRow`.
- **Um** momento-assinatura por tela (DESIGN-V2 §2.2).
- Desktop: aproveite a largura com grid de 2–3 colunas (`lg:grid-cols-…`) — nada de coluna de celular esticada no meio.
- `loading.tsx` com skeleton da forma final em cada rota sua; `error.tsx` amigável com "Tentar de novo".

## Teste
`npx next dev -p <sua porta>` → `http://localhost:<porta>/demo` → navegue até a sua tela. Teste 390 px e 1440 px. Pare o servidor ao terminar.
