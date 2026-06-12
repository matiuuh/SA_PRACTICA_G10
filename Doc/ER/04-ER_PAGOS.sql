CREATE TABLE "metodos_pago" (
  "id_metodo" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

CREATE TABLE "pagos" (
  "id_pago" uuid PRIMARY KEY,
  "reserva_id_externa" uuid NOT NULL,
  "monto" decimal NOT NULL,
  "estado" varchar NOT NULL,
  "fecha_pago" timestamp NOT NULL,
  "id_metodo" uuid NOT NULL
);

CREATE TABLE "transacciones" (
  "id_transaccion" uuid PRIMARY KEY,
  "referencia" varchar NOT NULL,
  "autorizacion" varchar,
  "fecha_transaccion" timestamp NOT NULL,
  "id_pago" uuid NOT NULL
);

COMMENT ON TABLE "metodos_pago" IS 'Tipos de pago disponibles';

COMMENT ON TABLE "pagos" IS 'Pago realizado por reserva';

COMMENT ON TABLE "transacciones" IS 'Registro de transacciones';

ALTER TABLE "pagos" ADD CONSTRAINT "pagos_metodo" FOREIGN KEY ("id_metodo") REFERENCES "metodos_pago" ("id_metodo") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "transacciones" ADD CONSTRAINT "transaccion_pago" FOREIGN KEY ("id_pago") REFERENCES "pagos" ("id_pago") DEFERRABLE INITIALLY IMMEDIATE;

-- Defer constraint checking for INSERT
BEGIN;
SET CONSTRAINTS ALL DEFERRED;

INSERT INTO "metodos_pago" ("id_metodo", "nombre")
VALUES
  (CAST('1' AS uuid), 'TARJETA'),
  (CAST('2' AS uuid), 'TRANSFERENCIA');
INSERT INTO "pagos" ("id_pago", "reserva_id_externa", "monto", "estado", "fecha_pago", "id_metodo")
VALUES
  (CAST('100' AS uuid), CAST('RES001' AS uuid), 90, 'APROBADO', '2026-06-01T18:30:00', CAST('1' AS uuid));
INSERT INTO "transacciones" ("id_transaccion", "referencia", "autorizacion", "fecha_transaccion", "id_pago")
VALUES
  (CAST('200' AS uuid), 'TXN-001', 'AUTH123', '2026-06-01T18:30:05', CAST('100' AS uuid));

SET CONSTRAINTS ALL IMMEDIATE;
COMMIT;