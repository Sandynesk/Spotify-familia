# Brief — landing page SpotiFamília

Fonte única de verdade para copy, dados e tom. Todos os agentes usam **exatamente** o que está aqui.

## 1. Essência

- **O que é:** um painel para quem administra um Plano Família do Spotify. Mostra quem já pagou, quem falta, quanto entra no mês e o histórico.
- **Para quem:** o dono do plano, que hoje cobra os outros por mensagem e controla tudo de cabeça ou numa planilha.
- **Promessa:** *ninguém esquece de pagar, e você não precisa ficar cobrando.*
- **Tom:** keynote de lançamento. Frases curtas, declarativas e confiantes, que soem naturais em pt-BR. Nada de exclamação em excesso, emoji ou jargão de "startup".
- **Fonte:** **Geist** (Google Fonts via `next/font`), aplicada **só no wrapper da landing**. O resto do sistema continua com a Outfit. Títulos em 700–800 com tracking de cerca de -0,035em; texto corrido em 400; números com `tabular-nums`.
- **Visual:** fundo preto profundo (`#000` nas seções-palco, `#0a0a0a`/`#121212` nas transições), tipografia enorme e com tracking negativo, verde `#1DB954` só como destaque (palavra-chave, brilho, estado "pago"). Vermelho `#E22134` só para "atrasado".

## 2. O que o app faz de verdade (só isto pode aparecer)

1. Cadastro de membros com nome, e-mail, telefone, **valor mensal individual**, **dia de vencimento** (1–28) e cor do avatar.
2. Cobranças mensais criadas automaticamente para cada membro.
3. Status de cada cobrança: **pendente**, **pago** ou **atrasado**.
4. **Marcar como pago com um toque** na lista do painel.
5. Painel do mês com quatro números (membros ativos, a receber, já pago, em atraso) e uma barra de progresso da arrecadação ("Arrecadação completa" ao chegar a 100%).
6. Página de cada membro com seu histórico de pagamentos.
7. **Histórico** mês a mês.
8. **Visão geral** do ano: uma grade estilo calendário (membros × meses) e gráficos.

**Não prometer:** lembretes automáticos, envio de cobrança por WhatsApp ou e-mail, Pix integrado, app nativo, acesso para os membros, integração com o Spotify. Nada disso existe.

## 3. Dados fictícios (usar em todas as telas e números)

Mês de referência: **novembro de 2026**. Vencimento padrão: **dia 10**.

| Membro | Cor do avatar | Valor | Status no hero |
|---|---|---|---|
| Ana | `#1DB954` | R$ 7,00 | pago |
| Bruno | `#509BF5` | R$ 7,00 | pago |
| Carla | `#F59B23` | R$ 7,00 | **pendente** |
| Diego | `#AF2896` | R$ 7,00 | **atrasado** |
| Elisa | `#E8115B` | R$ 7,00 | pago |
| Vô Zé | `#8D67AB` | R$ 5,00 | pago |

Totais derivados (conferidos, não alterar). Como no app real, o card **"A receber"** mostra o **total do mês** (sempre R$ 40,00) e a barra mostra `já pago de total`:

| Momento | Membros ativos | A receber | Já pago | Em atraso | Barra |
|---|---|---|---|---|---|
| Estado inicial (hero) | 6 | R$ 40,00 | R$ 26,00 | R$ 7,00 | 65% · R$ 26,00 de R$ 40,00 |
| Seção 3, após Carla pagar | 6 | R$ 40,00 | R$ 33,00 | R$ 7,00 | 83% · R$ 33,00 de R$ 40,00 |
| Seção 3, após Diego pagar | 6 | R$ 40,00 | R$ 40,00 | R$ 0,00 ("tudo ok") | 100% · "Arrecadação completa!" |

Formato de moeda: `R$ 7,00` (vírgula decimal, espaço depois de `R$`).

## 4. Copy por seção

### Nav
Marca **SpotiFamília** · links: `Como funciona` · `Detalhes` · botão `Entrar` (`/login`) · botão destaque `Começar grátis` (`/login?tab=register`).

### 1. Hero (palco 3D)
- Eyebrow: `SpotiFamília`
- Título: **Plano Família.** / **Finalmente em ordem.** (a segunda linha em verde)
- Subtítulo: `Quem pagou, quem falta e quanto entra, num painel que cabe no bolso.`
- CTAs: `Começar grátis` (primário) · `Ver como funciona ›` (link, âncora `#como-funciona`)
- 3D: o celular sobe girando e para de frente; na tela está o **painel do mês** no estado inicial.

### 2. Seis vagas (`#como-funciona`, seção fixa, 3 etapas)
- Título: **Seis vagas. Uma conta.** / **Zero planilha.**
- Etapa 1: `Cadastre cada pessoa uma vez.` A tela mostra os avatares entrando um a um nas 6 vagas.
- Etapa 2: `Defina quanto cada um paga e o dia do vencimento.` A tela destaca "Vô Zé · R$ 5,00".
- Etapa 3: `Pronto. Todo mês, as cobranças aparecem sozinhas.` A tela mostra a lista de novembro gerada.

### 3. Quem pagou (seção fixa, 3 etapas)
- Título: **Quem pagou?** / **Um toque responde.**
- Etapa 1: `Atrasou? Você vê na hora.` Diego aparece em vermelho e o card "Em atraso" fica em R$ 7,00.
- Etapa 2: `Toque no ✓ e está registrado.` Carla vira "pago", "Já pago" sobe de R$ 26,00 para R$ 33,00 e a barra vai a 83%.
- Etapa 3: `Arrecadação completa.` Diego paga, "Em atraso" zera, "Já pago" chega a R$ 40,00 e a barra a 100%.

### 4. Cada um no seu (foto IA)
- Título: **Cada um ouve no seu.** / **Você organiza num só.**
- Texto: `A família inteira no mesmo plano. O controle, só com você.`
- Imagem `everyone`: o celular do centro mostra o painel; os demais mostram um player de música **genérico** (capas em gradiente, sem marca).

### 5. Detalhes (`#detalhes`, bento)
- Título: **Pensado nos detalhes.**
- Cards:
  1. **Valor de cada um, do seu jeito.** `O Vô Zé paga R$ 5,00? Sem problema.`
  2. **Vencimento por pessoa.** `Cada membro com seu próprio dia.`
  3. **Atrasos em destaque.** `Vermelho quando passa do dia. Verde quando acerta.`
  4. **Histórico mês a mês.** `Tudo registrado, nada se perde.`
  5. **O ano inteiro numa grade.** `Visão geral de membros × meses, com gráficos.` (card grande, com mini grade 6×12)
  6. **Por membro.** `Abra qualquer pessoa e veja o histórico dela.`

### 6. Números
- Três números grandes: **6** `vagas sob controle` · **1 toque** `para registrar um pagamento` · **0** `planilhas`
- Linha final: `R$ 40,00 por mês, dividido do jeito certo.`

### 7. CTA final (foto IA `macro`)
- Título: **Organize seu plano agora.**
- Texto: `Grátis. Sem cartão. Leva um minuto.`
- Botão: `Começar grátis`

### Rodapé
`SpotiFamília` · `Projeto pessoal, sem afiliação com o Spotify.` · `© 2026`

## 5. Regras de marca

- Usar o nome "Spotify" só em texto descritivo ("Plano Família do Spotify") e no aviso do rodapé.
- **Sem logo do Spotify** nas imagens geradas e no 3D. Nada de interface real do Spotify nas telas: o player das fotos é genérico.
- O celular é um flagship genérico em titânio grafite, **sem logo e sem marca**.

## 6. Acessibilidade e movimento

- Todo o conteúdo e todo o texto precisam funcionar **sem o 3D**. O canvas é decorativo (`aria-hidden`); a informação vive no HTML.
- Com `prefers-reduced-motion`: sem seções fixas animadas e sem rotação. Cada etapa aparece como bloco estático, com a imagem de reserva no lugar do 3D.
- Contraste AA no texto (o cinza de apoio mínimo é `#B3B3B3` sobre preto).
