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

CREATE TABLE "perfiles" (
  "id_perfil" uuid PRIMARY KEY,
  "nombre_perfil" varchar NOT NULL,q
  "id_usuario" uuid NOT NULL
);

CREATE TABLE "sesiones" (
  "id_sesion" uuid PRIMARY KEY,
  "token" text NOT NULL,
  "fecha_expiracion" timestamp NOT NULL,
  "id_usuario" uuid NOT NULL
);

COMMENT ON TABLE "roles" IS 'Roles del sistema';

COMMENT ON TABLE "usuarios" IS 'Usuarios registrados';

COMMENT ON TABLE "perfiles" IS 'Multiperfiles por usuario';

COMMENT ON TABLE "sesiones" IS 'Sesiones activas';

ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_roles" FOREIGN KEY ("id_rol") REFERENCES "roles" ("id_rol") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;
