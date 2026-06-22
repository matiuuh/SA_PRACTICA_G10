BEGIN;

CREATE TABLE IF NOT EXISTS "incidencias" (
  "id_incidencia" uuid PRIMARY KEY,
  "usuario_id_externo" uuid NOT NULL,
  "tipo" varchar(20) NOT NULL,
  "asunto" varchar(120) NOT NULL,
  "descripcion" varchar(1000) NOT NULL,
  "estado" varchar(20) NOT NULL DEFAULT 'PENDIENTE',
  "respuesta" varchar(1000),
  "administrador_id_externo" uuid,
  "fecha_creacion" timestamp NOT NULL DEFAULT NOW(),
  "fecha_respuesta" timestamp,
  CONSTRAINT "ck_incidencias_tipo"
    CHECK ("tipo" IN ('PROBLEMA', 'SUGERENCIA', 'OTRO')),
  CONSTRAINT "ck_incidencias_estado"
    CHECK ("estado" IN ('PENDIENTE', 'RESPONDIDA'))
);

CREATE INDEX IF NOT EXISTS "ix_incidencias_usuario_fecha"
  ON "incidencias" ("usuario_id_externo", "fecha_creacion" DESC);

CREATE INDEX IF NOT EXISTS "ix_incidencias_estado_fecha"
  ON "incidencias" ("estado", "fecha_creacion" DESC);

COMMIT;
