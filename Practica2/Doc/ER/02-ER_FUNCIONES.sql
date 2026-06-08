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
  "precio" decimal NOT NULL,
  "idioma" varchar,
  "formato" varchar,
  "id_pelicula" uuid NOT NULL,
  "id_sala" uuid NOT NULL
);





COMMENT ON TABLE "categorias" IS 'Estreno, Preventa, Reestreno';

COMMENT ON TABLE "peliculas" IS 'Peliculas disponibles';

COMMENT ON TABLE "funciones" IS 'Funciones disponibles';


ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_categorias" FOREIGN KEY ("id_categoria") REFERENCES "categorias" ("id_categoria") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "funciones" ADD CONSTRAINT "funciones_peliculas" FOREIGN KEY ("id_pelicula") REFERENCES "peliculas" ("id_pelicula") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "funciones" ADD CONSTRAINT "funciones_salas" FOREIGN KEY ("id_sala") REFERENCES "salas" ("id_sala") DEFERRABLE INITIALLY IMMEDIATE;
