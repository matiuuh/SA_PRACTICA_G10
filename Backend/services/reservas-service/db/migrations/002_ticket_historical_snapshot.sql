BEGIN;

ALTER TABLE "boletos"
  ADD COLUMN IF NOT EXISTS "id_funcion_externa" uuid,
  ADD COLUMN IF NOT EXISTS "id_pelicula_externa" uuid,
  ADD COLUMN IF NOT EXISTS "titulo_pelicula" varchar(255),
  ADD COLUMN IF NOT EXISTS "fecha_funcion" date,
  ADD COLUMN IF NOT EXISTS "hora_funcion" time,
  ADD COLUMN IF NOT EXISTS "sala_nombre" varchar(100);

UPDATE "boletos" AS boleto
SET "id_funcion_externa" = snapshot."id_funcion_externa"
FROM (
  SELECT
    reserva."id_reserva",
    MIN(asiento."id_funcion_externa"::text)::uuid AS "id_funcion_externa"
  FROM "reservas" AS reserva
  INNER JOIN "reserva_detalle" AS detalle
    ON detalle."id_reserva" = reserva."id_reserva"
  INNER JOIN "asientos" AS asiento
    ON asiento."id_asiento" = detalle."id_asiento"
  GROUP BY reserva."id_reserva"
) AS snapshot
WHERE boleto."id_reserva" = snapshot."id_reserva"
  AND boleto."id_funcion_externa" IS NULL;

CREATE INDEX IF NOT EXISTS "ix_boletos_funcion_externa"
  ON "boletos" ("id_funcion_externa");

CREATE INDEX IF NOT EXISTS "ix_boletos_pelicula_externa"
  ON "boletos" ("id_pelicula_externa");

CREATE INDEX IF NOT EXISTS "ix_boletos_fecha_funcion"
  ON "boletos" ("fecha_funcion");

COMMIT;
