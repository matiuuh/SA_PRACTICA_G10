BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "ix_boletos_estado"
  ON "boletos" ("estado");

CREATE INDEX IF NOT EXISTS "ix_boletos_titulo_pelicula_trgm"
  ON "boletos"
  USING gin (LOWER("titulo_pelicula") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "ix_boletos_codigo_qr_trgm"
  ON "boletos"
  USING gin (LOWER("codigo_qr") gin_trgm_ops);

COMMIT;
