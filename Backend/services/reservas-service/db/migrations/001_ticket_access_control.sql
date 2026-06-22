BEGIN;

ALTER TABLE "asientos"
  ADD COLUMN IF NOT EXISTS "estado" varchar(20) NOT NULL DEFAULT 'DISPONIBLE';

ALTER TABLE "boletos"
  ADD COLUMN IF NOT EXISTS "estado" varchar(20) NOT NULL DEFAULT 'VALIDO',
  ADD COLUMN IF NOT EXISTS "fecha_uso" timestamp,
  ADD COLUMN IF NOT EXISTS "validado_por" uuid;

UPDATE "asientos" AS asiento
SET "estado" = 'RESERVADO'
FROM "reserva_detalle" AS detalle
INNER JOIN "reservas" AS reserva
  ON reserva."id_reserva" = detalle."id_reserva"
INNER JOIN "estado_reserva" AS estado_reserva
  ON estado_reserva."id_estado" = reserva."id_estado"
WHERE detalle."id_asiento" = asiento."id_asiento"
  AND (
    estado_reserva."nombre" = 'CONFIRMADA'
    OR (
      estado_reserva."nombre" = 'TEMPORAL'
      AND (
        reserva."fecha_expiracion" IS NULL
        OR reserva."fecha_expiracion" > NOW()
      )
    )
  )
  AND asiento."estado" = 'DISPONIBLE';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ck_asientos_estado'
  ) THEN
    ALTER TABLE "asientos"
      ADD CONSTRAINT "ck_asientos_estado"
      CHECK ("estado" IN ('DISPONIBLE', 'RESERVADO', 'EN_USO'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ck_boletos_estado'
  ) THEN
    ALTER TABLE "boletos"
      ADD CONSTRAINT "ck_boletos_estado"
      CHECK ("estado" IN ('VALIDO', 'USADO'));
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "ux_boletos_codigo_qr"
  ON "boletos" ("codigo_qr");

COMMIT;
