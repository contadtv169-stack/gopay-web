-- GoPay - Criar tabela links no Supabase
-- Execute isso no SQL Editor do seu projeto Supabase

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL,
  description TEXT DEFAULT '',
  gateway TEXT DEFAULT 'pixgo',
  api_key TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  payment_link TEXT,
  qr_code_base64 TEXT,
  qr_image_url TEXT,
  copy_paste TEXT,
  pix_code TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Segurança: RLS ativado
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ver/inserir/atualizar próprios links
CREATE POLICY "Users manage own links"
  ON links FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Função pública para buscar link de pagamento (apenas dados não sensíveis)
CREATE OR REPLACE FUNCTION public.get_payment_link(link_id TEXT)
RETURNS TABLE(id TEXT, amount DOUBLE PRECISION, description TEXT, status TEXT, qr_code_base64 TEXT, qr_image_url TEXT, copy_paste TEXT, pix_code TEXT, payment_link TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, amount, description, status, qr_code_base64, qr_image_url, copy_paste, pix_code, payment_link, created_at
  FROM links WHERE id = link_id;
$$;
