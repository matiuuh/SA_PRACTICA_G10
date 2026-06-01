CREATE TABLE "plantillas" (
  "id_plantilla" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL,
  "asunto" varchar NOT NULL
);

CREATE TABLE "notificaciones" (
  "id_notificacion" uuid PRIMARY KEY,
  "usuario_id_externo" uuid NOT NULL,
  "correo_destino" varchar NOT NULL,
  "estado" varchar NOT NULL,
  "fecha_envio" timestamp,
  "id_plantilla" uuid NOT NULL
);

COMMENT ON TABLE "plantillas" IS 'Plantillas reutilizables';

COMMENT ON TABLE "notificaciones" IS 'Notificaciones enviadas';

ALTER TABLE "notificaciones" ADD CONSTRAINT "plantilla_notificacion" FOREIGN KEY ("id_plantilla") REFERENCES "plantillas" ("id_plantilla") DEFERRABLE INITIALLY IMMEDIATE;
