# A3 — Motor de domínio (funções puras) + novas server actions

Leia antes: `docs/app/v2/_REGRAS.md` e `docs/app/v2/DESIGN-V2.md` §1.
Porta para testes: **3203** (provavelmente nem vai precisar).

## Objetivo
Criar a "inteligência" que as novas features vão usar. Tudo **puro, tipado e testado**. As telas serão feitas por outros workers depois, lendo o seu código — então nomeie bem, documente com JSDoc em pt-BR e exporte tipos.

Contexto de dados (não mude o banco): tabelas `membros` (id, nome, email, telefone, valor_mensal, dia_vencimento 1–28, cor_avatar, ativo, data_entrada), `pagamentos` (id, membro_id, mes_referencia 'YYYY-MM-01', valor, status 'pendente'|'pago'|'atrasado', data_pagamento timestamptz|null, observacao), `configuracoes` (valor_plano, chave_pix). Tipos em `types/database.ts`. Utilidades existentes em `lib/utils/*` (date, currency, devedores, relatorio, payments) — leia e reaproveite.

## Arquivos que são seus
- `lib/domain/**` (novo) — funções puras, **somente imports relativos** dentro de `lib/domain` (para os testes rodarem no Node puro)
- `lib/domain/__tests__/**` (novo)
- `lib/actions/insights.ts`, `lib/actions/cobranca.ts`, `lib/actions/lote.ts`, `lib/actions/exportar.ts` (novos)
- `types/domain.ts` (novo)
- `package.json` / `package-lock.json` — **só** para adicionar `qrcode` e `@types/qrcode` (dev). Nada mais.

Não edite os arquivos existentes de `lib/actions/*` nem `lib/utils/*` (outro worker pode mexer neles).

## Módulos
1. `lib/domain/pix.ts` — **PIX copia-e-cola (BR Code EMV)** estático com valor: `gerarPixCopiaECola({ chave, valor, nome, cidade, txid?, descricao? }): string` seguindo o padrão do Banco Central (IDs 00, 26 [GUI `br.gov.bcb.pix`, 01 chave, 02 descrição opcional], 52 `0000`, 53 `986`, 54 valor com 2 casas, 58 `BR`, 59 nome ≤ 25 sem acento, 60 cidade ≤ 15 sem acento, 62 [05 txid, `***` se vazio], 63 CRC16-CCITT-FALSE em hex maiúsculo). Normalize chave (telefone → `+55...`, CPF/CNPJ só dígitos, e-mail minúsculo, aleatória como está). `detectarTipoChave(chave)`. Teste o CRC com um vetor conhecido (calcule o CRC de um payload de exemplo com uma implementação de referência que você escrever no teste e confira que bate; e valide estrutura TLV).
2. `lib/domain/qrcode.ts` (pode usar o pacote `qrcode`; este arquivo é a exceção que importa pacote) — `gerarQrSvg(texto, { margem?, cor?, fundo? }): Promise<string>`.
3. `lib/domain/whatsapp.ts` — `normalizarTelefoneBR(tel): string | null` (E.164 sem `+` para wa.me), `linkWhatsApp(telefone | null, texto): string` (sem telefone → `https://wa.me/?text=`), modelos de mensagem: `type TomMensagem = 'gentil' | 'direto' | 'divertido'`; `gerarMensagemCobranca({ nome, meses: string[], total, chavePix?, pixCopiaECola?, tom, nomeDono? }): string` (pt-BR natural, com meses por extenso tipo "outubro e novembro", total em R$, PIX ao final), `gerarMensagemGrupo(...)` (resumo para o grupo, reaproveite/estenda a ideia de `lib/utils/relatorio.ts`), `gerarMensagemAgradecimento({ nome, mes, valor })` (para mandar junto do recibo).
4. `lib/domain/pontualidade.ts` — para cada pagamento pago: `diasDeAtraso = data_pagamento − vencimento` (vencimento = `mes_referencia` com o dia `dia_vencimento`; negativo = adiantado). Por membro: `scorePontualidade` 0–100 (explique a fórmula no JSDoc; ponderar meses recentes mais), média de dias, % no prazo, `sequenciaAtual` (meses seguidos pagos no prazo), `maiorSequencia`, `selos: Selo[]` (ex.: "Relâmpago" paga antes do vencimento ≥ 3 meses seguidos; "Pontual" sequência ≥ 6; "Em dia" sem nada em aberto; "Fiel" no plano há ≥ 12 meses; "Recuperado" quitou atraso no último mês). Cada selo com `id`, `titulo`, `descricao`, `icone` (nome de ícone lucide como string).
5. `lib/domain/insights.ts` — `serieMensal(pagamentos, meses)` (previsto vs arrecadado por mês), `saldoDoPlano({ valorPlano, previstoMes, arrecadadoMes })` (sobra/falta), `previsaoProximosMeses(membros, n)`, `ranking(membros, pagamentos)`, `resumoDoAno(...)`, `taxaDeRecebimento`, `tempoMedioParaReceber`.
6. `lib/domain/wrapped.ts` — `calcularRetrospectiva({ ano, membros, pagamentos, valorPlano })` → dados para ~7 "cards" de história: total arrecadado, meses fechados 100%, membro mais pontual, pagamento mais rápido (horas após o vencimento/antes), mês mais difícil, quanto você economizou vs pagar tudo sozinho (valorPlano×12 − sua parte), "seu estilo de cobrador" (rótulo divertido derivado dos dados), números para compartilhar.
7. `lib/domain/agenda.ts` — `proximosVencimentos(membros, pagamentos, hoje, dias)` (lista ordenada com status) e `gerarIcs({ membros, ate, nomeCalendario })`: arquivo iCalendar válido (VCALENDAR/VEVENT, RRULE mensal por membro `FREQ=MONTHLY;BYMONTHDAY=<dia>`, VALARM 9h no dia, UID estável, CRLF, dobra de linhas a 75 octetos, escape de vírgula/ponto-e-vírgula).
8. `lib/domain/csv.ts` — `gerarCsv(linhas, colunas)` com `;` como separador (Excel pt-BR), BOM UTF-8, escape correto.
9. `lib/domain/divisao.ts` — simulador: `dividirPlano(valorPlano, pessoas, { donoPaga?: boolean, arredondar?: 'centavo' | 'cima10' })` e `reajuste(membros, novoValorPlano, estrategia: 'igual' | 'proporcional')` → novos valores por membro com diferença (somando exatamente o total, distribuindo centavos).
10. `lib/domain/atividade.ts` — `linhaDoTempo(membros, pagamentos, limite)` → eventos (`pagou`, `entrou`, `atrasou`, `arquivado`...) derivados dos dados, com data, membro, valor; agrupáveis por dia.

## Server actions novas (`'use server'`, usam `createClient()` de `@/lib/supabase/server` e `garantirPagamentos` como as existentes; checam usuário; retornam `{ error }` ou dados; `revalidatePath('/', 'layout')` após mutações)
- `lib/actions/insights.ts`: `getInsightsData(ano?)`, `getRetrospectivaData(ano)`, `getAgendaData()`, `getAtividadeData(limite?)`, `getPontualidadeMembro(membroId)`.
- `lib/actions/cobranca.ts`: `getCobrancaData()` → devedores + telefone + mensagem pronta por tom + PIX copia-e-cola por devedor (se houver chave PIX configurada; nome/cidade do recebedor: use "SpotiFamilia"/"BRASIL" por padrão, documente) + SVG do QR.
- `lib/actions/lote.ts`: `marcarVariosPagos(pagamentoIds: string[])` e `desfazerVarios(pagamentoIds: string[])` (restaura status efetivo), `marcarPagoEm(pagamentoId, dataISO)`, `salvarObservacao(pagamentoId, texto)`, `reajustarValores(itens: { membroId, novoValor }[], { aplicarDesde: 'mesAtual' | 'proximoMes' })` (atualiza `membros.valor_mensal` e cobranças não pagas a partir do mês escolhido). Sempre garanta que os ids pertencem ao usuário (filtre por membros do usuário).
- `lib/actions/exportar.ts`: `exportarCsv(tipo: 'pagamentos' | 'membros', ano?)` → `{ nome, conteudo }`.

## Testes
`lib/domain/__tests__/*.test.ts` com `node:test` + `node:assert/strict`, rodando com `node --test lib/domain/__tests__/` (Node 24 executa TS direto). Cubra: CRC/TLV do PIX, telefone BR, meses por extenso, pontualidade (adiantado/atrasado/sequências), divisão somando exato, ICS (estrutura e dobra), CSV (escape). Todos verdes.

## Critérios de aceite
- `node --test lib/domain/__tests__/` verde; `tsc`, `eslint lib/domain lib/actions types` e `npm run build` verdes.
- Relatório com a assinatura de cada função exportada (1 linha cada).
