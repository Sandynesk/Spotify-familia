# Contrato: bento (Detalhes + Números)

## Seus arquivos
- `components/landing/Details.tsx` (substituir o stub)
- `components/landing/Numbers.tsx` (substituir o stub)
- Arquivos auxiliares novos com o prefixo `components/landing/Bento*.tsx`

## `Details` (`id="detalhes"`, seção 5 do BRIEF)
`h2` "Pensado nos detalhes." Grade bento no estilo apple.com: cards pretos-acinzentados (`#0b0b0c`), borda `white/[0.06]`, raio de 28px e padding de 28–36px. Cada card tem um título curto (peso 600) + texto de apoio cinza (copy do BRIEF) **e uma mini-ilustração em HTML/CSS** do recurso. Use só a UI recriada, sem imagens, exceto no card da foto.

Layout no desktop (grid de 4 colunas, linhas automáticas):

| card | tamanho | ilustração |
|---|---|---|
| **O ano inteiro numa grade.** | 2×2 | mini grade de 6 membros × 12 meses: quadradinhos verdes (pago), vermelhos (atrasado, uns 3 espalhados) e cinza escuro (meses futuros: dez/2026). Nomes dos membros à esquerda, iniciais dos meses em cima. Embaixo, um mini gráfico de barras de arrecadação por mês. Os quadrados entram em onda (stagger diagonal) ao aparecer. |
| foto `pocket` | 1×2 | `DeviceShot` com `SHOTS.pocket` e `<DashboardScreen moment="inicial" />` encaixado. Sem texto, ou com uma legenda mínima. |
| **Valor de cada um, do seu jeito.** | 1×1 | linha "Vô Zé · R$ 5,00" destacada, e embaixo uma linha "Ana · R$ 7,00" apagada |
| **Vencimento por pessoa.** | 1×1 | chip de calendário grande "10", com "todo dia" |
| **Atrasos em destaque.** | 1×1 | badges "Atrasado" (vermelho) e "Pago" (verde), iguais ao `components/ui/Badge.tsx` |
| **Histórico mês a mês.** | 1×1 | lista set/out/nov com ✓ verde |
| **Por membro.** | 2×1 | avatar + nome + mini histórico de 6 pontos |

- **Mobile:** uma coluna; os cards 2×2 viram 1 coluna com altura natural.
- **Animação:** `Reveal` com stagger por card e um leve scale no hover do card (`motion-safe`), sem mexer no layout.
- Dados: `MEMBERS` e `formatBRL` de `components/landing/data.ts`. Avatares no estilo do `components/ui/Avatar.tsx` (iniciais + cor), recriados localmente; não importe de `components/ui`.
- `DeviceShot` vem de `./photo/DeviceShot` e `SHOTS` de `./photo/shots`; `DashboardScreen` de `./screens/DashboardScreen`. Use só as assinaturas (contratos photo e screens).

## `Numbers` (seção 6)
- Três números enormes lado a lado no desktop, empilhados no mobile:
  - **6**: "vagas sob controle"
  - **1 toque**: "para registrar um pagamento"
  - **0**: "planilhas"
- Tamanho `clamp(64px, 11vw, 168px)`, peso 700, `tracking-[-0.05em]`, `tabular-nums`. O "1 toque" leva o "1" em verde.
- Contagem ao entrar na tela (0 → 6, 0 → 1; o "0" faz 12 → 0). Com reduced-motion, os números aparecem prontos.
- Embaixo, centralizado: "R$ 40,00 por mês, dividido do jeito certo." Calcule o valor com `summaryOf('inicial').aReceber` + `formatBRL`; não escreva o número fixo.
- Sem cards; só tipografia e respiro.

## Critérios de aceite
1. O bento parece apple.com: hierarquia clara, ilustrações precisas e nada genérico.
2. Todos os valores vêm de `data.ts` e batem com o BRIEF.
3. Sem scroll horizontal no mobile.
4. Só funcionalidades reais (BRIEF §2).
