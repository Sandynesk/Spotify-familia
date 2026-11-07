# T4-<DONO> — Correções da auditoria (modelo — o CEO preenche)

> **CEO:** copie este arquivo para `docs/landing/specs/runtime/T4-<dono>.md`, troque `<DONO>`, preencha as duas seções marcadas com ✏️ e dispare com `--name t4-<dono>`. Não deixe nenhum `<...>` sem preencher.

Você é um **worker** de front-end, coordenado pelo CEO via Orca. Execute **somente** esta tarefa.

## Leia antes
`docs/landing/contratos/_regras.md`, o contrato do seu dono em `docs/landing/contratos/<dono>.md` (se existir), `docs/landing/PLANO-POLIMENTO.md` §1 (invariantes — **não quebre nenhuma**) e `docs/landing/AUDITORIA.md` (o relatório completo).

## ✏️ Arquivos que você pode editar
```
<copiar da tabela "Mapa de donos" em docs/landing/CEO.md §I, linha do dono>
```
Qualquer outro arquivo é proibido.

## ✏️ Problemas a corrigir (somente estes)
| # | Severidade | Arquivo:linha | Problema | Correção sugerida |
|---|---|---|---|---|
| <copiar do AUDITORIA.md as linhas deste dono que o usuário escolheu corrigir> |

## Regras específicas
- Corrija **só** a lista acima. Não refatore nem "melhore" outras coisas.
- Não mude visual além do necessário para a correção (ex.: contraste → ajuste o mínimo de cor que atinge AA).
- Não mude assinaturas exportadas.
- Não adicione dependências.

## Gate (na sua worktree)
```bash
npm ci < /dev/null   # se não existir node_modules
npx tsc --noEmit < /dev/null
npx eslint components/landing < /dev/null
npm run build < /dev/null
```

## Entrega
1. `git add` só dos arquivos permitidos; `git commit -m "fix(landing): correções da auditoria — <dono> (T4)"`. **Não faça push.**
2. `worker_done`:
```
RESUMO: <o que mudou>
ARQUIVOS: <lista>
CORRIGIDOS: <#s da tabela> | NÃO CORRIGIDOS: <#s + motivo>
EVIDÊNCIAS: tsc ok / eslint ok / build ok
NOTES: <ou "nenhuma">
```
