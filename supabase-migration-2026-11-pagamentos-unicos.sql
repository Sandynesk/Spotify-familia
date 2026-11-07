-- ═══════════════════════════════════════════════════════
-- SpotiFamília — Migração: uma cobrança por membro por mês
-- Rode UMA vez no SQL Editor do Supabase.
-- Necessária para o app criar automaticamente as cobranças dos meses que faltam.
-- ═══════════════════════════════════════════════════════

-- 1) Conferir se já existem duplicatas (deve retornar 0 linhas).
--    Se retornar algo, NÃO rode o passo 2; resolva as duplicatas antes.
SELECT membro_id, mes_referencia, COUNT(*)
FROM pagamentos
GROUP BY membro_id, mes_referencia
HAVING COUNT(*) > 1;

-- 2) Criar a regra de unicidade.
ALTER TABLE pagamentos
  ADD CONSTRAINT pagamentos_membro_mes_unique UNIQUE (membro_id, mes_referencia);
