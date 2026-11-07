# B2 — Membros (lista, perfil, formulário)

Leia antes: `docs/app/v2/_REGRAS.md`, `docs/app/v2/DESIGN-V2.md`, `docs/app/v2/B-contratos.md`.
Porta: **3212**.

## Arquivos que são seus
- `app/(dashboard)/membros/**` (inclui `novo`, `[id]`, `[id]/editar` e os botões dentro de `[id]`)
- `components/members/**`
- `lib/actions/membros-extra.ts` (novo, se precisar)

## Lista `/membros`
- `PageHeader` "Membros" + subtítulo "4 de 6 vagas ocupadas" + botão "Novo".
- Topo: `SlotsRing` pequeno + barra de busca (filtra por nome) + `SegmentedControl` (Todos · Devendo · Em dia).
- Cartões/linhas: avatar com anel de status, nome, valor mensal, dia de vencimento, **score de pontualidade** (0–100 com mini barra e rótulo: "Pontual", "Às vezes atrasa", "Costuma atrasar") e selos (ícones pequenos com tooltip/aria-label) de `lib/domain/pontualidade`.
- Vagas livres aparecem como cartões fantasma tracejados "Vaga livre · Convidar alguém" → `/membros/novo` (até completar 6, contando o dono como 1 vaga — explique no texto "Você + 5").
- Arquivados: seção recolhível no fim (reaproveite `ArchivedMembers`).
- Desktop: grid 2–3 colunas.

## Perfil `/membros/[id]` (o momento-assinatura é aqui)
- Cabeçalho herói: avatar grande, nome, "no plano desde mar/2025", score de pontualidade num `ProgressRing` grande com `NumberTicker`, selos conquistados em linha (cápsulas com ícone + título).
- Estado atual: "Em dia" ou "Deve R$ 13,64 (out e nov)" com ações: **Cobrar no WhatsApp** (`/cobrar?membro=<id>`), **Marcar mês atual como pago**, **Quitar tudo** (existente), **PIX** (abre `Sheet` com QR + copia-e-cola do valor em aberto, usando `lib/domain/pix` + `qrcode` e a chave das configurações; sem chave → convite para configurar em `/configuracoes`).
- Estatísticas: média de dias (adiantado/atrasado), sequência atual, total pago na vida, meses no plano.
- **Mapa de calor** dos últimos 12 meses (12 quadradinhos: pago no prazo / pago com atraso / em aberto / futuro) com legenda textual.
- Histórico de pagamentos (reaproveite/refaça `PaymentHistory`): cada mês com status, data paga, valor (editável — existente `atualizarValorPagamento`), **observação** (`salvarObservacao`), "marcar pago em outra data" (`marcarPagoEm`, com input de data), desfazer.
- Contato: telefone (link `tel:` e WhatsApp), e-mail (`mailto:`).
- Zona de perigo no fim: Arquivar / Excluir (existentes), com `Sheet` de confirmação.

## Formulário (novo/editar)
- Refeito com `Input` do design system, em seções: Pessoa (nome, telefone com máscara BR, e-mail), Cobrança (valor com prefixo R$ e sugestão "Divisão igual: R$ 6,82" calculada de `lib/domain/divisao` com o valor do plano; dia de vencimento como **seletor de dias** em grade 1–28 tocável), Aparência (cor do avatar com paleta de 8 cores + prévia ao vivo do avatar).
- Validação inline, botão primário fixo no rodapé no celular, toast de sucesso, volta ao perfil.

## Aceite
- Em `/demo`: lista com busca e filtro; perfil com score, selos, mapa de calor, PIX (com a chave demo), observação salva; formulário cria e edita; 360 px sem rolagem horizontal.
- `loading.tsx`/`error.tsx` nas rotas.
- `tsc`, `eslint "app/(dashboard)/membros" components/members`, `npm run build` verdes.
