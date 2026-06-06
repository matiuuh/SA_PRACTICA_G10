-- Schema: localidades_service
-- Ejecutar como superuser: psql -h <IP> -U postgres -d localidades_service -f localidades_service.sql

GRANT ALL ON SCHEMA public TO localidades_user;

CREATE TABLE "ciudades" (
  "id_ciudad" uuid PRIMARY KEY,
  "nombre" varchar NOT NULL
);

COMMENT ON TABLE "ciudades" IS 'Ciudades disponibles';

CREATE TABLE "cines" (
  "id_cine" uuid PRIMARY KEY,
  "nombre" varchar NOT NULL,
  "direccion" varchar NOT NULL,
  "id_ciudad" uuid NOT NULL
);

COMMENT ON TABLE "cines" IS 'Complejos cinematograficos';

ALTER TABLE "cines"
  ADD CONSTRAINT "ciudad_cine"
  FOREIGN KEY ("id_ciudad") REFERENCES "ciudades" ("id_ciudad")
  DEFERRABLE INITIALLY IMMEDIATE;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO localidades_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO localidades_user;
