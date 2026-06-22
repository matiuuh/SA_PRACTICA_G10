CREATE TABLE "metodos_pago" (
  "id_metodo" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

COMMENT ON TABLE "metodos_pago" IS 'Tipos de pago disponibles';

CREATE TABLE "estado_pago" (
  "id_estado" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

COMMENT ON TABLE "estado_pago" IS 'Estados validos del pago';

CREATE TABLE "pagos" (
  "id_pago" uuid PRIMARY KEY,
  "reserva_id_externa" uuid NOT NULL,
  "monto" decimal(10,2) NOT NULL,
  "fecha_pago" timestamp NOT NULL,
  "id_metodo" uuid NOT NULL,
  "id_estado" uuid NOT NULL
);

COMMENT ON TABLE "pagos" IS 'Pago realizado por reserva';

CREATE TABLE "transacciones" (
  "id_transaccion" uuid PRIMARY KEY,
  "referencia" varchar UNIQUE NOT NULL,
  "autorizacion" varchar,
  "fecha_transaccion" timestamp NOT NULL,
  "id_pago" uuid NOT NULL
);

COMMENT ON TABLE "transacciones" IS 'Registro de transacciones';

ALTER TABLE "pagos"
  ADD CONSTRAINT "pagos_metodo"
  FOREIGN KEY ("id_metodo") REFERENCES "metodos_pago" ("id_metodo")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pagos"
  ADD CONSTRAINT "pagos_estado"
  FOREIGN KEY ("id_estado") REFERENCES "estado_pago" ("id_estado")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pagos"
  ADD CONSTRAINT "pagos_monto_positivo"
  CHECK ("monto" >= 0);

ALTER TABLE "transacciones"
  ADD CONSTRAINT "transaccion_pago"
  FOREIGN KEY ("id_pago") REFERENCES "pagos" ("id_pago")
  DEFERRABLE INITIALLY IMMEDIATE;
