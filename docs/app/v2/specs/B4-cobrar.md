# B4 — Central de Cobrança (`/cobrar`) + recibo compartilhável

Leia antes: `docs/app/v2/_REGRAS.md`, `docs/app/v2/DESIGN-V2.md`, `docs/app/v2/B-contratos.md`.
Porta: **3214**.

## A dor
Cobrar amigos/família é chato e constrangedor; hoje a mensagem é escrita à mão. Aqui o dono resolve **todas** as cobranças do mês em menos de 1 minuto.

## Arquivos que são seus
- `app/(dashboard)/cobrar/**`
- `components/cobranca/**` (novo)
- `components/relatorio/**` (o relatório do grupo atual — pode refazer/migrar para cá; confira com grep quem importa `RelatorioButton` e mantenha o export compilando se outra tela usar)
- `app/api/recibo/**` (novo)
- `lib/actions/cobrar.ts` (novo, se precisar)

## Tela `/cobrar`
- `PageHeader` "Cobrar" + subtítulo "3 pessoas · R$ 27,28 em aberto".
- **Seletor de tom** (`SegmentedControl`): Gentil · Direto · Divertido — muda as mensagens ao vivo (`lib/domain/whatsapp`). Lembra a escolha em `localStorage`.
- **Fila de cobrança** (momento-assinatura: cartões empilhados tipo "deck", o de cima em destaque; ao enviar, ele desliza para fora e o próximo sobe — com mola; reduced-motion: troca simples): para cada devedor: avatar, nome, meses em aberto, total, prévia da mensagem (editável num textarea), botões:
  - **Enviar no WhatsApp** → abre `linkWhatsApp(telefone, mensagem)` em nova aba; marca o cartão como "cobrado hoje" (guarde em `localStorage` por mês: `{membroId: dataISO}`) e mostra "Cobrado às 21:14".
  - **Copiar mensagem**, **Copiar PIX** (copia-e-cola do valor exato) — feedback "Copiado".
  - **Já pagou** → marca pago (lote do devedor), com Desfazer.
  - Sem telefone: botão vira "Escolher contato no WhatsApp" (wa.me sem número) + link "Adicionar telefone" → `/membros/<id>/editar`.
- `?membro=<id>` abre direto a folha daquele membro (`Sheet`) com mensagem + **QR PIX grande** + copia-e-cola.
- **Mensagem para o grupo**: cartão com o resumo do mês para colar no grupo da família (reaproveite/refaça o relatório atual), botões Copiar e Compartilhar (`navigator.share` quando existir).
- **Sem chave PIX configurada**: aviso discreto com link para `/configuracoes`.
- **Ninguém devendo**: `EmptyState` comemorativo ("Ninguém para cobrar. Que paz.").

## Recibo
- `app/api/recibo/[pagamentoId]/route.tsx` → PNG 1080×1350 com `ImageResponse` (`next/og`): fundo preto com aurora menta, símbolo da marca (desenhe com os paths de `@/components/landing/brand`), "Pagamento recebido", nome, mês por extenso, valor grande, data, "SpotiFamília". Verifique que o pagamento pertence ao usuário logado (ou ao demo) — 404 caso contrário. Fontes: use a padrão do `next/og` ou carregue Geist se o guia do Next permitir de forma simples.
- Na tela, seção "Pagamentos recentes" (últimos 5 pagos) com botão **Enviar recibo**: tenta `navigator.share({ files: [png] , text: gerarMensagemAgradecimento(...) })`; sem suporte → baixa o PNG e copia a mensagem.

## Aceite
- Em `/demo`: fila funciona (enviar abre wa.me com texto correto e telefone normalizado; copiar; já pagou + desfazer); trocar tom muda texto; `?membro=` abre a folha com QR legível; recibo gera PNG válido em `/api/recibo/<id>`; 360 px sem rolagem horizontal.
- `loading.tsx`/`error.tsx`.
- `tsc`, `eslint "app/(dashboard)/cobrar" components/cobranca components/relatorio app/api/recibo`, `npm run build` verdes.
