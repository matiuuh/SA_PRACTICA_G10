CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE "asientos" (
  "id_asiento" uuid PRIMARY KEY,
  "fila" varchar NOT NULL,
  "numero" integer NOT NULL,
  "id_funcion_externa" uuid NOT NULL,
  "estado" varchar(20) NOT NULL DEFAULT 'DISPONIBLE',
  CONSTRAINT "ck_asientos_estado"
    CHECK ("estado" IN ('DISPONIBLE', 'RESERVADO', 'EN_USO'))
);

COMMENT ON TABLE "asientos" IS 'Asientos disponibles por funcion';

CREATE TABLE "estado_reserva" (
  "id_estado" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

COMMENT ON TABLE "estado_reserva" IS 'Temporal, Confirmada, Expirada';

CREATE TABLE "reservas" (
  "id_reserva" uuid PRIMARY KEY,
  "usuario_id_externo" uuid NOT NULL,
  "fecha_reserva" timestamp NOT NULL,
  "fecha_expiracion" timestamp,
  "total" decimal NOT NULL,
  "id_estado" uuid NOT NULL
);

COMMENT ON TABLE "reservas" IS 'Reserva principal';

CREATE TABLE "reserva_detalle" (
  "id_detalle" uuid PRIMARY KEY,
  "id_reserva" uuid NOT NULL,
  "id_asiento" uuid NOT NULL
);

COMMENT ON TABLE "reserva_detalle" IS 'Relacion entre reserva y asientos';

CREATE TABLE "boletos" (
  "id_boleto" uuid PRIMARY KEY,
  "codigo_qr" varchar UNIQUE NOT NULL,
  "fecha_emision" timestamp NOT NULL,
  "estado" varchar(20) NOT NULL DEFAULT 'VALIDO',
  "fecha_uso" timestamp,
  "validado_por" uuid,
  "id_funcion_externa" uuid,
  "id_pelicula_externa" uuid,
  "titulo_pelicula" varchar(255),
  "fecha_funcion" date,
  "hora_funcion" time,
  "sala_nombre" varchar(100),
  "id_reserva" uuid NOT NULL,
  CONSTRAINT "ck_boletos_estado"
    CHECK ("estado" IN ('VALIDO', 'USADO'))
);

COMMENT ON TABLE "boletos" IS 'Boleto generado despues del pago';

CREATE TABLE "incidencias" (
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

COMMENT ON TABLE "incidencias" IS 'Incidencias generales reportadas por usuarios';

ALTER TABLE "reservas"
  ADD CONSTRAINT "reserva_estado"
  FOREIGN KEY ("id_estado") REFERENCES "estado_reserva" ("id_estado")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reserva_detalle"
  ADD CONSTRAINT "detalle_reserva"
  FOREIGN KEY ("id_reserva") REFERENCES "reservas" ("id_reserva")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reserva_detalle"
  ADD CONSTRAINT "detalle_asiento"
  FOREIGN KEY ("id_asiento") REFERENCES "asientos" ("id_asiento")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "boletos"
  ADD CONSTRAINT "boleto_reserva"
  FOREIGN KEY ("id_reserva") REFERENCES "reservas" ("id_reserva")
  DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "ix_reservas_usuario_fecha"
  ON "reservas" ("usuario_id_externo", "fecha_reserva" DESC);

CREATE INDEX "ix_boletos_fecha_emision"
  ON "boletos" ("fecha_emision" DESC);

CREATE INDEX "ix_boletos_estado"
  ON "boletos" ("estado");

CREATE INDEX "ix_boletos_titulo_pelicula_trgm"
  ON "boletos"
  USING gin (LOWER("titulo_pelicula") gin_trgm_ops);

CREATE INDEX "ix_boletos_codigo_qr_trgm"
  ON "boletos"
  USING gin (LOWER("codigo_qr") gin_trgm_ops);

CREATE INDEX "ix_incidencias_usuario_fecha"
  ON "incidencias" ("usuario_id_externo", "fecha_creacion" DESC);

CREATE INDEX "ix_incidencias_estado_fecha"
  ON "incidencias" ("estado", "fecha_creacion" DESC);
