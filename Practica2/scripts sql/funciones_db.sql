-- Schema: funciones_db
-- Ejecutar como superuser: psql -h <IP> -U postgres -d funciones_db -f funciones_db.sql

GRANT ALL ON SCHEMA public TO funciones_user;

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

COMMENT ON TABLE "cines" IS 'Cines por ciudad';

CREATE TABLE "salas" (
  "id_sala" uuid PRIMARY KEY,
  "nombre" varchar NOT NULL,
  "capacidad" integer NOT NULL,
  "tipo_sala" varchar,
  "id_cine" uuid NOT NULL
);

COMMENT ON TABLE "salas" IS 'Salas de cada cine';

CREATE TABLE "categorias" (
  "id_categoria" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

COMMENT ON TABLE "categorias" IS 'Estreno, Preventa, Reestreno';

CREATE TABLE "peliculas" (
  "id_pelicula" uuid PRIMARY KEY,
  "titulo" varchar NOT NULL,
  "descripcion" text,
  "duracion" integer NOT NULL,
  "clasificacion" varchar,
  "id_categoria" uuid NOT NULL
);

COMMENT ON TABLE "peliculas" IS 'Peliculas disponibles';

CREATE TABLE "funciones" (
  "id_funcion" uuid PRIMARY KEY,
  "fecha" date NOT NULL,
  "hora" time NOT NULL,
  "precio" decimal NOT NULL,
  "idioma" varchar,
  "formato" varchar,
  "id_pelicula" uuid NOT NULL,
  "id_sala" uuid NOT NULL
);

COMMENT ON TABLE "funciones" IS 'Funciones disponibles';

ALTER TABLE "cines"
  ADD CONSTRAINT "cines_ciudades"
  FOREIGN KEY ("id_ciudad") REFERENCES "ciudades" ("id_ciudad")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "salas"
  ADD CONSTRAINT "salas_cines"
  FOREIGN KEY ("id_cine") REFERENCES "cines" ("id_cine")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "peliculas"
  ADD CONSTRAINT "peliculas_categorias"
  FOREIGN KEY ("id_categoria") REFERENCES "categorias" ("id_categoria")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "funciones"
  ADD CONSTRAINT "funciones_peliculas"
  FOREIGN KEY ("id_pelicula") REFERENCES "peliculas" ("id_pelicula")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "funciones"
  ADD CONSTRAINT "funciones_salas"
  FOREIGN KEY ("id_sala") REFERENCES "salas" ("id_sala")
  DEFERRABLE INITIALLY IMMEDIATE;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO funciones_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO funciones_user;
