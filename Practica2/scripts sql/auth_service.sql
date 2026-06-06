-- Schema: auth_service
-- Ejecutar como superuser: psql -h <IP> -U postgres -d auth_service -f auth_service.sql

GRANT ALL ON SCHEMA public TO auth_user;

CREATE TABLE "roles" (
  "id_rol" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

COMMENT ON TABLE "roles" IS 'Roles del sistema';

CREATE TABLE "usuarios" (
  "id_usuario" uuid PRIMARY KEY,
  "nombre" varchar NOT NULL,
  "correo" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "id_rol" uuid NOT NULL
);

COMMENT ON TABLE "usuarios" IS 'Usuarios registrados';

ALTER TABLE "usuarios"
  ADD CONSTRAINT "usuarios_roles"
  FOREIGN KEY ("id_rol") REFERENCES "roles" ("id_rol")
  DEFERRABLE INITIALLY IMMEDIATE;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO auth_user;
