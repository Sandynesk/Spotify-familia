# B9 — Login e Cadastro v2 + porta de entrada do modo demo

Leia antes: `docs/app/v2/_REGRAS.md`, `docs/app/v2/DESIGN-V2.md`, `docs/app/v2/B-contratos.md`.
Porta: **3219**.

## Arquivos que são seus
- `app/(auth)/**` (login, cadastro; pode criar `app/(auth)/layout.tsx` e `recuperar-senha` se fizer sentido com a API do Supabase já usada)
- `components/public/**`
- `components/landing/LandingNav.tsx` e `components/landing/photo/FinalCta.tsx` — **somente** para acrescentar o link "Experimentar sem cadastro" → `/demo` (sem mudar o resto do visual da landing)

## O que fazer
- Telas de login e cadastro no padrão da landing/DESIGN-V2: fundo preto, aurora menta suave atrás, símbolo da marca (`BrandMark`) no topo, título grande ("Bem-vindo de volta" / "Crie sua conta"), cartão glass com os campos, botão primário menta full-width, links secundários. No desktop: layout dividido — à esquerda uma prévia viva do app (uma composição estática bonita de cartões do app: anel de vagas, lista de membros com status — pode reaproveitar componentes de `components/landing/screens/**` só importando), à direita o formulário.
- **"Experimentar sem cadastro"** (botão secundário claro) → `/demo`, nas duas telas.
- Mantenha toda a lógica de auth atual (Supabase client, callback, mensagens de erro em pt-BR). Mostrar/ocultar senha, indicador de força da senha no cadastro, estados de carregando, erros inline acessíveis (`aria-describedby`), `autocomplete` corretos, sem zoom no iOS (fonte ≥ 16 px nos inputs).
- Landing: na nav e no CTA final, ao lado do botão principal, um link discreto "Experimentar sem cadastro".

## Aceite
- `/login` e `/cadastro` bonitos em 390 px e 1440 px; login real continua funcionando (não teste com conta real — só garanta que o código de auth não mudou de comportamento); botão demo leva a `/demo`.
- `tsc`, `eslint "app/(auth)" components/public components/landing/LandingNav.tsx components/landing/photo/FinalCta.tsx`, `npm run build` verdes.
