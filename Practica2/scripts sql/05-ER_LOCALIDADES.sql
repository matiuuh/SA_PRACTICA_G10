CREATE TABLE "ciudades" (
  "id_ciudad" uuid PRIMARY KEY,
  "nombre" varchar NOT NULL
);

CREATE TABLE "cines" (
  "id_cine" uuid PRIMARY KEY,
  "nombre" varchar NOT NULL,
  "direccion" varchar NOT NULL,
  "id_ciudad" uuid NOT NULL
);

CREATE TABLE "salas" (
  "id_sala" uuid PRIMARY KEY,
  "nombre" varchar NOT NULL,
  "capacidad" integer NOT NULL,
  "tipo_sala" varchar,
  "id_cine" uuid NOT NULL
);

COMMENT ON TABLE "ciudades" IS 'Ciudades disponibles';

COMMENT ON TABLE "cines" IS 'Complejos cinematograficos';

COMMENT ON TABLE "salas" IS 'Salas fisicas de cada cine';

ALTER TABLE "cines" ADD CONSTRAINT "ciudad_cine" FOREIGN KEY ("id_ciudad") REFERENCES "ciudades" ("id_ciudad") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "salas" ADD CONSTRAINT "salas_cines" FOREIGN KEY ("id_cine") REFERENCES "cines" ("id_cine") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "salas" ADD CONSTRAINT "salas_capacidad_positiva" CHECK ("capacidad" > 0);
