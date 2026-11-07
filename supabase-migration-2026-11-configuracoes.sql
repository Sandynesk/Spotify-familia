-- ═══════════════════════════════════════════════════════
-- SpotiFamília — Migração: configurações do usuário
-- Rode UMA vez no SQL Editor do Supabase.
-- Guarda quanto você paga ao Spotify (para comparar com o arrecadado)
-- e a sua chave PIX (usada no relatório de cobrança do grupo).
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS configuracoes (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_plano DECIMAL(10,2),           -- quanto a assinatura custa por mês
  chave_pix TEXT,                      -- aparece no relatório do grupo
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_all_configuracoes" ON configuracoes;
CREATE POLICY "owner_all_configuracoes" ON configuracoes
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS configuracoes_updated_at ON configuracoes;
CREATE TRIGGER configuracoes_updated_at
  BEFORE UPDATE ON configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
