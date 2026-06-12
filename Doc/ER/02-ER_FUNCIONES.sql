
CREATE TABLE "categorias_peliculas" (
  "id_categoria" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

COMMENT ON TABLE "categorias_peliculas" IS 'Acción, Comedia, Drama, Terror, etc.';


CREATE TABLE "tipos_cartelera" (
  "id_tipo" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

COMMENT ON TABLE "tipos_cartelera" IS 'Estreno, Preventa, Reestreno, Cartelera Normal';


CREATE TABLE "peliculas" (
  "id_pelicula" uuid PRIMARY KEY,
  "titulo" varchar NOT NULL,
  "descripcion" text,
  "duracion" integer NOT NULL,
  "clasificacion" varchar,
  "id_categoria" uuid NOT NULL,
  "id_tipo_cartelera" uuid NOT NULL
);

COMMENT ON TABLE "peliculas" IS 'Peliculas disponibles';


CREATE TABLE "funciones" (
  "id_funcion" uuid PRIMARY KEY,
  "fecha" date NOT NULL,
  "hora" time NOT NULL,
  "precio" decimal NOT NULL,
  "idioma" varchar,
  "formato" varchar,
  "id_pelicula" uuid NOT NULL
);

COMMENT ON TABLE "funciones" IS 'Funciones disponibles por película';


ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_categorias" 
  FOREIGN KEY ("id_categoria") REFERENCES "categorias_peliculas" ("id_categoria") 
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_tipo_cartelera" 
  FOREIGN KEY ("id_tipo_cartelera") REFERENCES "tipos_cartelera" ("id_tipo") 
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "funciones" ADD CONSTRAINT "funciones_peliculas" 
  FOREIGN KEY ("id_pelicula") REFERENCES "peliculas" ("id_pelicula") 
  DEFERRABLE INITIALLY IMMEDIATE;