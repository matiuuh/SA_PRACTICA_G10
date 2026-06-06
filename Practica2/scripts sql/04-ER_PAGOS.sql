CREATE TABLE "metodos_pago" (
  "id_metodo" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

CREATE TABLE "estado_pago" (
  "id_estado" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

CREATE TABLE "pagos" (
  "id_pago" uuid PRIMARY KEY,
  "reserva_id_externa" uuid NOT NULL,
  "monto" decimal(10,2) NOT NULL,
  "fecha_pago" timestamp NOT NULL,
  "id_metodo" uuid NOT NULL,
  "id_estado" uuid NOT NULL
);

CREATE TABLE "transacciones" (
  "id_transaccion" uuid PRIMARY KEY,
  "referencia" varchar UNIQUE NOT NULL,
  "autorizacion" varchar,
  "fecha_transaccion" timestamp NOT NULL,
  "id_pago" uuid NOT NULL
);

COMMENT ON TABLE "metodos_pago" IS 'Tipos de pago disponibles';

COMMENT ON TABLE "estado_pago" IS 'Estados validos del pago';

COMMENT ON TABLE "pagos" IS 'Pago realizado por reserva';

COMMENT ON TABLE "transacciones" IS 'Registro de transacciones';

ALTER TABLE "pagos" ADD CONSTRAINT "pagos_metodo" FOREIGN KEY ("id_metodo") REFERENCES "metodos_pago" ("id_metodo") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pagos" ADD CONSTRAINT "pagos_estado" FOREIGN KEY ("id_estado") REFERENCES "estado_pago" ("id_estado") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "transacciones" ADD CONSTRAINT "transaccion_pago" FOREIGN KEY ("id_pago") REFERENCES "pagos" ("id_pago") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pagos" ADD CONSTRAINT "pagos_monto_positivo" CHECK ("monto" >= 0);

-- Defer constraint checking for INSERT
BEGIN;
SET CONSTRAINTS ALL DEFERRED;

INSERT INTO "metodos_pago" ("id_metodo", "nombre")
VALUES
  ('11111111-1111-1111-1111-111111111111', 'TARJETA'),
  ('22222222-2222-2222-2222-222222222222', 'PAYPAL');

INSERT INTO "estado_pago" ("id_estado", "nombre")
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PENDIENTE'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'APROBADO'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'RECHAZADO');

INSERT INTO "pagos" ("id_pago", "reserva_id_externa", "monto", "fecha_pago", "id_metodo", "id_estado")
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    90.00,
    '2026-06-01T18:30:00',
    '11111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  );

INSERT INTO "transacciones" ("id_transaccion", "referencia", "autorizacion", "fecha_transaccion", "id_pago")
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'TXN-001',
    'AUTH123',
    '2026-06-01T18:30:05',
    '10000000-0000-0000-0000-000000000001'
  );

SET CONSTRAINTS ALL IMMEDIATE;
COMMIT;



