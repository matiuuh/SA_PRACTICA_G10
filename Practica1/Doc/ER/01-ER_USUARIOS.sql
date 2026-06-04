CREATE TABLE "roles" (
  "id_rol" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

CREATE TABLE "usuarios" (
  "id_usuario" uuid PRIMARY KEY,
  "nombre" varchar NOT NULL,
  "correo" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "id_rol" uuid NOT NULL
);



COMMENT ON TABLE "roles" IS 'Roles del sistema';

COMMENT ON TABLE "usuarios" IS 'Usuarios registrados';


ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_roles" FOREIGN KEY ("id_rol") REFERENCES "roles" ("id_rol") DEFERRABLE INITIALLY IMMEDIATE;
