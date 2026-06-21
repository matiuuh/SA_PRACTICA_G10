CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "categorias" (
  "id_categoria" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" varchar(100) UNIQUE NOT NULL
);

COMMENT ON TABLE "categorias" IS 'Categorias de clasificacion de peliculas';

CREATE TABLE "tipo_cartelera" (
  "id_tipo_cartelera" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" varchar(100) UNIQUE NOT NULL
);

COMMENT ON TABLE "tipo_cartelera" IS 'Tipos de cartelera como estreno, preventa o reestreno';

CREATE TABLE "salas" (
  "id_sala" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" varchar(100) NOT NULL,
  "capacidad" integer NOT NULL,
  "tipo" varchar(50) NOT NULL DEFAULT '2D',
  "id_cine_externo" uuid NOT NULL
);

COMMENT ON TABLE "salas" IS 'Salas asociadas a cines del servicio de localidades';

CREATE TABLE "peliculas" (
  "id_pelicula" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "titulo" varchar(255) NOT NULL,
  "sinopsis" text,
  "duracion_minutos" integer,
  "poster_url" varchar(500),
  "activa" boolean NOT NULL DEFAULT true,
  "id_categoria" uuid NOT NULL,
  "id_tipo_cartelera" uuid NOT NULL
);

COMMENT ON TABLE "peliculas" IS 'Peliculas disponibles en cartelera';

CREATE TABLE "funciones" (
  "id_funcion" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "fecha" date NOT NULL,
  "hora" time NOT NULL,
  "precio" decimal(10,2) NOT NULL,
  "activa" boolean NOT NULL DEFAULT true,
  "id_pelicula" uuid NOT NULL,
  "id_sala" uuid NOT NULL
);

COMMENT ON TABLE "funciones" IS 'Funciones programadas por sala';

ALTER TABLE "peliculas"
  ADD CONSTRAINT "peliculas_categorias"
  FOREIGN KEY ("id_categoria") REFERENCES "categorias" ("id_categoria")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "peliculas"
  ADD CONSTRAINT "peliculas_tipo_cartelera"
  FOREIGN KEY ("id_tipo_cartelera") REFERENCES "tipo_cartelera" ("id_tipo_cartelera")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "funciones"
  ADD CONSTRAINT "funciones_peliculas"
  FOREIGN KEY ("id_pelicula") REFERENCES "peliculas" ("id_pelicula")
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "funciones"
  ADD CONSTRAINT "funciones_salas"
  FOREIGN KEY ("id_sala") REFERENCES "salas" ("id_sala")
  DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "ux_funciones_sala_fecha_hora_activa"
  ON "funciones" ("id_sala", "fecha", "hora")
  WHERE "activa" = true;
