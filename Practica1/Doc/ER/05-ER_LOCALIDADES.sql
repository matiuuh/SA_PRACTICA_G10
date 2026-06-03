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

COMMENT ON TABLE "ciudades" IS 'Ciudades disponibles';

COMMENT ON TABLE "cines" IS 'Complejos cinematograficos';

ALTER TABLE "cines" ADD CONSTRAINT "ciudad_cine" FOREIGN KEY ("id_ciudad") REFERENCES "ciudades" ("id_ciudad") DEFERRABLE INITIALLY IMMEDIATE;
