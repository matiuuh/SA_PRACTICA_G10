BEGIN;

CREATE INDEX IF NOT EXISTS "ix_reservas_usuario_fecha"
  ON "reservas" ("usuario_id_externo", "fecha_reserva" DESC);

CREATE INDEX IF NOT EXISTS "ix_boletos_fecha_emision"
  ON "boletos" ("fecha_emision" DESC);

COMMIT;
