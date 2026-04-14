-- ═══════════════════════════════════════════════════════
-- SpotiFamília — Schema SQL
-- Cole isso no SQL Editor do seu projeto Supabase
-- ═══════════════════════════════════════════════════════

-- Tabela de membros do plano família
CREATE TABLE IF NOT EXISTS membros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  valor_mensal DECIMAL(10,2) NOT NULL DEFAULT 0,
  dia_vencimento INTEGER NOT NULL DEFAULT 1, -- dia do mês (1-28)
  cor_avatar TEXT,
  ativo BOOLEAN DEFAULT true,
  data_entrada DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pagamentos/cobranças
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membro_id UUID REFERENCES membros(id) ON DELETE CASCADE,
  mes_referencia DATE NOT NULL, -- primeiro dia do mês (ex: 2025-06-01)
  valor DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente' | 'pago' | 'atrasado'
  data_pagamento TIMESTAMPTZ,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Policies (dono vê apenas seus dados)
CREATE POLICY "owner_all_membros" ON membros
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_all_pagamentos" ON pagamentos
  FOR ALL USING (
    membro_id IN (SELECT id FROM membros WHERE user_id = auth.uid())
  );

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_membro ON pagamentos(membro_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mes ON pagamentos(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_membros_user ON membros(user_id);

-- Trigger para updated_at em membros
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS membros_updated_at ON membros;
CREATE TRIGGER membros_updated_at
  BEFORE UPDATE ON membros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
