# B7 — Ajustes (`/configuracoes`) + Onboarding (`/boas-vindas`)

Leia antes: `docs/app/v2/_REGRAS.md`, `docs/app/v2/DESIGN-V2.md`, `docs/app/v2/B-contratos.md`.
Porta: **3217**.

## Arquivos que são seus
- `app/(dashboard)/configuracoes/**`
- `components/configuracoes/**`
- `app/(dashboard)/boas-vindas/**` (novo)
- `components/onboarding/**` (novo)
- `lib/actions/ajustes.ts` (novo, se precisar)

## `/configuracoes` — estilo Ajustes do iPhone (`ListGroup`/`ListRow`)
Seções:
1. **Plano**: valor do plano (input moeda), vagas (6, informativo), "Dono também paga?" (só informativo para o simulador; guarde em `localStorage`).
2. **Receber**: chave PIX (detecta tipo com `detectarTipoChave` e mostra "CPF", "Telefone", "E-mail", "Aleatória"), nome e cidade do recebedor para o PIX (guarde em `localStorage` se não houver coluna — **não** mude o banco), prévia do QR de teste.
3. **Mensagens**: tom padrão (Gentil/Direto/Divertido — a tela Cobrar lê a mesma chave de `localStorage`: combine o nome `sf:tom-cobranca`), assinatura opcional ("— Sandy"), prévia ao vivo da mensagem.
4. **Reajuste de preço** (feature): "O Spotify mudou o preço?" → `Sheet` com o simulador (`lib/domain/divisao`): novo valor do plano, estratégia (dividir igual / manter proporção), dono paga ou não, prévia por membro (antes → depois, diferença), aplicar a partir do mês atual ou próximo → `reajustarValores` (de `lib/actions/lote.ts`), com confirmação e toast.
5. **Simulador de divisão**: quanto cada um paga com N pessoas (2–6), arredondamento.
6. **Exportar**: CSV de pagamentos (ano) e de membros (`exportarCsv`), download no navegador.
7. **App**: instalar na tela inicial (link para `/mais` ou instrução), refazer a introdução (`/boas-vindas`).
8. **Conta**: e-mail do usuário, Sair (`<form action="/sair" method="post">`). No modo demo: "Recomeçar demonstração" (`/demo/reset`).
- Salvar com feedback (toast) — reaproveite a action existente `lib/actions/configuracoes.ts` (não edite esse arquivo; se precisar de algo novo, crie `lib/actions/ajustes.ts`).

## `/boas-vindas` — onboarding em 4 passos (momento-assinatura: transições suaves entre passos com o símbolo de 6 cápsulas "montando" a cada passo)
1. Boas-vindas: "Organize o Spotify Família sem constrangimento" + 3 benefícios.
2. Quanto custa o seu plano? (valor, com sugestão R$ 40,90) → salva em configurações.
3. Sua chave PIX (opcional, "pular") → salva.
4. Quem está no plano? Adicionar até 5 pessoas rapidamente (nome + valor sugerido pela divisão + dia) numa lista inline → cria membros com a action existente `criarMembro`.
- Fim: "Pronto!" com confete → `/dashboard`.
- Barra de progresso, voltar, pular; funciona no demo.

## Aceite
- Em `/demo`: todas as seções funcionam; reajuste mostra prévia correta e aplica; CSV baixa e abre no Excel com acentos; onboarding cria membros e configura plano; 360 px sem rolagem horizontal.
- `loading.tsx`/`error.tsx`.
- `tsc`, `eslint "app/(dashboard)/configuracoes" "app/(dashboard)/boas-vindas" components/configuracoes components/onboarding`, `npm run build` verdes.
