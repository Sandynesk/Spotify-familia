# Worker: Membros (Gemini)

Projeto: `C:\Users\esmsa\Desktop\Organização\Projetos\Spotify-familia`, um app Next.js 16 + Supabase. **Leia primeiro `docs/app/DESIGN.md` inteiro**: tokens, componentes e regras de trabalho são obrigatórios.

## Seus arquivos (só estes)

- `app/(dashboard)/membros/page.tsx`
- `app/(dashboard)/membros/[id]/page.tsx`, `app/(dashboard)/membros/[id]/DeleteButton.tsx`
- `app/(dashboard)/membros/[id]/editar/page.tsx`, `app/(dashboard)/membros/novo/page.tsx`
- `components/members/MemberForm.tsx`, `MemberStats.tsx`, `PaymentHistory.tsx`
- `components/ui/Input.tsx` (usado só pelo MemberForm)
- novos arquivos em `components/members/` e em `app/(dashboard)/membros/[id]/` (ex.: `ArchiveButton.tsx`, `ArchivedMembers.tsx`)

**Não edite** `components/dashboard/MemberRow.tsx`, que é de outro worker. Você pode usá-lo como está ou criar sua própria linha em `components/members/`.

## Dados e ações

Em `lib/actions/membros.ts`:
- `getMembros()`, `getMembro(id)`, `criarMembro`, `editarMembro`, `deletarMembro` (já existem);
- **novas:** `arquivarMembro(id)`, `reativarMembro(id)`, `getMembrosArquivados()`.

Em `lib/actions/pagamentos.ts`:
- `getPagamentosMembro(id)`, `getPagamentosMesAtual()`, `marcarPago(id)`, `desfazerPagamento(id, mes)`, `atualizarValorPagamento(id, valor)`;
- **nova:** `quitarPendencias(membroId)`.

Leia o JSDoc de cada nova. Elas estão sendo implementadas em paralelo, então use as assinaturas como estão.

## O que construir (mobile first)

1. **Lista `/membros`:**
   - lista dos ativos com status do mês, restilizada;
   - no fim, a seção **"Arquivados (N)"**, recolhível com `<details>` ou equivalente acessível;
   - cada arquivado tem o botão **"Reativar"**, com confirmação em `Sheet`: "Reativar Ana? As cobranças voltam a partir deste mês."
2. **Detalhe `/membros/[id]`:**
   - **Topo:** avatar grande, nome, status do mês e, se houver dívida até o mês atual, a soma "Deve R$ 13,00 (out, nov)" com o botão **"Quitar tudo"** (`Sheet` → `quitarPendencias`).
   - **Ações:** Editar, **Arquivar** (`Sheet`: "Ana sai do plano, mas o histórico fica. Cobranças futuras são removidas.") e Excluir. Excluir continua existindo, mais escondido e vermelho, com confirmação que avisa que apaga todo o histórico.
   - **Membro arquivado** (`ativo === false`): mostre o aviso "Arquivado" e troque Arquivar por Reativar.
   - **Histórico de pagamentos** (`PaymentHistory`):
     - restilize;
     - linhas com toque ≥ 44 px: marcar pago, desfazer e editar valor (já existem);
     - agrupe por ano se ajudar a leitura;
     - o mês atual em destaque.
   - **MemberStats:** restilize em uma faixa compacta (pagos, em aberto, total pago).
   - O link "← Dashboard" do desktop vai para `/dashboard`.
3. **Formulário (novo/editar):**
   - restilize: campos grandes, `inputMode="decimal"` no valor, teclado numérico, labels visíveis, erros por campo;
   - botão de salvar fixo no rodapé no celular, respeitando a safe area;
   - **mantenha a mesma interface de dados** com `criarMembro`/`editarMembro`.

## Evidência de conclusão

Veja a seção "Regras de trabalho" do DESIGN.md e reporte com `worker_done`.
