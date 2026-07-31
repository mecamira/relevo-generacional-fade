-- ============================================================
-- FADE · Relevo Generacional — Schema de Supabase
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- (https://supabase.com → tu proyecto → SQL Editor → New query)
-- ============================================================

-- Cada tabla guarda el objeto completo como JSONB en la columna "data".
-- Esto permite cambiar los campos de la app sin modificar el esquema.

CREATE TABLE IF NOT EXISTS empresas (
  id         TEXT        PRIMARY KEY,
  data       JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compradores (
  id         TEXT        PRIMARY KEY,
  data       JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id         TEXT        PRIMARY KEY,
  data       JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS actas (
  id         TEXT        PRIMARY KEY,
  data       JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para ordenar eficientemente
CREATE INDEX IF NOT EXISTS empresas_created    ON empresas    (created_at DESC);
CREATE INDEX IF NOT EXISTS compradores_created ON compradores (created_at DESC);
CREATE INDEX IF NOT EXISTS matches_created     ON matches     (created_at DESC);
CREATE INDEX IF NOT EXISTS actas_created       ON actas       (created_at DESC);

-- Row Level Security (activa la protección de tablas)
ALTER TABLE empresas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE compradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE actas       ENABLE ROW LEVEL SECURITY;

-- Política: acceso completo con la anon key (herramienta interna)
-- El login de la app protege el acceso; la anon key no es pública.
CREATE POLICY "Allow all" ON empresas    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON compradores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON matches     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON actas       FOR ALL USING (true) WITH CHECK (true);
