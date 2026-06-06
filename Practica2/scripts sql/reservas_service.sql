-- Schema: reservas_service
-- Ejecutar como superuser: psql -h <IP> -U postgres -d reservas_service -f reservas_service.sql

GRANT ALL ON SCHEMA public TO reservas_user;

CREATE TABLE "asientos" (
  "id_asiento" uuid PRIMARY KEY,
  "fila" varchar NOT NULL,
  "numero" integer NOT NULL,
  "id_funcion_externa" uuid NOT NULL
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
  "codigo_qr" varchar NOT NULL,
  "fecha_emision" timestamp NOT NULL,
  "id_reserva" uuid NOT NULL
);

COMMENT ON TABLE "boletos" IS 'Boleto generado despues del pago';

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

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO reservas_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO reservas_user;
