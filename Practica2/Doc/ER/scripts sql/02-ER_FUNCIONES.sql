CREATE TABLE "categorias" (
  "id_categoria" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

CREATE TABLE "peliculas" (
  "id_pelicula" uuid PRIMARY KEY,
  "titulo" varchar NOT NULL,
  "descripcion" text,
  "duracion" integer NOT NULL,
  "clasificacion" varchar,
  "id_categoria" uuid NOT NULL
);

CREATE TABLE "funciones" (
  "id_funcion" uuid PRIMARY KEY,
  "fecha" date NOT NULL,
  "hora" time NOT NULL,
  "precio" decimal(10,2) NOT NULL,
  "idioma" varchar,
  "formato" varchar,
  "id_pelicula" uuid NOT NULL,
  "id_sala_externa" uuid NOT NULL
);

COMMENT ON TABLE "categorias" IS 'Estreno, Preventa, Reestreno';

COMMENT ON TABLE "peliculas" IS 'Peliculas disponibles';

COMMENT ON TABLE "funciones" IS 'Funciones disponibles; la sala pertenece al servicio de localidades';

ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_categorias" FOREIGN KEY ("id_categoria") REFERENCES "categorias" ("id_categoria") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "funciones" ADD CONSTRAINT "funciones_peliculas" FOREIGN KEY ("id_pelicula") REFERENCES "peliculas" ("id_pelicula") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_duracion_positiva" CHECK ("duracion" > 0);

ALTER TABLE "funciones" ADD CONSTRAINT "funciones_precio_positivo" CHECK ("precio" > 0);
